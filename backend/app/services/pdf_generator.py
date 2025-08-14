from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import black, blue
from ..models.schemas import TailoredResume
import os
from datetime import datetime

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.output_dir = "generated_resumes"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Custom styles for better formatting
        self.custom_styles = {
            'CustomTitle': ParagraphStyle(
                'CustomTitle',
                parent=self.styles['Heading1'],
                fontSize=18,
                spaceAfter=12,
                alignment=1,  # Center
                textColor=black
            ),
            'SectionHeader': ParagraphStyle(
                'SectionHeader',
                parent=self.styles['Heading2'],
                fontSize=14,
                spaceAfter=8,
                spaceBefore=12,
                textColor=blue,
                borderWidth=1,
                borderColor=blue,
                borderPadding=3
            ),
            'JobTitle': ParagraphStyle(
                'JobTitle',
                parent=self.styles['Normal'],
                fontSize=12,
                spaceAfter=4,
                spaceBefore=8
            ),
            'Contact': ParagraphStyle(
                'Contact',
                parent=self.styles['Normal'],
                fontSize=10,
                alignment=1,
                spaceAfter=12
            )
        }
    
    def generate(self, tailored_resume: TailoredResume) -> str:
        """Generate ATS-optimized PDF resume"""
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"tailored_resume_{timestamp}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        # Create PDF document
        doc = SimpleDocTemplate(filepath, pagesize=letter, 
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=18)
        
        # Build content
        story = []
        
        # Header with name and contact info
        header_elements = self._create_header(tailored_resume.original_resume)
        story.extend(header_elements)
        story.append(Spacer(1, 12))
        
        # Professional Summary
        summary_elements = self._create_section("PROFESSIONAL SUMMARY", 
                                               tailored_resume.tailored_summary)
        story.extend(summary_elements)
        story.append(Spacer(1, 12))
        
        # Skills
        skills_elements = self._create_skills_section(tailored_resume.recommended_skills)
        story.extend(skills_elements)
        story.append(Spacer(1, 12))
        
        # Experience
        exp_elements = self._create_experience_section(tailored_resume.tailored_experience)
        story.extend(exp_elements)
        story.append(Spacer(1, 12))
        
        # Education
        edu_elements = self._create_education_section(tailored_resume.original_resume.education)
        story.extend(edu_elements)
        
        # Build PDF
        doc.build(story)
        
        return filepath
    
    def _create_header(self, resume_data) -> list:
        """Create header with name and contact information"""
        header_text = f"<b>{resume_data.name}</b>"
        contact_text = f"{resume_data.email}"
        if resume_data.phone:
            contact_text += f" | {resume_data.phone}"
        
        return [
            Paragraph(header_text, self.custom_styles['CustomTitle']),
            Paragraph(contact_text, self.custom_styles['Contact'])
        ]
    
    def _create_section(self, title: str, content: str) -> list:
        """Create a section with title and content"""
        return [
            Paragraph(f"<b>{title}</b>", self.custom_styles['SectionHeader']),
            Paragraph(content, self.styles['Normal'])
        ]
    
    def _create_skills_section(self, skills: list) -> list:
        """Create skills section"""
        skills_text = " • ".join(skills)
        
        return [
            Paragraph("<b>TECHNICAL SKILLS</b>", self.custom_styles['SectionHeader']),
            Paragraph(skills_text, self.styles['Normal'])
        ]
    
    def _create_experience_section(self, experience: list) -> list:
        """Create experience section"""
        content = [Paragraph("<b>PROFESSIONAL EXPERIENCE</b>", self.custom_styles['SectionHeader'])]
        
        for exp in experience:
            # Job title and company
            job_header = f"<b>{exp.get('title', '')}</b> | {exp.get('company', '')} | {exp.get('duration', '')}"
            content.append(Paragraph(job_header, self.custom_styles['JobTitle']))
            
            # Job description
            content.append(Paragraph(exp.get('description', ''), self.styles['Normal']))
            content.append(Spacer(1, 8))
        
        return content
    
    def _create_education_section(self, education: list) -> list:
        """Create education section"""
        content = [Paragraph("<b>EDUCATION</b>", self.custom_styles['SectionHeader'])]
        
        for edu in education:
            edu_text = f"<b>{edu.get('degree', '')}</b> | {edu.get('school', '')} | {edu.get('year', '')}"
            content.append(Paragraph(edu_text, self.styles['Normal']))
        
        return content