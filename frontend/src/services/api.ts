// API service for connecting to the backend
const API_BASE_URL = 'http://localhost:8001';

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

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async uploadResume(file: File): Promise<ParsedResume> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async analyzeJob(jobText: string): Promise<JobAnalysis> {
    return this.request<JobAnalysis>('/analyze-job', {
      method: 'POST',
      body: JSON.stringify({ text: jobText }),
    });
  }

  async tailorResume(resumeData: ParsedResume, jobAnalysis: JobAnalysis): Promise<TailoredResume> {
    return this.request<TailoredResume>('/tailor-resume', {
      method: 'POST',
      body: JSON.stringify({
        resume_data: resumeData,
        job_analysis: jobAnalysis,
      }),
    });
  }

  async generatePDF(tailoredResume: TailoredResume): Promise<{ pdf_path: string; download_url: string }> {
    return this.request<{ pdf_path: string; download_url: string }>('/generate-pdf', {
      method: 'POST',
      body: JSON.stringify(tailoredResume),
    });
  }

  async downloadPDF(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/download-pdf/${filename}`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async checkHealth(): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>('/');
  }
}

export const apiService = new ApiService();