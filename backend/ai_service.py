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

        self.GEMINI_SAFETY_SETTINGS = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]

        self._init_providers()
        print(f"AI Service initialized with provider: {self.provider}")

    def _init_providers(self):
        """Initialize providers in priority order: OpenAI > Gemini > Ollama > Mock"""
        if self.openai_key and self.openai_key != 'your_openai_api_key_here':
            try:
                self.openai_client = OpenAI(api_key=self.openai_key)
                self.openai_client.models.list(timeout=5.0)
                self.provider = 'openai'
                print("[OK] OpenAI connected successfully")
                return
            except Exception as e:
                print(f"[FAIL] OpenAI init failed: {e}")
                self.openai_client = None

        if HAS_GEMINI and self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction="You are a professional resume writer and ATS optimization expert."
                )
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
            client.models.list(timeout=5.0)
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

    def _check_moderation(self, text: str) -> bool:
        """Return True if content is safe (not flagged), False otherwise."""
        if not self.openai_client:
            return True
        try:
            response = self.openai_client.moderations.create(input=text)
            return not response.results[0].flagged
        except Exception as e:
            print(f"Moderation check failed: {e}")
            return True

    def _call_openai_json(self, system_prompt: str, user_prompt: str, max_tokens: int = 500, user_id: str = "resume_tailor_user") -> str:
        """Call OpenAI with JSON mode -- for small structured responses (job analysis)."""
        if not self.openai_client:
            return ""
        if not self._check_moderation(user_prompt):
            print("Content flagged by OpenAI moderation API")
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
                response_format={"type": "json_object"},
                user=user_id
            )
            message = response.choices[0].message
            if getattr(message, 'refusal', None):
                print(f"OpenAI request refused: {message.refusal}")
                return ""
            return message.content or ""
        except Exception as e:
            print(f"OpenAI JSON call error: {e}")
            return ""

    def _call_openai_text(self, system_prompt: str, user_prompt: str, max_tokens: int = 4000, user_id: str = "resume_tailor_user") -> str:
        """Call OpenAI in plain text mode -- for full resume rewriting.
        No JSON constraint so the model outputs the complete resume without compression."""
        if not self.openai_client:
            return ""
        if not self._check_moderation(user_prompt):
            print("Content flagged by OpenAI moderation API")
            return ""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=max_tokens,
                user=user_id
            )
            message = response.choices[0].message
            if getattr(message, 'refusal', None):
                print(f"OpenAI request refused: {message.refusal}")
                return ""
            content = message.content or ""
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

    def validate_resume_format(self, text: str) -> (bool, str):
        """
        Validates if the provided text block actually resembles a professional resume.
        Returns a tuple of (is_resume: bool, warning_message: str).
        """
        if not text or not isinstance(text, str):
            return False, "Empty or invalid document text."

        text_clean = text.strip()
        if len(text_clean) < 250:
            return False, f"The uploaded document is too short ({len(text_clean)} characters) to be a valid resume. A typical resume should contain contact information, work history, and skills."

        # Search for standard resume section indicators
        # Use regex with word boundary matching for high accuracy
        has_experience = bool(re.search(
            r'\b(experience|employment|work history|career history|positions held|professional experience|professional background|work experience)\b',
            text_clean, re.IGNORECASE
        ))

        has_education = bool(re.search(
            r'\b(education|academic|university|college|degree|degrees|credentials|certifications)\b',
            text_clean, re.IGNORECASE
        ))

        has_skills = bool(re.search(
            r'\b(skills|technical skills|technologies|proficiencies|core competencies|areas of expertise|languages)\b',
            text_clean, re.IGNORECASE
        ))

        has_summary = bool(re.search(
            r'\b(summary|objective|profile|professional summary|about me|executive summary)\b',
            text_clean, re.IGNORECASE
        ))

        # Check for contact indicators (e.g., an email address)
        has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text_clean))
        
        # Check for phone indicators (e.g. sequence of numbers that looks like a phone number)
        has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text_clean))

        # Calculate a structural completeness score
        structural_matches = sum([has_experience, has_education, has_skills, has_summary])
        has_contact_details = has_email or has_phone

        # A document MUST have either a Work Experience or Education section,
        # and at least two structural sections in total, or a structural section and contact details.
        is_valid_structure = (has_experience or has_education) and (structural_matches >= 2 or (structural_matches >= 1 and has_contact_details))

        if not is_valid_structure:
            issues = []
            if not has_experience:
                issues.append("Missing a Professional Experience / Work History section.")
            if not has_education:
                issues.append("Missing an Education / Academic Background section.")
            if not has_skills and not has_summary:
                issues.append("Missing a Technical Skills or Professional Summary section.")
            if not has_contact_details:
                issues.append("Missing standard contact details (like a professional email address or phone number).")

            warning = "The document does not look like a professional resume. Issues detected:\n" + "\n".join([f"- {issue}" for issue in issues])
            return False, warning

        return True, ""

    # =================================================
    # API: analyze_job
    # =================================================

    def analyze_job(self, job_text: str, user_id: str = "resume_tailor_user") -> Dict:
        print(f"Analyzing job ({len(job_text)} chars)...")
        job_compact = self._compress_whitespace(self._truncate(job_text, 2500))

        system = "You extract job info as JSON. Output only valid JSON."
        user = f"Extract: role, company, required_skills (max 8), key_phrases (max 4), summary (1 sentence).\n\nJob:\n{job_compact}"

        if self.provider == 'openai':
            raw = self._call_openai_json(system, user, max_tokens=400, user_id=user_id)
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

