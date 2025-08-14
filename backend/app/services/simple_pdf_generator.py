from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from ..models.schemas import TailoredResume
import os
from datetime import datetime

class SimplePDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.output_dir = "generated_resumes"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate(self, tailored_resume: TailoredResume) -> str:
        """Generate a simple ATS-optimized PDF resume"""
        
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
        
        # Header
        resume_data = tailored_resume.original_resume
        story.append(Paragraph(f"<b>{resume_data.name}</b>", self.styles['Title']))
        story.append(Paragraph(f"{resume_data.email} | {resume_data.phone or 'N/A'}", self.styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Professional Summary
        story.append(Paragraph("<b>PROFESSIONAL SUMMARY</b>", self.styles['Heading2']))
        story.append(Paragraph(tailored_resume.tailored_summary, self.styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Skills
        story.append(Paragraph("<b>TECHNICAL SKILLS</b>", self.styles['Heading2']))
        skills_text = " • ".join(tailored_resume.recommended_skills)
        story.append(Paragraph(skills_text, self.styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Experience
        story.append(Paragraph("<b>PROFESSIONAL EXPERIENCE</b>", self.styles['Heading2']))
        for exp in tailored_resume.tailored_experience:
            job_header = f"<b>{exp.get('title', '')}</b> | {exp.get('company', '')} | {exp.get('duration', '')}"
            story.append(Paragraph(job_header, self.styles['Normal']))
            story.append(Paragraph(exp.get('description', ''), self.styles['Normal']))
            story.append(Spacer(1, 6))
        
        # Education
        if tailored_resume.original_resume.education:
            story.append(Paragraph("<b>EDUCATION</b>", self.styles['Heading2']))
            for edu in tailored_resume.original_resume.education:
                edu_text = f"<b>{edu.get('degree', '')}</b> | {edu.get('school', '')} | {edu.get('year', '')}"
                story.append(Paragraph(edu_text, self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return filepath