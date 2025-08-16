import React, { useState } from 'react';
import { RefreshCw, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { ResumeData, JobDescription } from '../App';

interface ResumeTailorProps {
  resumeData: ResumeData;
  jobDescription: JobDescription;
  onNext: () => void;
}

export function ResumeTailor({ resumeData, jobDescription, onNext }: ResumeTailorProps) {
  const [showComparison, setShowComparison] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRegenerating(false);
  };

  const matchPercentage = 87; // Mock calculation

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">AI-Tailored Resume</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">
                  {matchPercentage}% Job Match
                </span>
              </div>
              <div className="text-sm text-slate-500">
                Optimized for: {jobDescription.title}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
            </button>
            
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {showComparison ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-slate-700 mb-3 flex items-center">
                <span className="w-3 h-3 bg-slate-400 rounded-full mr-2"></span>
                Original Resume
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 h-96 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {resumeData.originalText}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-slate-700 mb-3 flex items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                AI-Tailored Resume
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 h-96 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {resumeData.tailoredText}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-medium text-slate-700 mb-3 flex items-center">
              <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              AI-Tailored Resume
            </h3>
            <div className="bg-blue-50 rounded-lg p-6">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {resumeData.tailoredText}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4">Key Improvements Made</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700">Keyword Optimization</p>
              <p className="text-sm text-slate-600">
                Added {jobDescription.extractedSkills.length} relevant keywords from the job description
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700">Title Alignment</p>
              <p className="text-sm text-slate-600">
                Updated job title to match "{jobDescription.title}"
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700">ATS Optimization</p>
              <p className="text-sm text-slate-600">
                Formatted for better Applicant Tracking System parsing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>View Portfolio Suggestions</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}