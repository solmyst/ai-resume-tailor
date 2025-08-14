import numpy as np
from typing import Dict, List
from ..models.schemas import TailoredResume, ParsedResume, JobAnalysis
import os
import re

class ResumeTailor:
    def __init__(self):
        # Initialize without heavy dependencies for demo
        pass
    
    def tailor(self, resume_data: ParsedResume, job_analysis: JobAnalysis) -> TailoredResume:
        """Tailor resume based on job analysis"""
        
        # Calculate skill match score
        match_score = self._calculate_match_score(resume_data.skills, job_analysis.required_skills)
        
        # Generate tailored summary
        tailored_summary = self._tailor_summary(resume_data.summary, job_analysis)
        
        # Tailor experience descriptions
        tailored_experience = self._tailor_experience(resume_data.experience, job_analysis)
        
        # Recommend skills to highlight
        recommended_skills = self._recommend_skills(resume_data.skills, job_analysis)
        
        return TailoredResume(
            original_resume=resume_data,
            job_analysis=job_analysis,
            tailored_summary=tailored_summary,
            tailored_experience=tailored_experience,
            recommended_skills=recommended_skills,
            match_score=match_score
        )
    
    def _calculate_match_score(self, resume_skills: List[str], required_skills: List[str]) -> float:
        """Calculate match score between resume and job skills"""
        if not resume_skills or not required_skills:
            return 0.0
        
        # Simple keyword matching approach for demo
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        required_skills_lower = [skill.lower() for skill in required_skills]
        
        matches = 0
        for req_skill in required_skills_lower:
            for res_skill in resume_skills_lower:
                if req_skill in res_skill or res_skill in req_skill:
                    matches += 1
                    break
        
        # Calculate percentage match
        match_score = matches / len(required_skills) if required_skills else 0
        return min(match_score, 1.0)  # Cap at 1.0
    
    def _tailor_summary(self, original_summary: str, job_analysis: JobAnalysis) -> str:
        """Generate tailored professional summary"""
        return self._fallback_summary_tailoring(original_summary, job_analysis)
    
    def _fallback_summary_tailoring(self, original_summary: str, job_analysis: JobAnalysis) -> str:
        """Enhanced summary tailoring method"""
        # Get top skills and experience level
        key_skills = job_analysis.required_skills[:4]
        experience_level = job_analysis.experience_level.lower()
        
        # Create tailored summary based on job requirements
        if key_skills:
            skills_text = ", ".join(key_skills)
            
            if "senior" in experience_level:
                prefix = f"Senior professional with extensive expertise in {skills_text}. "
            elif "junior" in experience_level:
                prefix = f"Motivated developer with strong foundation in {skills_text}. "
            else:
                prefix = f"Experienced professional specializing in {skills_text}. "
            
            # Enhance original summary with job-specific keywords
            enhanced_summary = prefix + original_summary
            
            # Add company values if present
            if job_analysis.company_values:
                values_text = ", ".join(job_analysis.company_values[:2])
                enhanced_summary += f" Passionate about {values_text} and delivering high-quality solutions."
            
            return enhanced_summary
        
        return original_summary
    
    def _tailor_experience(self, experience: List[Dict], job_analysis: JobAnalysis) -> List[Dict]:
        """Tailor experience descriptions to match job requirements"""
        tailored_exp = []
        
        for exp in experience:
            tailored_desc = self._enhance_description(
                exp.get('description', ''), 
                job_analysis.required_skills
            )
            
            tailored_exp.append({
                **exp,
                'description': tailored_desc
            })
        
        return tailored_exp
    
    def _enhance_description(self, description: str, required_skills: List[str]) -> str:
        """Enhance job description with relevant keywords"""
        # Simple approach: add relevant skills if not already mentioned
        enhanced = description
        
        for skill in required_skills[:2]:  # Add top 2 relevant skills
            if skill.lower() not in description.lower():
                enhanced += f" Utilized {skill} for implementation."
        
        return enhanced
    
    def _recommend_skills(self, resume_skills: List[str], job_analysis: JobAnalysis) -> List[str]:
        """Recommend skills to highlight based on job requirements"""
        # Prioritize skills that appear in both resume and job requirements
        matching_skills = []
        
        for job_skill in job_analysis.required_skills:
            for resume_skill in resume_skills:
                if job_skill.lower() in resume_skill.lower() or resume_skill.lower() in job_skill.lower():
                    matching_skills.append(resume_skill)
        
        # Add high-priority job skills not in resume (as suggestions)
        missing_skills = [skill for skill in job_analysis.required_skills[:5] 
                         if not any(skill.lower() in rs.lower() for rs in resume_skills)]
        
        return list(set(matching_skills + missing_skills))