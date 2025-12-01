import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Briefcase,
  Download,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Loader2,
  Eye,
  Edit3,
  Target,
  Github,
  Save
} from 'lucide-react';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';

interface ResumeTailorProps {
  user: {
    id: string;
    name: string;
    email: string;
    subscription: 'free' | 'premium' | 'professional';
    avatar?: string;
  };
  onBack: () => void;
}

type Step = 'upload' | 'job-description' | 'processing' | 'results';

interface ResumeData {
  originalText: string;
  fileName: string;
  skills: string[];
  experience: string[];
  education: string[];
}

interface JobDescription {
  text: string;
  company: string;
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

interface TailoredResume {
  tailoredText: string;
  matchScore: number;
  addedKeywords: string[];
  suggestedProjects: string[];
  atsOptimized: boolean;
}

export const ResumeTailor: React.FC<ResumeTailorProps> = ({ user, onBack }) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobDescText, setJobDescText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const handleUrlImport = async () => {
    if (!jobUrl) return;

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_url: jobUrl })
      });

      if (!response.ok) throw new Error('Failed to import from URL');

      const data = await response.json();
      if (data.scraped_text) {
        setJobDescText(data.scraped_text);
      }
      setIsProcessing(false);
    } catch (error) {
      console.error('Error importing URL:', error);
      setIsProcessing(false);
      alert('Failed to import job description from URL');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Resume processing failed');
      }

      const resumeData: ResumeData = {
        originalText: data.resume_text,
        fileName: data.filename,
        skills: data.extracted_data.technical_skills || [],
        experience: data.extracted_data.general_skills || [],
        education: data.extracted_data.entities || []
      };

      setResumeData(resumeData);
      setIsProcessing(false);
      setCurrentStep('job-description');

      try {
        await fetch(`http://localhost:5000/api/user/${user.id}/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: `Resume uploaded: ${data.filename}` }),
        });
      } catch (error) {
        console.error('Failed to track upload activity:', error);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setIsProcessing(false);
      alert(`Failed to upload resume: ${error.message}`);
    }
  };

  const handleJobDescriptionSubmit = async () => {
    if (!jobDescText.trim() || !resumeData) return;

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      const response = await fetch('http://localhost:5000/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeData.originalText,
          job_description: jobDescText,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to tailor resume');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Resume tailoring failed');
      }

      const jobDesc: JobDescription = {
        text: jobDescText,
        company: data.job_analysis.company || 'Unknown Company',
        role: data.job_analysis.role || 'Unknown Role',
        requiredSkills: data.job_analysis.required_skills || [],
        preferredSkills: data.job_analysis.preferred_skills || []
      };

      const tailoredResume: TailoredResume = {
        tailoredText: data.tailored_resume,
        matchScore: data.match_score || 0,
        addedKeywords: data.added_keywords || [],
        suggestedProjects: data.suggested_projects || [],
        atsOptimized: data.ats_optimized || false
      };

      setJobDescription(jobDesc);
      setTailoredResume(tailoredResume);
      setEditedText(data.tailored_resume);
      setIsProcessing(false);
      setCurrentStep('results');

      try {
        await fetch(`http://localhost:5000/api/user/${user.id}/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `Resume tailored for ${jobDesc.role} at ${jobDesc.company}`,
            match_score: tailoredResume.matchScore
          }),
        });
      } catch (error) {
        console.error('Failed to track activity:', error);
      }
    } catch (error) {
      console.error('Error tailoring resume:', error);
      setIsProcessing(false);
      alert(`Failed to tailor resume: ${error.message}`);
      setCurrentStep('job-description');
    }
  };

  const downloadPDF = async () => {
    if (!editedText) return;

    try {
      const doc = new jsPDF();

      // Split text into lines that fit the page width
      const splitText = doc.splitTextToSize(editedText, 180);

      let y = 20;
      const pageHeight = doc.internal.pageSize.height;

      splitText.forEach((line: string) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15, y);
        y += 7;
      });

      doc.save(`tailored-resume-${Date.now()}.pdf`);

      await fetch(`http://localhost:5000/api/user/${user.id}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'Downloaded tailored resume (PDF)' }),
      });
    } catch (error) {
      console.error('Failed to download or track:', error);
      alert('Failed to generate PDF');
    }
  };

  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
        <p className="text-gray-600">Upload your current resume to get started with AI-powered tailoring</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your resume here</h3>
          <p className="text-gray-600 mb-4">Supports PDF, DOC, DOCX, TXT files</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            Choose File
          </label>
        </div>
      </div>
    </div>
  );

  const renderJobDescriptionStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Briefcase className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Job Description</h2>
        <p className="text-gray-600">Paste the job description or provide a job posting URL</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Paste Job Description</h3>
          <textarea
            value={jobDescText}
            onChange={(e) => setJobDescText(e.target.value)}
            placeholder="Paste the complete job description here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Or Import from URL</h3>
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://company.com/job-posting"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <button
            onClick={handleUrlImport}
            disabled={!jobUrl || isProcessing}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Import from URL
          </button>
          {isProcessing && jobUrl && <p className="text-sm text-blue-600 mt-2">Importing...</p>}
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleJobDescriptionSubmit}
          disabled={!jobDescText.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Tailor My Resume
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-spin" />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">AI is Tailoring Your Resume</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-gray-700">Analyzing job requirements</span>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-gray-700">Matching skills and keywords</span>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          <span className="text-gray-400">Optimizing for ATS systems</span>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Resume Tailored Successfully!</h2>
        <p className="text-gray-600">Your resume has been optimized for this specific job</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Match Analysis</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Match Score</span>
                  <span className="font-bold text-green-600">{tailoredResume?.matchScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${tailoredResume?.matchScore}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">ATS Optimized</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Added Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {tailoredResume?.addedKeywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Suggested Projects</h3>
            <div className="space-y-3">
              {tailoredResume?.suggestedProjects.map((project, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Github className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-700">{project}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Tailored Resume</h3>
              <div className="flex space-x-3">
                {isEditing ? (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-4 py-2 text-green-600 hover:text-green-800 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </>
                )}
                <button
                  onClick={downloadPDF}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-[500px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown>{editedText}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => {
            setCurrentStep('upload');
            setResumeData(null);
            setJobDescription(null);
            setTailoredResume(null);
            setJobDescText('');
            setEditedText('');
            setIsEditing(false);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Tailor Another Resume
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {['upload', 'job-description', 'processing', 'results'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step ? 'bg-blue-600 text-white' :
                      ['upload', 'job-description', 'processing', 'results'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-600'
                    }`}>
                    {index + 1}
                  </div>
                  {index < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'job-description' && renderJobDescriptionStep()}
        {currentStep === 'processing' && renderProcessingStep()}
        {currentStep === 'results' && renderResultsStep()}
      </div>
    </div>
  );
};