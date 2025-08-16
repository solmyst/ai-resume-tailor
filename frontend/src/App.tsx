import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResumeTailor } from './components/ResumeTailor';
import { PortfolioSuggestions } from './components/PortfolioSuggestions';
import { ExportOptions } from './components/ExportOptions';
import { Header } from './components/Header';
import { ProgressSteps } from './components/ProgressSteps';
import { Analytics } from './components/Analytics';
import { ApiStatus } from './components/ApiStatus';
import { apiService, ParsedResume, JobAnalysis, TailoredResume } from './services/api';

export type Step = 'upload' | 'job-description' | 'tailor' | 'portfolio' | 'export';

export interface ResumeData {
  originalText: string;
  tailoredText: string;
  fileName: string;
}

export interface JobDescription {
  text: string;
  extractedSkills: string[];
  title: string;
  company: string;
}

export interface PortfolioProject {
  name: string;
  description: string;
  technologies: string[];
  relevanceScore: number;
  githubUrl?: string;
  liveUrl?: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiService.checkHealth();
        setApiConnected(true);
      } catch (error) {
        console.warn('Backend API not available, using mock data');
        setApiConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleResumeUpload = (data: ResumeData) => {
    setResumeData(data);
    setCurrentStep('job-description');
  };

  // Store parsed resume data when available
  const handleResumeUploadWithParsedData = (data: ResumeData, parsed?: ParsedResume) => {
    setResumeData(data);
    if (parsed) {
      setParsedResume(parsed);
    }
    setCurrentStep('job-description');
  };

  const handleJobDescriptionSubmit = async (jd: JobDescription) => {
    setJobDescription(jd);
    setIsProcessing(true);
    
    try {
      if (apiConnected && parsedResume) {
        // Use real API for job analysis and resume tailoring
        const analysis = await apiService.analyzeJob(jd.text);
        setJobAnalysis(analysis);
        
        // Tailor the resume using AI
        const tailored = await apiService.tailorResume(parsedResume, analysis);
        setTailoredResume(tailored);
        
        // Update resume data with tailored content
        const tailoredText = formatTailoredResume(tailored);
        const updatedResumeData = {
          ...resumeData!,
          tailoredText: tailoredText
        };
        setResumeData(updatedResumeData);
        
        // Generate portfolio suggestions based on job requirements
        const mockProjects: PortfolioProject[] = generatePortfolioSuggestions(analysis);
        setPortfolioProjects(mockProjects);
      } else {
        // Fallback to mock data if API is not available
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tailoredResumeData = {
          ...resumeData!,
          tailoredText: resumeData!.originalText.replace(
            /JavaScript Developer/g, 
            jd.title
          ).replace(
            /web development/g,
            jd.extractedSkills.slice(0, 3).join(', ')
          )
        };
        
        setResumeData(tailoredResumeData);
        
        const mockProjects: PortfolioProject[] = [
          {
            name: "E-commerce Platform",
            description: "Full-stack application matching the required tech stack",
            technologies: jd.extractedSkills.slice(0, 4),
            relevanceScore: 95,
            githubUrl: "https://github.com/user/ecommerce",
            liveUrl: "https://myecommerce.vercel.app"
          },
          {
            name: "Task Management Dashboard",
            description: "React-based dashboard with real-time updates",
            technologies: jd.extractedSkills.slice(2, 5),
            relevanceScore: 88,
            githubUrl: "https://github.com/user/dashboard"
          }
        ];
        
        setPortfolioProjects(mockProjects);
      }
      
      setIsProcessing(false);
      setCurrentStep('tailor');
    } catch (error) {
      console.error('Error processing job description:', error);
      setIsProcessing(false);
    }
  };

  const formatTailoredResume = (tailored: TailoredResume): string => {
    let text = `${tailored.original_resume.name}\n`;
    if (tailored.original_resume.email) text += `${tailored.original_resume.email}\n`;
    if (tailored.original_resume.phone) text += `${tailored.original_resume.phone}\n`;
    text += `\nPROFESSIONAL SUMMARY\n${tailored.tailored_summary}\n\n`;
    
    if (tailored.recommended_skills.length > 0) {
      text += `SKILLS\n• ${tailored.recommended_skills.join(', ')}\n\n`;
    }
    
    if (tailored.tailored_experience.length > 0) {
      text += `PROFESSIONAL EXPERIENCE\n`;
      tailored.tailored_experience.forEach(exp => {
        text += `${exp.title} - ${exp.company} (${exp.duration})\n`;
        text += `${exp.description}\n\n`;
      });
    }
    
    return text;
  };

  const generatePortfolioSuggestions = (analysis: JobAnalysis): PortfolioProject[] => {
    const skills = analysis.required_skills.concat(analysis.preferred_skills);
    
    return [
      {
        name: "Full-Stack Application",
        description: "Comprehensive application demonstrating the required tech stack",
        technologies: skills.slice(0, 4),
        relevanceScore: 95,
        githubUrl: "https://github.com/user/fullstack-app",
        liveUrl: "https://myapp.vercel.app"
      },
      {
        name: "API Service",
        description: "Backend service showcasing API design and database skills",
        technologies: skills.slice(2, 6),
        relevanceScore: 88,
        githubUrl: "https://github.com/user/api-service"
      },
      {
        name: "Dashboard Interface",
        description: "Frontend application with modern UI/UX practices",
        technologies: skills.slice(1, 5),
        relevanceScore: 82,
        githubUrl: "https://github.com/user/dashboard"
      }
    ];
  };

  const steps = [
    { id: 'upload', title: 'Upload Resume', completed: !!resumeData },
    { id: 'job-description', title: 'Job Description', completed: !!jobDescription },
    { id: 'tailor', title: 'AI Tailoring', completed: resumeData?.tailoredText !== resumeData?.originalText },
    { id: 'portfolio', title: 'Portfolio Match', completed: portfolioProjects.length > 0 },
    { id: 'export', title: 'Export & Save', completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <ApiStatus connected={apiConnected} className="justify-center" />
        </div>
        
        <div className="mb-8">
          <ProgressSteps steps={steps} currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {currentStep === 'upload' && (
              <FileUpload onUpload={handleResumeUpload} />
            )}
            
            {currentStep === 'job-description' && (
              <JobDescriptionInput 
                onSubmit={handleJobDescriptionSubmit}
                isProcessing={isProcessing}
              />
            )}
            
            {currentStep === 'tailor' && resumeData && jobDescription && (
              <ResumeTailor
                resumeData={resumeData}
                jobDescription={jobDescription}
                onNext={() => setCurrentStep('portfolio')}
              />
            )}
            
            {currentStep === 'portfolio' && (
              <PortfolioSuggestions
                projects={portfolioProjects}
                jobDescription={jobDescription!}
                onNext={() => setCurrentStep('export')}
              />
            )}
            
            {currentStep === 'export' && resumeData && (
              <ExportOptions resumeData={resumeData} />
            )}
          </div>

          <div className="lg:col-span-1">
            <Analytics 
              resumeData={resumeData}
              jobDescription={jobDescription}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;