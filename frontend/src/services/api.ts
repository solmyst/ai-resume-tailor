// API service for connecting to the backend
const API_BASE = "/api"; // Use Vite proxy for local dev

export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
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
  tailored_experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  recommended_skills: string[];
  match_score: number;
}

export const apiService = {
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error("API not healthy");
    return res.json();
  },
  analyzeJob: async (text: string) => {
    const res = await fetch(`${API_BASE}/analyze-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || "Error analyzing job");
    return result.data;
  },
  tailorResume: async (resume: any, analysis: any) => {
    const res = await fetch(`${API_BASE}/tailor-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_data: resume, job_analysis: analysis }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || "Error tailoring resume");
    return result.data;
  },
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload-resume`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || 'Error uploading resume');
    return result.data;
  },
};