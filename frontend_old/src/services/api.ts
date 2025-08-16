import axios from 'axios';
import { ParsedResume, JobAnalysis, TailoredResume } from '../types';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const analyzeJob = async (jobDescription: { text: string }) => {
  return api.post('/analyze-job', jobDescription);
};

export const tailorResume = async (resumeData: ParsedResume, jobAnalysis: JobAnalysis) => {
  return api.post('/tailor-resume', { 
    resume_data: resumeData, 
    job_analysis: jobAnalysis 
  });
};

export const generatePDF = async (tailoredResume: TailoredResume) => {
  return api.post('/generate-pdf', tailoredResume);
};

export const downloadPDF = async (filename: string) => {
  const response = await api.get(`/download-pdf/${filename}`, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};