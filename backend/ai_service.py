import os
import google.generativeai as genai
from typing import Dict, List, Optional
import json

class AIService:
    def __init__(self):
        self.gemini_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        
        self.provider = 'gemini' if self.gemini_key else 'openai' if self.openai_key else 'none'
        print(f"AI Service initialized with provider: {self.provider}")

    def analyze_job(self, job_text: str) -> Dict:
        """Analyze job description to extract key info"""
        if self.provider == 'gemini':
            return self._analyze_job_gemini(job_text)
        # Fallback or other providers can be added here
        return {}

    def tailor_resume(self, resume_text: str, job_text: str) -> Dict:
        """Tailor resume to match job description"""
        if self.provider == 'gemini':
            return self._tailor_resume_gemini(resume_text, job_text)
        return {}

    def _analyze_job_gemini(self, job_text: str) -> Dict:
        prompt = f"""
        Analyze this job description and extract the following in JSON format:
        - role: Job title
        - company: Company name
        - required_skills: List of top 10 technical skills required
        - key_phrases: List of important phrases/soft skills
        - summary: Brief summary of the role (1 sentence)

        Job Description:
        {job_text[:5000]}
        """
        try:
            response = self.gemini_model.generate_content(prompt)
            # Clean up markdown code blocks if present
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return {}

    def _tailor_resume_gemini(self, resume_text: str, job_text: str) -> Dict:
        prompt = f"""
        You are an expert resume writer. Rewrite the following resume to specifically target the job description provided.
        
        Guidelines:
        1. Keep the same structure (Summary, Skills, Experience, Projects, Education).
        2. Use keywords from the job description naturally.
        3. Highlight relevant experience and downplay irrelevant parts.
        4. Improve bullet points to be results-oriented (Action + Context + Result).
        5. Return the result in JSON format with fields: 
           - tailored_text: The full markdown text of the new resume.
           - changes_made: A list of specific changes you made.
           - match_score: An estimated ATS match score (0-100).

        Original Resume:
        {resume_text[:5000]}

        Job Description:
        {job_text[:5000]}
        """
        try:
            response = self.gemini_model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini tailoring error: {e}")
            # Fallback to returning original if parsing fails
            return {
                "tailored_text": resume_text,
                "changes_made": [f"AI generation failed: {str(e)}"],
                "match_score": 0
            }
