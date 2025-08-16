from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from ..models.schemas import TailoredResume
import os
from datetime import datetime

class SimplePDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.output_dir = "generated_resumes"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate(self, tailored_resume: TailoredResume) -> str:
        """Generate a simple PDF resume"""
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"tailored_resume_{timestamp}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        # Create PDF document
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        
        # Build content
        story = []
        
        # Header
        story.append(Paragraph(f"<b>{tailored_resume.original_resume.name}</b>", self.styles['Title']))
        story.append(Paragraph(f"{tailored_resume.original_resume.email}", self.styles['Normal']))
        if tailored_resume.original_resume.phone:
            story.append(Paragraph(f"{tailored_resume.original_resume.phone}", self.styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Summary
        story.append(Paragraph("<b>PROFESSIONAL SUMMARY</b>", self.styles['Heading2']))
        story.append(Paragraph(tailored_resume.tailored_summary, self.styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Skills
        if tailored_resume.recommended_skills:
            story.append(Paragraph("<b>TECHNICAL SKILLS</b>", self.styles['Heading2']))
            skills_text = " • ".join(tailored_resume.recommended_skills)
            story.append(Paragraph(skills_text, self.styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Experience
        if tailored_resume.tailored_experience:
            story.append(Paragraph("<b>PROFESSIONAL EXPERIENCE</b>", self.styles['Heading2']))
            for exp in tailored_resume.tailored_experience:
                job_header = f"<b>{exp.title}</b> | {exp.company} | {exp.duration}"
                story.append(Paragraph(job_header, self.styles['Normal']))
                story.append(Paragraph(exp.description, self.styles['Normal']))
                story.append(Spacer(1, 8))
        
        # Education
        if tailored_resume.original_resume.education:
            story.append(Paragraph("<b>EDUCATION</b>", self.styles['Heading2']))
            for edu in tailored_resume.original_resume.education:
                edu_text = f"<b>{edu.degree}</b> | {edu.school} | {edu.year}"
                story.append(Paragraph(edu_text, self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return filepath