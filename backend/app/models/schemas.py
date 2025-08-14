from pydantic import BaseModel
from typing import List, Optional, Dict

class JobDescription(BaseModel):
    text: str
    company: Optional[str] = None
    position: Optional[str] = None

class ResumeSection(BaseModel):
    title: str
    content: str

class ParsedResume(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    summary: str
    experience: List[Dict]
    education: List[Dict]
    skills: List[str]
    projects: List[Dict]

class JobAnalysis(BaseModel):
    required_skills: List[str]
    preferred_skills: List[str]
    key_responsibilities: List[str]
    company_values: List[str]
    experience_level: str

class TailoredResume(BaseModel):
    original_resume: ParsedResume
    job_analysis: JobAnalysis
    tailored_summary: str
    tailored_experience: List[Dict]
    recommended_skills: List[str]
    match_score: float