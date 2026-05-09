import os
import google.generativeai as genai
from typing import Dict, List, Optional
import json
import requests

class AIService:
    def __init__(self):
        self.gemini_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')
        
        self.provider = 'none'
        self.available_models = []
        
        # Try Gemini
        if self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                self.provider = 'gemini'
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
        
        # Try Ollama as fallback if no Gemini
        if self.provider == 'none':
            self.available_models = self._get_ollama_models()
            if self.available_models:
                self.provider = 'ollama'
            else:
                self.provider = 'mock'
        
        print(f"AI Service initialized with provider: {self.provider}")

    def _get_ollama_models(self) -> List[str]:
        """Get list of available local models"""
        try:
            response = requests.get(self.ollama_url.replace('/generate', '/tags'), timeout=2)
            if response.status_code == 200:
                models = response.json().get('models', [])
                return [m['name'] for m in models]
            return []
        except:
            return []

    def _call_ollama(self, messages: List[Dict]) -> str:
        """Call local Ollama using Chat API for better context and system steering"""
        if not self.available_models:
            return ""
            
        # Preference order
        preferred = ['llama3.1', 'llama3:latest', 'llama3', 'mistral', 'gemma', 'phi3']
        target_model = self.available_models[0] # Default to first one
        
        for p in preferred:
            if any(p in m for m in self.available_models):
                target_model = [m for m in self.available_models if p in m][0]
                break
                
        try:
            payload = {
                "model": target_model,
                "messages": messages,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0 # Zero temperature for strict structural output
                }
            }
            print(f"--- LOCAL AI START (CHAT) ---")
            print(f"Target Model: {target_model}")
            
            # Use /api/chat endpoint
            chat_url = self.ollama_url.replace('/generate', '/chat')
            response = requests.post(chat_url, json=payload, timeout=300)
            
            print(f"--- LOCAL AI COMPLETE ---")
            return response.json().get('message', {}).get('content', '')
        except Exception as e:
            print(f"Ollama error: {e}")
            return ""

    def _parse_ai_json(self, response_text: str) -> Dict:
        """Robustly parse JSON from AI string"""
        if not response_text:
            return {}
        try:
            # Try direct parse
            return json.loads(response_text)
        except:
            print("Failed to parse JSON directly, attempting block extraction...")
            # Try to find JSON block
            try:
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start != -1 and end != -1:
                    return json.loads(response_text[start:end])
            except Exception as e:
                print(f"Block extraction failed: {e}")
                return {}
        return {}

    def analyze_job(self, job_text: str) -> Dict:
        """Analyze job description to extract key info"""
        print(f"Analyzing job description...")
        
        messages = [
            {"role": "system", "content": "You are a specialized job analysis AI. Output ONLY raw JSON matching the requested schema. No conversational text."},
            {"role": "user", "content": f"Analyze this job description and extract: role, company, required_skills (top 10), key_phrases, summary.\n\nDescription: {job_text[:4000]}"}
        ]

        if self.provider == 'gemini':
            return self._analyze_job_gemini(messages[1]["content"])
        elif self.provider == 'ollama':
            response_text = self._call_ollama(messages)
            result = self._parse_ai_json(response_text)
            return result if result else self._mock_analyze_job(job_text)
        else:
            return self._mock_analyze_job(job_text)

    def tailor_resume(self, resume_text: str, job_text: str) -> Dict:
        """Tailor resume to match job description with high precision"""
        print(f"Beginning deep resume tailoring for Llama 3.1...")
        
        messages = [
            {
                "role": "system", 
                "content": """You are a senior ATS-optimization expert. 
                Your goal is to tailor resumes to specific jobs with BRUTAL honesty and precision.
                
                CRITICAL RULES:
                1. Output MUST be valid JSON.
                2. Do NOT invent experiences or skills that do not exist in the source resume.
                3. If the candidate is a POOR match for the role, you MUST reflect this with a low match_score (e.g. 10-40).
                4. The tailored_text must be clean, professional Markdown. Use clear headings (## Summary, ## Experience).
                5. Use bullet points for all experience. Avoid paragraphs for work history."""
            },
            {
                "role": "user", 
                "content": f"""Tailor this resume for the following job.
                
                RESUME SOURCE:
                {resume_text[:4000]}
                
                JOB DESCRIPTION:
                {job_text[:4000]}
                
                Return JSON with:
                - tailored_text: (Markdown formatted resume)
                - changes_made: (List of specific enhancements)
                - match_score: (Integer 0-100 based on actual skill alignment)
                """
            }
        ]

        if self.provider == 'gemini':
            try:
                response = self.gemini_model.generate_content(messages[1]["content"])
                result = self._parse_ai_json(response.text)
                return result if result else self._mock_tailor_resume(resume_text, job_text)
            except Exception as e:
                print(f"Gemini tailoring error: {e}")
                return self._mock_tailor_resume(resume_text, job_text)
        elif self.provider == 'ollama':
            response_text = self._call_ollama(messages)
            result = self._parse_ai_json(response_text)
            return result if result else self._mock_tailor_resume(resume_text, job_text)
        else:
            return self._mock_tailor_resume(resume_text, job_text)

    def _analyze_job_gemini(self, prompt: str) -> Dict:
        try:
            response = self.gemini_model.generate_content(prompt)
            return self._parse_ai_json(response.text)
        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return {}

    def _mock_analyze_job(self, job_text: str) -> Dict:
        """Basic heuristic analysis when no AI is available"""
        skills = ["Python", "React", "JavaScript", "SQL", "Cloud", "AWS", "API", "Java", "C++", "Node", "Docker"]
        found_skills = [s for s in skills if s.lower() in job_text.lower()]
        
        return {
            "role": "Software Engineer",
            "company": "Target Company",
            "required_skills": found_skills or ["Communication", "Problem Solving"],
            "key_phrases": ["Modern tech stack", "User-centric design"],
            "summary": "This role emphasizes technical proficiency and innovative problem-solving in a dynamic environment."
        }

    def _mock_tailor_resume(self, resume_text: str, job_text: str) -> Dict:
        """Keyword-enhanced restructuring when no AI is available — uses actual resume content"""
        # Extract keywords found in job description
        common_keywords = [
            "Scalability", "Optimization", "Architecture", "Leadership", "Agile", 
            "Impact", "Growth", "Python", "Java", "React", "Node", "SQL", "AWS", 
            "Docker", "Kubernetes", "JavaScript", "TypeScript", "CI/CD", "REST",
            "API", "Cloud", "Machine Learning", "Data", "Testing", "DevOps",
            "Communication", "Collaboration", "Problem Solving"
        ]
        job_lower = job_text.lower()
        resume_lower = resume_text.lower()
        
        # Keywords in job but potentially missing from resume
        job_keywords = [k for k in common_keywords if k.lower() in job_lower]
        matched = [k for k in job_keywords if k.lower() in resume_lower]
        missing = [k for k in job_keywords if k.lower() not in resume_lower]
        
        # Calculate a real match score based on keyword overlap
        if job_keywords:
            match_score = int((len(matched) / len(job_keywords)) * 100)
        else:
            match_score = 50
        
        # Clamp score
        match_score = max(10, min(match_score, 95))

        changes = []
        if matched:
            changes.append(f"Matched keywords: {', '.join(matched)}")
        if missing:
            changes.append(f"Missing from resume: {', '.join(missing)}")
        changes.append("Restructured into clean Markdown sections")

        # Build tailored output using the ACTUAL resume text
        tailored = f"""# Tailored Resume

> This resume was processed using the offline keyword engine. For AI-powered results, start Ollama locally.

{resume_text.strip()}

---

## Keyword Analysis

**Matched with job description:** {', '.join(matched) if matched else 'None detected'}

**Consider adding:** {', '.join(missing) if missing else 'Good coverage'}
"""
        return {
            "tailored_text": tailored,
            "changes_made": changes,
            "match_score": match_score
        }


