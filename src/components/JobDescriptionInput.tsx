import React, { useState } from 'react';
import { Briefcase, Link, Sparkles, Target } from 'lucide-react';
import { JobDescription } from '../App';

interface JobDescriptionInputProps {
  onSubmit: (jobDescription: JobDescription) => void;
  isProcessing: boolean;
}

export function JobDescriptionInput({ onSubmit, isProcessing }: JobDescriptionInputProps) {
  const [jobText, setJobText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [inputMode, setInputMode] = useState<'paste' | 'url'>('paste');

  const extractSkillsFromText = (text: string): string[] => {
    // Mock skill extraction - in real implementation, this would use NLP
    const commonSkills = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 
      'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
      'Git', 'Agile', 'REST APIs', 'GraphQL', 'CI/CD'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.slice(0, 6);
  };

  const handleSubmit = () => {
    if (!jobText.trim()) return;

    // Mock job parsing
    const lines = jobText.split('\n');
    const titleLine = lines.find(line => 
      line.toLowerCase().includes('developer') || 
      line.toLowerCase().includes('engineer') ||
      line.toLowerCase().includes('manager')
    );
    
    const companyLine = lines.find(line => 
      line.toLowerCase().includes('company') ||
      line.toLowerCase().includes('corp') ||
      line.toLowerCase().includes('inc')
    );

    const jobDescription: JobDescription = {
      text: jobText,
      extractedSkills: extractSkillsFromText(jobText),
      title: titleLine?.trim() || 'Software Developer',
      company: companyLine?.trim() || 'Tech Company'
    };

    onSubmit(jobDescription);
  };

  const handleUrlImport = async () => {
    if (!jobUrl.trim()) return;
    
    // Mock URL import
    const mockJobText = `Senior Full Stack Developer - TechCorp Inc.

We are looking for an experienced Senior Full Stack Developer to join our dynamic team. You will be responsible for developing scalable web applications using modern technologies.

Requirements:
• 3+ years of experience with React and TypeScript
• Strong knowledge of Node.js and Express
• Experience with PostgreSQL and MongoDB
• Proficiency in AWS cloud services
• Knowledge of Docker and Kubernetes
• Experience with Git and Agile methodologies
• Strong problem-solving skills

Preferred:
• Experience with GraphQL and REST APIs
• Knowledge of CI/CD pipelines
• Experience with microservices architecture`;

    setJobText(mockJobText);
    setInputMode('paste');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Description Analysis</h2>
        <p className="text-slate-600">
          Paste the job description or import from a job portal URL
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setInputMode('paste')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              inputMode === 'paste'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Paste Text</span>
          </button>
          <button
            onClick={() => setInputMode('url')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              inputMode === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Link className="h-4 w-4" />
            <span>Import from URL</span>
          </button>
        </div>

        {inputMode === 'url' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Portal URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleUrlImport}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Import
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Supports LinkedIn, Indeed, Glassdoor, and other major job portals
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the complete job description here..."
            rows={12}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {jobText.trim() && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-slate-700">Preview: Extracted Skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractSkillsFromText(jobText).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!jobText.trim() || isProcessing}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
          !jobText.trim() || isProcessing
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analyzing with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Analyze & Tailor Resume</span>
          </>
        )}
      </button>
    </div>
  );
}