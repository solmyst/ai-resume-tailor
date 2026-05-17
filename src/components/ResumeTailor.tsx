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
  Edit3,
  Target,
  Globe,
  ArrowRight,
  BarChart3,
  AlertCircle,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { API_BASE_URL } from '../config';

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

type Step = 'upload' | 'job-description' | 'processing' | 'analysis' | 'generating' | 'resume';

interface ResumeData {
  originalText: string;
  fileName: string;
  skills: string[];
  experience: string[];
  education: string[];
}

interface AnalysisResult {
  matchScore: number;
  addedKeywords: string[];
  tailoredText: string;
  atsOptimized: boolean;
}

export const ResumeTailor: React.FC<ResumeTailorProps> = ({ user, onBack }) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobDescText, setJobDescText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneralATS, setIsGeneralATS] = useState(false);

  const handleUrlImport = async () => {
    if (!jobUrl) return;

    setIsProcessing(true);
    setError(null);
    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/analyze-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_url: jobUrl })
        });
      } catch {
        throw new Error('Cannot connect to the backend server. Please verify the Python backend is running locally on port 5000 and your network connection is stable.');
      }

      if (!response.ok) throw new Error('We were unable to extract the job description from the provided URL. Please make sure the link is correct and publicly accessible, or copy-paste the text manually.');

      const data = await response.json();
      if (data.scraped_text) {
        setJobDescText(data.scraped_text);
      }
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'An error occurred while importing the job description. Please copy the text and paste it into the editor manually.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
          method: 'POST',
          body: formData,
        });
      } catch {
        throw new Error('Cannot connect to the backend server. Make sure the Python Flask app is running locally on port 5000.');
      }

      if (!response.ok) {
        let errorMsg = 'We encountered an error processing your resume upload.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      setResumeData({
        originalText: data.resume_text,
        fileName: data.filename,
        skills: data.extracted_data.technical_skills || [],
        experience: data.extracted_data.general_skills || [],
        education: data.extracted_data.entities || []
      });
      setIsProcessing(false);
      setCurrentStep('job-description');

    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'Failed to upload your resume. Please ensure it is a valid PDF, DOCX, or plain text file (Max 10MB).');
    }
  };

  const handleJobDescriptionSubmit = async (isGeneral: boolean = false) => {
    if (!resumeData) return;
    
    const textToSend = isGeneral ? '' : jobDescText;
    if (!isGeneral && !textToSend.trim()) return;

    setIsGeneralATS(isGeneral);
    setIsProcessing(true);
    setCurrentStep('processing');
    setError(null);

    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/tailor-resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_text: resumeData.originalText,
            job_description: textToSend,
            userId: user.id
          }),
        });
      } catch {
        throw new Error('Cannot connect to the backend server. Please verify the Python application is running on port 5000.');
      }

      if (!response.ok) {
        let errorMsg = 'Failed to analyze and tailor the resume.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      setAnalysis({
        tailoredText: data.tailored_resume,
        matchScore: data.match_score || 0,
        addedKeywords: data.added_keywords || [],
        atsOptimized: data.ats_optimized || false
      });

      setIsProcessing(false);
      setCurrentStep('analysis');

    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'An error occurred while tailoring your resume. If using an online model, please ensure your API Key is valid and has sufficient credits in Settings.');
      setCurrentStep('job-description');
    }
  };

  const handleGeneratePDF = async () => {
    if (!analysis?.tailoredText) return;

    setCurrentStep('generating');
    setPdfError(null);

    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tailored_text: analysis.tailoredText }),
        });
      } catch {
        throw new Error('Cannot connect to backend server.');
      }

      if (!response.ok) {
        let errorMsg = 'Failed to generate PDF';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setCurrentStep('resume');

    } catch (error: any) {
      setPdfError(error.message || 'Failed to generate PDF');
      setCurrentStep('analysis');
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `tailored-resume-${Date.now()}.pdf`;
    link.click();
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setResumeData(null);
    setAnalysis(null);
    setJobDescText('');
    setJobUrl('');
    setPdfUrl(null);
    setPdfError(null);
    setIsGeneralATS(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-ember';
    if (score >= 60) return 'text-slate';
    if (score >= 40) return 'text-slate';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    return 'bg-linen/20 border border-linen shadow-sm';
  };

  // --- STEP RENDERERS ---

  const renderUploadStep = () => (
    <div className="max-w-3xl mx-auto py-4 entry-animation">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-linen/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-linen">
          {isProcessing ? <Loader2 className="w-7 h-7 text-ember animate-spin" /> : <Upload className="w-7 h-7 text-ember" />}
        </div>
        <h2 className="text-3xl font-black mb-1 tracking-tight text-ink">{isProcessing ? 'Processing...' : 'Upload Master Resume'}</h2>
        <p className="text-slate text-sm font-medium leading-relaxed">Everything happens locally. Your data never leaves your machine.</p>
      </div>

      <div className="glass-card glass-card-hover overflow-hidden group">
        <label
          htmlFor="resume-upload"
          className={`block py-12 px-6 border-2 border-dashed border-ember/40 rounded-2xl text-center transition-all ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-linen/20'}`}
        >
          <FileText className="w-12 h-12 text-slate/40 mx-auto mb-4 group-hover:text-ember group-hover:scale-105 transition-all duration-500" />
          <h3 className="text-xl font-black mb-1 text-ink">Drop file here or browse</h3>
          <p className="text-slate text-sm font-medium mb-6">PDF, DOCX, or TXT (Max 10MB)</p>
          <div className="btn-primary inline-flex items-center min-w-[200px]">
            {isProcessing ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-fog" /> : <Upload className="w-5 h-5 mr-3" />}
            {isProcessing ? 'Working...' : 'Select Document'}
          </div>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" id="resume-upload" disabled={isProcessing} />
        </label>
      </div>
    </div>
  );

  const renderJobDescriptionStep = () => (
    <div className="max-w-6xl mx-auto py-4 entry-animation">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-linen/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-linen">
          <Briefcase className="w-7 h-7 text-ember" />
        </div>
        <h2 className="text-3xl font-black mb-1 tracking-tight text-ink">Target Role Details</h2>
        <p className="text-slate text-sm font-medium">What job are we optimizing for today?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="section-header">
            <Edit3 className="w-4 h-4 text-ember" />
            Paste Job Description
          </div>
          <textarea
            value={jobDescText}
            onChange={(e) => setJobDescText(e.target.value)}
            placeholder="Paste the full job description text here..."
            className="w-full h-72 glass-input bg-transparent resize-none p-4 text-ink leading-relaxed font-medium text-sm"
          />
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="section-header">
              <Globe className="w-4 h-4 text-ember" />
              Import via URL
            </div>
            <div className="space-y-4">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full glass-input"
              />
              <button onClick={handleUrlImport} disabled={!jobUrl || isProcessing} className="btn-secondary w-full group">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-ink" /> : <Globe className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform text-ember" />}
                {isProcessing ? 'Fetching...' : 'Scrape Description'}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-linen/20 to-transparent">
            <div className="section-header text-ember">
              <Sparkles className="w-4 h-4" />
              AI Insight
            </div>
            <p className="text-slate text-sm leading-relaxed font-medium">
              A complete job description allows the AI to better understand the <span className="text-ink font-bold">cultural nuances</span> and <span className="text-ember font-bold">technical depth</span> required for the role.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <button
          onClick={() => handleJobDescriptionSubmit(false)}
          disabled={!jobDescText.trim() || isProcessing}
          className="btn-primary px-8 py-4 text-lg group"
        >
          {isProcessing && jobDescText.trim() ? 'Analyzing...' : 'Tailor to Job'}
          <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform text-ember" />
        </button>
        <button
          onClick={() => handleJobDescriptionSubmit(true)}
          disabled={isProcessing}
          className="btn-secondary px-8 py-4 text-lg group"
        >
          {isProcessing && !jobDescText.trim() ? 'Analyzing...' : 'Get General ATS Score'}
          <Sparkles className="ml-3 w-5 h-5 text-ember group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="max-w-2xl mx-auto text-center py-12 entry-animation">
      <div className="relative inline-block mb-6">
        <Loader2 className="w-16 h-16 text-ember mx-auto animate-spin relative" />
      </div>
      <h2 className="text-3xl font-black mb-3 tracking-tight text-ink">Optimizing Your Career Path</h2>
      <p className="text-slate text-sm mb-8 font-medium leading-relaxed">
        Our local AI engine is currently synthesizing your experience with the job requirements. This typically takes <span className="text-ember font-bold">60-90 seconds</span>.
      </p>
      
      <div className="glass-card p-6 space-y-4 text-left max-w-xl mx-auto">
        {[
          { label: 'Deconstructing job requirements', check: true },
          { label: 'Synthesizing skill alignments', check: true },
          { label: 'Generating semantic variations', check: isProcessing },
          { label: 'Validating ATS compatibility', check: false }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between group">
            <span className={`text-lg font-medium ${item.check ? 'text-ink' : 'text-slate/40'}`}>{item.label}</span>
            {item.check ? (
              <div className="w-6 h-6 rounded-full bg-linen/20 flex items-center justify-center border border-linen">
                <CheckCircle className="w-4 h-4 text-ember" />
              </div>
            ) : (
              <div className="w-6 h-6 border border-linen rounded-full animate-pulse bg-linen/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="max-w-5xl mx-auto py-4 entry-animation">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-linen/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-linen">
          <BarChart3 className="w-7 h-7 text-ember" />
        </div>
        <h2 className="text-3xl font-black mb-1 tracking-tight text-ink">Tailoring Complete</h2>
        <p className="text-slate text-sm font-medium leading-relaxed">We've identified the key optimizations needed to pass the ATS filters.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        {/* Score Card */}
        <div className={`lg:col-span-2 glass-card p-8 text-center bg-gradient-to-br ${getScoreBg(analysis?.matchScore || 0)} flex flex-col justify-center`}>
          <div className="section-header justify-center">Match Confidence</div>
          <div className="relative inline-flex items-center justify-center p-2 rounded-full mb-6 mx-auto">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-ink/5" />
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" 
                      strokeDasharray={452} strokeDashoffset={452 - (452 * (analysis?.matchScore || 0)) / 100}
                      className={`${getScoreColor(analysis?.matchScore || 0)} transition-all duration-1000 ease-out`} 
                      strokeLinecap="round" />
            </svg>
            <span className="absolute text-4xl font-black text-ink">{analysis?.matchScore}%</span>
          </div>
          <div className={`text-base font-bold mb-1 ${getScoreColor(analysis?.matchScore || 0)} uppercase tracking-widest`}>
            {analysis && analysis.matchScore >= 80 ? 'Exceptional Match' : analysis && analysis.matchScore >= 60 ? 'Strong Potential' : 'Needs Optimization'}
          </div>
        </div>

        {/* Changes Card */}
        <div className="lg:col-span-3 glass-card p-8">
          <div className="section-header">
            <Target className="w-4 h-4 text-ember" />
            Core Optimizations
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {analysis?.addedKeywords && analysis.addedKeywords.length > 0 ? (
              analysis.addedKeywords.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-stone border border-linen hover:bg-linen/20 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-linen/20 flex items-center justify-center border border-linen group-hover:scale-105 transition-transform">
                    <CheckCircle className="w-4 h-4 text-ember" />
                  </div>
                  <span className="text-sm text-ink font-medium">{item}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center opacity-40 text-slate">
                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm font-bold">No structural changes detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {pdfError && (
        <div className="mb-6 p-4 bg-ink/5 border border-linen text-red-500 rounded-xl flex items-center max-w-2xl mx-auto animate-shake">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-red-500" />
          <span className="font-bold text-sm">{pdfError}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {!isGeneralATS && (
          <button
            onClick={handleGeneratePDF}
            className="btn-primary px-12 py-4 text-lg"
          >
            <Sparkles className="w-6 h-6 mr-3 text-ember group-hover:rotate-12 transition-transform" />
            Build Tailored Resume
            <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform text-ember" />
          </button>
        )}
        <button onClick={handleStartOver} className="text-slate/60 hover:text-ink transition-colors font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Start Over
        </button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="max-w-2xl mx-auto text-center py-20 entry-animation">
      <div className="relative inline-block mb-6">
        <Loader2 className="w-16 h-16 text-ember mx-auto animate-spin relative" />
      </div>
      <h2 className="text-3xl font-black mb-3 tracking-tight text-ink">Drafting PDF Document</h2>
      <p className="text-slate text-sm font-medium leading-relaxed">
        Applying professional typography and layout constraints to your tailored resume.
      </p>
    </div>
  );

  const renderResumeStep = () => (
    <div className="max-w-4xl mx-auto py-4 entry-animation">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-linen/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-linen">
          <Sparkles className="w-7 h-7 text-ember" />
        </div>
        <h2 className="text-3xl font-black mb-1 tracking-tight text-ink">Your Resume is Ready</h2>
        <p className="text-slate text-sm font-medium">A high-impact, professional document is waiting for you.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-linen/20 to-transparent">
            <div className="section-header">Summary</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-stone rounded-xl flex items-center justify-center border border-linen">
                <FileText className="w-6 h-6 text-ember" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black truncate text-ink text-sm">tailored-resume.pdf</div>
                <div className={`text-xs font-black uppercase tracking-widest mt-0.5 ${getScoreColor(analysis?.matchScore || 0)}`}>
                  {analysis?.matchScore}% ATS Score
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary w-full py-4 text-base group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform text-ember" />
              Save to Device
            </button>
          </div>

          <div className="glass-card p-6">
            <div className="section-header">Next Steps</div>
            <ul className="space-y-3">
              {[
                'Apply via Company Portal',
                'Upload to LinkedIn',
                'Prepare for Interview'
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate">
                  <div className="w-1.5 h-1.5 rounded-full bg-ember" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <button onClick={handleStartOver} className="btn-secondary w-full py-3 text-sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Tailor Another
          </button>
        </div>

        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-4 border-b border-linen bg-stone flex items-center justify-between">
            <div className="section-header !mb-0">
              <Globe className="w-4 h-4 text-ember" />
              Professional Preview
            </div>
          </div>
          <div className="bg-white">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-[500px] border-none" title="Resume Preview" />
            ) : (
              <div className="h-[500px] flex items-center justify-center text-slate-900 font-bold p-6 text-center text-sm">
                Preview not available. Please download the file to view.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Stepper config
  const stepperSteps = [
    { key: 'upload', label: 'Upload' },
    { key: 'job-description', label: 'Target' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'resume', label: 'Document' }
  ];

  const getStepIndex = (step: Step) => {
    if (step === 'upload') return 0;
    if (step === 'job-description') return 1;
    if (step === 'processing' || step === 'analysis') return 2;
    if (step === 'generating' || step === 'resume') return 3;
    return 0;
  };

  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-0">
          <button onClick={onBack} className="flex items-center text-slate/60 hover:text-ink transition-colors font-bold uppercase tracking-widest text-xs group">
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform text-ember" />
            Exit Workshop
          </button>
          
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            {stepperSteps.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all duration-500 text-sm ${
                    currentStepIndex === i ? 'bg-ink text-fog border border-ember/30 shadow-sm scale-110' : 
                    currentStepIndex > i ? 'bg-stone text-ember border border-linen' : 'bg-stone/50 border border-linen text-slate/40'
                  }`}>
                    {currentStepIndex > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-bold ${
                    currentStepIndex === i ? 'text-ember font-extrabold' : 'text-slate/40'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < stepperSteps.length - 1 && (
                  <div className={`w-8 h-px mb-4 transition-colors duration-500 ${currentStepIndex > i ? 'bg-ember' : 'bg-linen'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="hidden md:block w-32" /> {/* Spacer */}
        </header>

        <main className="pb-8">
          {error && (
            <div className="mb-6 p-4 bg-ink/5 border border-linen text-red-500 rounded-xl flex items-start max-w-4xl mx-auto relative">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <h4 className="font-bold text-base mb-0.5">An Error Occurred</h4>
                <p className="font-medium text-xs leading-relaxed text-red-600">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="absolute top-3 right-3 text-slate hover:text-ink font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          )}
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'job-description' && renderJobDescriptionStep()}
          {currentStep === 'processing' && renderProcessingStep()}
          {currentStep === 'analysis' && renderAnalysisStep()}
          {currentStep === 'generating' && renderGeneratingStep()}
          {currentStep === 'resume' && renderResumeStep()}
        </main>
      </div>
    </div>
  );
};