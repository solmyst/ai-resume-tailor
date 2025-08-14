import re
from typing import List, Dict
from ..models.schemas import JobAnalysis

class JobAnalyzer:
    def __init__(self):
        # Common skill patterns - expanded for better matching
        self.skill_patterns = [
            r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|Go|Rust|Swift|Kotlin)\b',
            r'\b(?:React|Angular|Vue\.js|Node\.js|Django|Flask|Spring|Express)\b',
            r'\b(?:SQL|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB)\b',
            r'\b(?:AWS|Azure|GCP|Google Cloud|Docker|Kubernetes|Jenkins)\b',
            r'\b(?:Git|GitHub|GitLab|CI/CD|Agile|Scrum|DevOps|Terraform)\b',
            r'\b(?:HTML|CSS|SASS|Bootstrap|Tailwind|jQuery|REST|GraphQL)\b',
            r'\b(?:Machine Learning|AI|TensorFlow|PyTorch|Pandas|NumPy|Scikit-learn)\b'
        ]
        
        # Experience level indicators
        self.experience_indicators = {
            'junior': ['junior', 'entry', 'entry-level', '0-2 years', '1-2 years', 'new grad', 'graduate'],
            'mid': ['mid', 'intermediate', '2-5 years', '3-5 years', '2+ years', '3+ years'],
            'senior': ['senior', 'lead', 'principal', '5+ years', '7+ years', '10+ years', 'expert', 'architect']
        }
    
    def analyze(self, job_text: str) -> JobAnalysis:
        """Analyze job description and extract key information"""
        
        # Extract skills using regex patterns
        required_skills = self._extract_skills(job_text, "required")
        preferred_skills = self._extract_skills(job_text, "preferred")
        
        # Extract responsibilities
        responsibilities = self._extract_responsibilities(job_text)
        
        # Extract company values/culture keywords
        company_values = self._extract_company_values(job_text)
        
        # Determine experience level
        experience_level = self._determine_experience_level(job_text)
        
        return JobAnalysis(
            required_skills=required_skills,
            preferred_skills=preferred_skills,
            key_responsibilities=responsibilities,
            company_values=company_values,
            experience_level=experience_level
        )
    
    def _extract_skills(self, text: str, skill_type: str) -> List[str]:
        """Extract technical skills from job description"""
        skills = []
        
        # Find section containing requirements
        if skill_type == "required":
            pattern = r'(?:requirements?|qualifications?|must have).*?(?=preferred|nice|bonus|\n\n|$)'
        else:
            pattern = r'(?:preferred|nice to have|bonus|plus).*?(?=\n\n|$)'
        
        section_match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        section_text = section_match.group() if section_match else text
        
        # Extract skills using patterns
        for pattern in self.skill_patterns:
            matches = re.findall(pattern, section_text, re.IGNORECASE)
            skills.extend(matches)
        
        return list(set(skills))  # Remove duplicates
    
    def _extract_responsibilities(self, text: str) -> List[str]:
        """Extract key responsibilities from job description"""
        # Look for bullet points or numbered lists
        responsibility_pattern = r'[•\-\*]\s*([^•\-\*\n]+)'
        matches = re.findall(responsibility_pattern, text)
        
        # Clean and filter responsibilities
        responsibilities = []
        for match in matches[:5]:  # Limit to top 5
            clean_resp = match.strip()
            if len(clean_resp) > 20:  # Filter out short/incomplete items
                responsibilities.append(clean_resp)
        
        return responsibilities
    
    def _extract_company_values(self, text: str) -> List[str]:
        """Extract company culture and values keywords"""
        value_keywords = [
            "innovation", "collaboration", "teamwork", "growth", "learning",
            "diversity", "inclusion", "remote", "flexible", "startup",
            "enterprise", "fast-paced", "dynamic"
        ]
        
        found_values = []
        text_lower = text.lower()
        
        for keyword in value_keywords:
            if keyword in text_lower:
                found_values.append(keyword)
        
        return found_values
    
    def _determine_experience_level(self, text: str) -> str:
        """Determine required experience level"""
        text_lower = text.lower()
        
        if any(term in text_lower for term in ["senior", "lead", "principal", "5+ years", "7+ years"]):
            return "Senior"
        elif any(term in text_lower for term in ["mid", "intermediate", "2-4 years", "3+ years"]):
            return "Mid-level"
        elif any(term in text_lower for term in ["junior", "entry", "0-2 years", "new grad"]):
            return "Junior"
        else:
            return "Mid-level"  # Default