import os
import re
import json
import requests
from typing import Dict, List
from openai import OpenAI

# Optional: Gemini support
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False


class AIService:
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY', '')
        self.gemini_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        self.ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')

        self.provider = 'none'
        self.available_models = []
        self.openai_client = None

        self._init_providers()
        print(f"AI Service initialized with provider: {self.provider}")

    def _init_providers(self):
        """Initialize providers in priority order: OpenAI > Gemini > Ollama > Mock"""
        if self.openai_key and self.openai_key != 'your_openai_api_key_here':
            try:
                self.openai_client = OpenAI(api_key=self.openai_key)
                self.openai_client.models.list()
                self.provider = 'openai'
                print("[OK] OpenAI connected successfully")
                return
            except Exception as e:
                print(f"[FAIL] OpenAI init failed: {e}")
                self.openai_client = None

        if HAS_GEMINI and self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                self.provider = 'gemini'
                print("[OK] Gemini connected successfully")
                return
            except Exception as e:
                print(f"[FAIL] Gemini init failed: {e}")

        self.available_models = self._get_ollama_models()
        if self.available_models:
            self.provider = 'ollama'
            print(f"[OK] Ollama connected with models: {self.available_models}")
            return

        self.provider = 'mock'
        print("[WARN] No AI provider available -- using keyword-based mock engine")

    def set_openai_key(self, key: str) -> bool:
        """Hot-swap OpenAI key at runtime"""
        if not key or not key.startswith('sk-'):
            return False
        try:
            client = OpenAI(api_key=key)
            client.models.list()
            self.openai_key = key
            self.openai_client = client
            self.provider = 'openai'
            os.environ['OPENAI_API_KEY'] = key
            print("[OK] OpenAI key updated at runtime -- provider switched to openai")
            return True
        except Exception as e:
            print(f"[FAIL] OpenAI key validation failed: {e}")
            return False

    # -------------------------------------------------
    # OpenAI callers
    # -------------------------------------------------

    def _call_openai_json(self, system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str:
        """Call OpenAI with JSON mode -- for small structured responses (job analysis)."""
        if not self.openai_client:
            return ""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=max_tokens,
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            print(f"OpenAI JSON call error: {e}")
            return ""

    def _call_openai_text(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> str:
        """Call OpenAI in plain text mode -- for full resume rewriting.
        No JSON constraint so the model outputs the complete resume without compression."""
        if not self.openai_client:
            return ""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=max_tokens
            )
            content = response.choices[0].message.content or ""
            tokens_used = response.usage.total_tokens if response.usage else 0
            print(f"[OpenAI] Resume rewrite complete. Tokens: {tokens_used}, Output: {len(content)} chars")
            return content
        except Exception as e:
            print(f"OpenAI text call error: {e}")
            return ""

    # -------------------------------------------------
    # Other provider callers
    # -------------------------------------------------

    def _get_ollama_models(self) -> List[str]:
        try:
            response = requests.get(self.ollama_url.replace('/generate', '/tags'), timeout=2)
            if response.status_code == 200:
                models = response.json().get('models', [])
                return [m['name'] for m in models]
            return []
        except:
            return []

    def _call_ollama(self, messages: List[Dict]) -> str:
        if not self.available_models:
            return ""
        preferred = ['llama3.1', 'llama3:latest', 'llama3', 'mistral', 'gemma', 'phi3']
        target_model = self.available_models[0]
        for p in preferred:
            if any(p in m for m in self.available_models):
                target_model = [m for m in self.available_models if p in m][0]
                break
        try:
            payload = {
                "model": target_model,
                "messages": messages,
                "stream": False,
                "options": {"temperature": 0.3}
            }
            print(f"--- Ollama: {target_model} ---")
            chat_url = self.ollama_url.replace('/generate', '/chat')
            response = requests.post(chat_url, json=payload, timeout=300)
            print("--- Ollama complete ---")
            return response.json().get('message', {}).get('content', '')
        except Exception as e:
            print(f"Ollama error: {e}")
            return ""

    def _parse_ai_json(self, response_text: str) -> Dict:
        if not response_text:
            return {}
        try:
            return json.loads(response_text)
        except:
            try:
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start != -1 and end > start:
                    return json.loads(response_text[start:end])
            except:
                pass
            return {}

    # -------------------------------------------------
    # Helpers
    # -------------------------------------------------

    @staticmethod
    def _truncate(text: str, max_chars: int = 3000) -> str:
        if len(text) <= max_chars:
            return text
        return text[:max_chars] + "\n[...truncated]"

    @staticmethod
    def _compress_whitespace(text: str) -> str:
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        return text.strip()

    # =================================================
    # API: analyze_job
    # =================================================

    def analyze_job(self, job_text: str) -> Dict:
        print(f"Analyzing job ({len(job_text)} chars)...")
        job_compact = self._compress_whitespace(self._truncate(job_text, 2500))

        system = "You extract job info as JSON. Output only valid JSON."
        user = f"Extract: role, company, required_skills (max 8), key_phrases (max 4), summary (1 sentence).\n\nJob:\n{job_compact}"

        if self.provider == 'openai':
            raw = self._call_openai_json(system, user, max_tokens=400)
            result = self._parse_ai_json(raw)
            return result if result else self._mock_analyze_job(job_text)
        elif self.provider == 'gemini':
            return self._analyze_job_gemini(user)
        elif self.provider == 'ollama':
            messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
            raw = self._call_ollama(messages)
            result = self._parse_ai_json(raw)
            return result if result else self._mock_analyze_job(job_text)
        return self._mock_analyze_job(job_text)

    # =================================================
    # API: tailor_resume  (THE MAIN FEATURE)
    # =================================================

    TAILOR_SYSTEM_PROMPT = """You are a professional resume writer and ATS optimization expert.

YOUR TASK: Rewrite the candidate's ENTIRE resume, tailored to the target job description.

OUTPUT FORMAT:
Write the COMPLETE rewritten resume in clean Markdown. Nothing else -- no explanations, no preamble.
At the very end of the resume, append these two metadata lines:

MATCH_SCORE: [integer 0-100]
CHANGES: [what you changed 1] | [what you changed 2] | [what you changed 3]

RESUME STRUCTURE (use exactly this format):

# [Full Name]
[email] | [phone] | [city, state] | [linkedin]

## Professional Summary
[2-3 sentences rewritten to target this specific job role]

## Technical Skills
[Comma-separated. Job-matching skills listed FIRST]

## Professional Experience

### [Job Title] | [Company Name]
[Start - End] | [Location]
- [Rewritten bullet: action verb + achievement + job-relevant keyword + metrics]
- [Each role gets 3-5 bullets minimum]

### [Next Job Title] | [Next Company]
[Dates] | [Location]
- [bullets...]

## Education
### [Degree] | [University]
[Year]

## Projects (if in original)
### [Project Name]
- [Description with job-relevant tech]

## Certifications (if in original)
- [cert name]

RULES:
1. Write the FULL resume -- every section, every job, every bullet point
2. REWRITE bullets to weave in keywords from the job description
3. Use strong action verbs: Led, Developed, Architected, Optimized, Delivered, Implemented
4. Add metrics/numbers wherever possible (even estimates from context)
5. Do NOT invent experiences or skills not present in the original
6. Do NOT skip any jobs from the original resume
7. Do NOT just summarize -- write the complete document ready for PDF export
8. Keep each bullet to 1-2 lines max for clean formatting"""

    def tailor_resume(self, resume_text: str, job_text: str) -> Dict:
        """Rewrite the entire resume tailored to the job description."""
        print(f"=== TAILORING RESUME ===")
        print(f"Resume: {len(resume_text)} chars | Job: {len(job_text)} chars | Provider: {self.provider}")

        resume_compact = self._compress_whitespace(self._truncate(resume_text, 5000))
        job_compact = self._compress_whitespace(self._truncate(job_text, 2500))

        user_prompt = f"""Here is the candidate's current resume:

{resume_compact}

---

Here is the target job description:

{job_compact}

---

Now rewrite the COMPLETE resume tailored to this job. Output the full Markdown resume followed by MATCH_SCORE and CHANGES lines."""

        raw_output = ""

        if self.provider == 'openai':
            raw_output = self._call_openai_text(self.TAILOR_SYSTEM_PROMPT, user_prompt, max_tokens=4000)

        elif self.provider == 'gemini':
            try:
                response = self.gemini_model.generate_content(
                    f"{self.TAILOR_SYSTEM_PROMPT}\n\n{user_prompt}"
                )
                raw_output = response.text or ""
            except Exception as e:
                print(f"Gemini error: {e}")

        elif self.provider == 'ollama':
            messages = [
                {"role": "system", "content": self.TAILOR_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ]
            raw_output = self._call_ollama(messages)

        # Validate output length -- a real resume should be at least 500 chars
        if raw_output and len(raw_output) > 500:
            result = self._parse_tailor_output(raw_output)
            print(f"=== TAILORING COMPLETE === Score: {result['match_score']}%")
            return result

        print(f"[WARN] AI output too short ({len(raw_output)} chars), falling back to mock")
        return self._mock_tailor_resume(resume_text, job_text)

    def _parse_tailor_output(self, raw: str) -> Dict:
        """Parse the plain-text resume + metadata footer into our response dict."""
        match_score = 65
        changes = []
        resume_text = raw.strip()

        # Extract MATCH_SCORE
        score_match = re.search(r'MATCH_SCORE:\s*(\d+)', raw)
        if score_match:
            match_score = min(100, max(0, int(score_match.group(1))))

        # Extract CHANGES
        changes_match = re.search(r'CHANGES:\s*(.+)', raw)
        if changes_match:
            changes = [c.strip() for c in changes_match.group(1).split('|') if c.strip()]

        # Strip metadata lines from the resume body
        resume_text = re.sub(r'\n*MATCH_SCORE:.*', '', resume_text).strip()
        resume_text = re.sub(r'\n*CHANGES:.*', '', resume_text).strip()

        # Strip code fences if the AI wrapped in ```markdown
        resume_text = re.sub(r'^```\w*\n?', '', resume_text)
        resume_text = re.sub(r'\n?```\s*$', '', resume_text)

        if not changes:
            changes = ["Tailored resume to match job description", "Optimized keywords for ATS"]

        return {
            "tailored_text": resume_text,
            "changes_made": changes,
            "match_score": match_score
        }

    # =================================================
    # Gemini helper
    # =================================================

    def _analyze_job_gemini(self, prompt: str) -> Dict:
        try:
            response = self.gemini_model.generate_content(prompt)
            return self._parse_ai_json(response.text)
        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return {}

    # =================================================
    # Mock fallbacks (no AI available)
    # =================================================

    def _mock_analyze_job(self, job_text: str) -> Dict:
        skills = ["Python", "React", "JavaScript", "SQL", "Cloud", "AWS", "API", "Java", "C++", "Node", "Docker"]
        found_skills = [s for s in skills if s.lower() in job_text.lower()]
        return {
            "role": "Software Engineer",
            "company": "Target Company",
            "required_skills": found_skills or ["Communication", "Problem Solving"],
            "key_phrases": ["Modern tech stack", "User-centric design"],
            "summary": "This role emphasizes technical proficiency and innovative problem-solving."
        }

    def _mock_tailor_resume(self, resume_text: str, job_text: str) -> Dict:
        """Keyword-based restructuring when no AI provider is available."""
        common_keywords = [
            "Scalability", "Optimization", "Architecture", "Leadership", "Agile",
            "Impact", "Growth", "Python", "Java", "React", "Node", "SQL", "AWS",
            "Docker", "Kubernetes", "JavaScript", "TypeScript", "CI/CD", "REST",
            "API", "Cloud", "Machine Learning", "Data", "Testing", "DevOps",
            "Communication", "Collaboration", "Problem Solving"
        ]
        job_lower = job_text.lower()
        resume_lower = resume_text.lower()

        job_keywords = [k for k in common_keywords if k.lower() in job_lower]
        matched = [k for k in job_keywords if k.lower() in resume_lower]
        missing = [k for k in job_keywords if k.lower() not in resume_lower]

        if job_keywords:
            match_score = int((len(matched) / len(job_keywords)) * 100)
        else:
            match_score = 50
        match_score = max(10, min(match_score, 95))

        changes = []
        if matched:
            changes.append(f"Matched keywords: {', '.join(matched)}")
        if missing:
            changes.append(f"Missing from resume: {', '.join(missing)}")
        changes.append("Restructured into clean Markdown sections")

        # Build structured markdown from raw resume text
        lines = resume_text.strip().split('\n')
        name = "Candidate"
        contact = ""
        body_lines = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            if name == "Candidate":
                if len(stripped) < 60 and not any(c in stripped.lower() for c in ['@', 'http', 'www']):
                    name = stripped
                    continue
            if not contact and any(c in stripped.lower() for c in ['@', '|', 'phone', 'linkedin', 'github']):
                contact = stripped
                continue
            body_lines.append(stripped)

        sections = [f"# {name}"]
        if contact:
            sections.append(contact)
        sections.append("")
        sections.append("## Professional Summary")
        sections.append(f"Experienced professional with expertise in {', '.join(matched[:5]) if matched else 'relevant technologies'}.")
        sections.append("")

        if matched:
            sections.append("## Skills")
            sections.append(", ".join(matched))
            sections.append("")

        if body_lines:
            sections.append("## Experience")
            for line in body_lines[:40]:
                if len(line) > 3:
                    sections.append(f"- {line}")
            sections.append("")

        if missing:
            sections.append("## Recommendations")
            sections.append(f"Consider highlighting: {', '.join(missing[:8])}")

        tailored = '\n'.join(sections)

        return {
            "tailored_text": tailored,
            "changes_made": changes,
            "match_score": match_score
        }
