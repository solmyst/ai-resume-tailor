export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface JobAnalysis {
  required_skills: string[];
  preferred_skills: string[];
  key_responsibilities: string[];
  company_values: string[];
  experience_level: string;
}

export interface TailoredResume {
  original_resume: ParsedResume;
  job_analysis: JobAnalysis;
  tailored_summary: string;
  tailored_experience: Experience[];
  recommended_skills: string[];
  match_score: number;
}