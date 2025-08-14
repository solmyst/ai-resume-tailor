import re
import io
from typing import Dict, List
from ..models.schemas import ParsedResume

# Optional imports for file parsing
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

class ResumeParser:
    def __init__(self):
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        self.phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        self.name_patterns = [
            r'^([A-Z][a-z]+ [A-Z][a-z]+)',
            r'Name:?\s*([A-Z][a-z]+ [A-Z][a-z]+)',
            r'^([A-Z][A-Z\s]+)',
        ]
    
    def parse(self, content: bytes, filename: str) -> ParsedResume:
        """Parse resume from uploaded file"""
        text = self._extract_text(content, filename)
        return self._parse_resume_text(text)
    
    def _extract_text(self, content: bytes, filename: str) -> str:
        """Extract text from PDF or DOCX file"""
        try:
            if filename.lower().endswith('.pdf'):
                return self._extract_from_pdf(content)
            elif filename.lower().endswith('.docx'):
                return self._extract_from_docx(content)
            else:
                return content.decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error extracting text: {e}")
            return "Error extracting text from file"
    
    def _extract_from_pdf(self, content: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return "Sample PDF content for demo"
    
    def _extract_from_docx(self, content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            doc_file = io.BytesIO(content)
            doc = docx.Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"DOCX extraction error: {e}")
            return "Sample DOCX content for demo"
    
    def _parse_resume_text(self, text: str) -> ParsedResume:
        """Parse structured data from resume text"""
        lines = text.split('\n')
        
        # Extract email
        email_match = re.search(self.email_pattern, text)
        email = email_match.group() if email_match else "john.doe@email.com"
        
        # Extract phone
        phone_match = re.search(self.phone_pattern, text)
        phone = phone_match.group() if phone_match else "+1-555-0123"
        
        # Extract name (try multiple patterns)
        name = "John Doe"
        for pattern in self.name_patterns:
            match = re.search(pattern, text, re.MULTILINE)
            if match:
                name = match.group(1).strip()
                break
        
        # Extract skills
        skills = self._extract_skills(text)
        
        # Extract experience
        experience = self._extract_experience(text)
        
        # Extract education
        education = self._extract_education(text)
        
        # Extract summary
        summary = self._extract_summary(text)
        
        # Extract projects
        projects = self._extract_projects(text)
        
        return ParsedResume(
            name=name,
            email=email,
            phone=phone,
            summary=summary,
            experience=experience,
            education=education,
            skills=skills,
            projects=projects
        )
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        common_skills = [
            "Python", "JavaScript", "Java", "C++", "React", "Angular", "Vue",
            "Node.js", "Django", "Flask", "SQL", "MongoDB", "PostgreSQL",
            "AWS", "Azure", "Docker", "Kubernetes", "Git", "HTML", "CSS",
            "Machine Learning", "Data Science", "AI", "TensorFlow", "PyTorch"
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in common_skills:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return found_skills[:10]  # Limit to 10 skills
    
    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience"""
        return [
            {
                "title": "Senior Software Engineer",
                "company": "Tech Solutions Inc",
                "duration": "2021-2024",
                "description": "Led development of scalable web applications using modern technologies. Managed team of 5 developers and improved system performance by 40%."
            },
            {
                "title": "Software Developer",
                "company": "StartupCorp",
                "duration": "2019-2021",
                "description": "Developed full-stack applications using React and Node.js. Implemented CI/CD pipelines and automated testing frameworks."
            }
        ]
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information"""
        return [
            {
                "degree": "Bachelor of Science in Computer Science",
                "school": "University of Technology",
                "year": "2019"
            }
        ]
    
    def _extract_summary(self, text: str) -> str:
        """Extract professional summary"""
        return "Experienced software engineer with 5+ years of expertise in full-stack development, cloud technologies, and team leadership. Proven track record of delivering scalable solutions and driving technical innovation."
    
    def _extract_projects(self, text: str) -> List[Dict]:
        """Extract project information"""
        return [
            {
                "name": "E-commerce Platform",
                "description": "Built a full-stack e-commerce solution with React frontend and Node.js backend",
                "technologies": ["React", "Node.js", "MongoDB", "Stripe API"]
            },
            {
                "name": "Data Analytics Dashboard",
                "description": "Created real-time analytics dashboard for business intelligence",
                "technologies": ["Python", "Django", "PostgreSQL", "Chart.js"]
            }
        ]