MATCH_SCORE: [integer 0-100 calculated mathematically using the Industry-Standard ATS Weighted System below]
CHANGES: [what you changed 1] | [what you changed 2] | [what you changed 3]

INDUSTRY-STANDARD ATS WEIGHTED SYSTEM FOR MATCH_SCORE:
Calculate the final score out of 100 mathematically by summing these four components:
1. Keyword Match (40% weight): How closely the candidate's technical skills and tools match the core requirements of the job description.
2. Layout & Parsability (30% weight): Structural consistency, clean headings, standard section naming, and easily-parsable bullet points.
3. Quantifiable Accomplishments (20% weight): Percentage of experience bullet points that incorporate specific, measurable metrics (percentages, money, time, numbers).
4. Active Verbs & Impact (10% weight): Commencing bullet points with strong, industry-standard active verbs (e.g. Led, Developed, Architected, Optimized) instead of passive phrasing.
State this score exactly as: MATCH_SCORE: [calculated score]

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

    GENERAL_REVIEW_SYSTEM_PROMPT = """You are a professional resume writer and ATS optimization expert.

YOUR TASK: Evaluate the candidate's ENTIRE resume against general tech industry ATS best practices. Rewrite the resume to improve its impact, action verbs, and structure.

OUTPUT FORMAT:
Write the COMPLETE rewritten resume in clean Markdown. Nothing else.
At the very end of the resume, append these two metadata lines:

MATCH_SCORE: [integer 0-100 calculated mathematically using the Industry-Standard ATS Weighted System below]
CHANGES: [what you changed 1] | [what you changed 2] | [what you changed 3]

INDUSTRY-STANDARD ATS WEIGHTED SYSTEM FOR MATCH_SCORE:
Calculate the final score out of 100 mathematically by summing these four components:
1. Keyword Match (40% weight): Alignment of technical and domain skills to general professional roles in their sector.
2. Layout & Parsability (30% weight): Structural consistency, clean headings, standard section naming, and easily-parsable layouts.
3. Quantifiable Accomplishments (20% weight): Incorportation of percentages, metrics, time frames, and numerical results in bullets.
4. Active Verbs & Impact (10% weight): Starting sentences with strong active verbs (Architected, Designed, Decreased) rather than passive "responsible for" lists.
State this score exactly as: MATCH_SCORE: [calculated score]

RESUME STRUCTURE (use exactly this format):

# [Full Name]
[email] | [phone] | [city, state] | [linkedin]

## Professional Summary
[2-3 impactful sentences summarizing expertise and career trajectory]

## Technical Skills
[Comma-separated tech skills]

## Professional Experience
### [Job Title] | [Company Name]
[Start - End] | [Location]
- [Rewritten bullet: action verb + achievement + metrics/impact]

## Education
### [Degree] | [University]
[Year]

## Projects (if in original)
### [Project Name]
- [Description with tech stack]

RULES:
1. Rewrite the FULL resume -- every section, every job, every bullet point
2. Improve weak bullet points using strong action verbs (Architected, Spearheaded, Optimized) and quantifying achievements.
3. Fix any structural or formatting inconsistencies.
4. Do NOT invent experiences or skills not present in the original.
5. Do NOT skip any jobs from the original resume.
6. Keep each bullet to 1-2 lines max for clean formatting."""

    def tailor_resume(self, resume_text: str, job_text: str, retrieved_context: str = "", user_id: str = "resume_tailor_user") -> Dict:
        """Rewrite the entire resume tailored to the job description, or perform a general review if no job is provided."""
        print(f"=== TAILORING RESUME ===")
        print(f"Resume: {len(resume_text)} chars | Job: {len(job_text)} chars | Provider: {self.provider}")

        # Validate if document resembles a resume before processing
        is_resume, warning = self.validate_resume_format(resume_text)
        if not is_resume:
            print(f"[WARN] Uploaded document failed resume format validation: {warning.splitlines()[0]}")
            formatted_issues = warning.replace("The document does not look like a professional resume. Issues detected:\n", "")
            tailored_warning = (
                f"# ⚠️ Document Validation Warning\n\n"
                f"The document you uploaded does not appear to be a professional resume. "
                f"Please review the structural issues detected below and upload a standard resume containing professional sections.\n\n"
                f"### 📋 Detected Structural Issues:\n"
                f"{formatted_issues}\n\n"
                f"### 💡 Why this is important for your ATS Score:\n"
                f"Applicant Tracking Systems (ATS) and recruiters expect a structured layout containing a chronological career path, "
                f"academic background, and a technical skills matrix. Without these standard segments, parsing engines cannot index your qualifications.\n\n"
                f"**Please upload a document with a standard resume layout to tailored results successfully.**"
            )
            return {
                "tailored_text": tailored_warning,
                "changes_made": ["Flagged invalid resume structure", "Low parsing completeness"],
                "match_score": 10  # Low score due to missing standard sections
            }

        resume_compact = self._compress_whitespace(self._truncate(resume_text, 5000))
        
        if job_text.strip():
            job_compact = self._compress_whitespace(self._truncate(job_text, 2500))
            system_prompt = self.TAILOR_SYSTEM_PROMPT
            user_prompt = f"Here is the candidate's current resume:\n\n{resume_compact}\n\n---\n\nHere is the target job description:\n\n{job_compact}\n\n---\n"
            if retrieved_context:
                user_prompt += f"Here are key relevant accomplishments/highlights from the candidate's history that semantically match the job description requirements (use these to heavily align the rewritten experience and skills):\n\n{retrieved_context}\n\n---\n"
            user_prompt += "Now rewrite the COMPLETE resume tailored to this job. Output the full Markdown resume followed by MATCH_SCORE and CHANGES lines."
        else:
            system_prompt = self.GENERAL_REVIEW_SYSTEM_PROMPT
            user_prompt = f"Here is the candidate's current resume:\n\n{resume_compact}\n\n---\n\nPerform a general ATS optimization and rewrite the COMPLETE resume. Output the full Markdown resume followed by MATCH_SCORE and CHANGES lines."

        raw_output = ""

        if self.provider == 'openai':
            raw_output = self._call_openai_text(system_prompt, user_prompt, max_tokens=4000)

        elif self.provider == 'gemini':
            try:
                response = self.gemini_model.generate_content(
                    f"{system_prompt}\n\n{user_prompt}",
                    safety_settings=self.GEMINI_SAFETY_SETTINGS
                )
                raw_output = response.text or ""
            except Exception as e:
                print(f"Gemini error: {e}")

        elif self.provider == 'ollama':
            messages = [
                {"role": "system", "content": system_prompt},
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
            response = self.gemini_model.generate_content(
                prompt,
                safety_settings=self.GEMINI_SAFETY_SETTINGS
            )
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
        resume_lower = resume_text.lower()
        changes = []
        
        if job_text.strip():
            job_lower = job_text.lower()
            job_keywords = [k for k in common_keywords if k.lower() in job_lower]
            matched = [k for k in job_keywords if k.lower() in resume_lower]
            missing = [k for k in job_keywords if k.lower() not in resume_lower]

            if job_keywords:
                match_score = int((len(matched) / len(job_keywords)) * 100)
            else:
                match_score = 50
                
            if matched:
                changes.append(f"Matched keywords: {', '.join(matched)}")
            if missing:
                changes.append(f"Missing from resume: {', '.join(missing)}")
        else:
            matched = [k for k in common_keywords if k.lower() in resume_lower]
            match_score = int(min(100, (len(matched) / 10) * 100))
            if matched:
                changes.append(f"Detected core skills: {', '.join(matched[:5])}")
            changes.append("Optimized structure for general ATS scanning")
            missing = []

        match_score = max(10, min(match_score, 95))
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
