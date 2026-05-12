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

  const handleUrlImport = async () => {
    if (!jobUrl) return;

    setIsProcessing(true);
    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/analyze-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_url: jobUrl })
        });
      } catch {
        throw new Error('Cannot connect to backend. Make sure it is running on port 5000.');
      }

      if (!response.ok) throw new Error('Failed to import from URL');

      const data = await response.json();
      if (data.scraped_text) {
        setJobDescText(data.scraped_text);
      }
      setIsProcessing(false);
    } catch (error: any) {
      setIsProcessing(false);
      alert(error.message || 'Failed to import job description from URL');
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

      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
          method: 'POST',
          body: formData,
        });
      } catch {
        throw new Error('Cannot connect to backend server. Make sure it is running on port 5000.');
      }

      if (!response.ok) {
        let errorMsg = 'Failed to upload resume';
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

    } catch (error: any) {
      setIsProcessing(false);
      alert(error.message || 'Failed to upload resume');
    }
  };

  const handleJobDescriptionSubmit = async () => {
    if (!jobDescText.trim() || !resumeData) return;

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/tailor-resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_text: resumeData.originalText,
            job_description: jobDescText,
            userId: user.id
          }),
        });
      } catch {
        throw new Error('Cannot connect to backend server.');
      }

      if (!response.ok) {
        let errorMsg = 'Failed to tailor resume';
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

    } catch (error: any) {
      setIsProcessing(false);
      alert(error.message || 'Failed to tailor resume');
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
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500/10 to-transparent';
    if (score >= 60) return 'from-blue-500/10 to-transparent';
    if (score >= 40) return 'from-amber-500/10 to-transparent';
    return 'from-red-500/10 to-transparent';
  };

  // --- STEP RENDERERS ---

  const renderUploadStep = () => (
    <div className="max-w-3xl mx-auto py-12 entry-animation">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          {isProcessing ? <Loader2 className="w-10 h-10 text-blue-500 animate-spin" /> : <Upload className="w-10 h-10 text-blue-500" />}
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tight">{isProcessing ? 'Processing...' : 'Upload Master Resume'}</h2>
        <p className="text-slate-400 text-lg font-medium leading-relaxed">Everything happens locally. Your data never leaves your machine.</p>
      </div>

      <div className="glass-card glass-card-hover overflow-hidden group">
        <label
          htmlFor="resume-upload"
          className={`block p-20 border-4 border-dashed border-white/5 rounded-2xl text-center transition-all ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-white/[0.01]'}`}
        >
          <FileText className="w-20 h-20 text-slate-800 mx-auto mb-8 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500" />
          <h3 className="text-2xl font-black mb-3">Drop file here or browse</h3>
          <p className="text-slate-500 font-medium mb-10">PDF, DOCX, or TXT (Max 10MB)</p>
          <div className="btn-primary inline-flex items-center min-w-[200px]">
            {isProcessing ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Upload className="w-5 h-5 mr-3" />}
            {isProcessing ? 'Working...' : 'Select Document'}
          </div>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" id="resume-upload" disabled={isProcessing} />
        </label>
      </div>
    </div>
  );

  const renderJobDescriptionStep = () => (
    <div className="max-w-6xl mx-auto py-12 entry-animation">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-purple-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
          <Briefcase className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tight">Target Role Details</h2>
        <p className="text-slate-400 text-lg font-medium">What job are we optimizing for today?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="glass-card p-10">
          <div className="section-header">
            <Edit3 className="w-4 h-4 text-blue-500" />
            Paste Job Description
          </div>
          <textarea
            value={jobDescText}
            onChange={(e) => setJobDescText(e.target.value)}
            placeholder="Paste the full job description text here..."
            className="w-full h-96 glass-input bg-transparent resize-none p-6 text-slate-300 leading-relaxed font-medium"
          />
        </div>

        <div className="space-y-10">
          <div className="glass-card p-10">
            <div className="section-header">
              <Globe className="w-4 h-4 text-purple-500" />
              Import via URL
            </div>
            <div className="space-y-6">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full glass-input"
              />
              <button onClick={handleUrlImport} disabled={!jobUrl || isProcessing} className="btn-secondary w-full group">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />}
                {isProcessing ? 'Fetching...' : 'Scrape Description'}
              </button>
            </div>
          </div>

          <div className="glass-card p-10 bg-gradient-to-br from-blue-600/10 to-transparent">
            <div className="section-header text-blue-400">
              <Sparkles className="w-4 h-4" />
              AI Insight
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              A complete job description allows the AI to better understand the <span className="text-white">cultural nuances</span> and <span className="text-white">technical depth</span> required for the role.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <button
          onClick={handleJobDescriptionSubmit}
          disabled={!jobDescText.trim() || isProcessing}
          className="btn-primary px-20 py-6 text-xl group shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
        >
          {isProcessing ? 'Analyzing...' : 'Tailor Resume Content'}
          <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="max-w-2xl mx-auto text-center py-32 entry-animation">
      <div className="relative inline-block mb-12">
        <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-10 animate-pulse-soft" />
        <Loader2 className="w-24 h-24 text-blue-500 mx-auto animate-spin relative" />
      </div>
      <h2 className="text-5xl font-black mb-6 tracking-tight">Optimizing Your Career Path</h2>
      <p className="text-slate-400 text-lg mb-16 font-medium leading-relaxed">
        Our local AI engine is currently synthesizing your experience with the job requirements. This typically takes <span className="text-blue-500">60-90 seconds</span>.
      </p>
      
      <div className="glass-card p-10 space-y-8 text-left max-w-xl mx-auto">
        {[
          { label: 'Deconstructing job requirements', check: true },
          { label: 'Synthesizing skill alignments', check: true },
          { label: 'Generating semantic variations', check: isProcessing },
          { label: 'Validating ATS compatibility', check: false }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between group">
            <span className={`text-xl font-medium ${item.check ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</span>
            {item.check ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            ) : (
              <div className="w-8 h-8 border-2 border-slate-900 rounded-full animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="max-w-5xl mx-auto py-12 entry-animation">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <BarChart3 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tight">Tailoring Complete</h2>
        <p className="text-slate-400 text-lg font-medium leading-relaxed">We've identified the key optimizations needed to pass the ATS filters.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 mb-16">
        {/* Score Card */}
        <div className={`lg:col-span-2 glass-card p-12 text-center bg-gradient-to-br ${getScoreBg(analysis?.matchScore || 0)} flex flex-col justify-center`}>
          <div className="section-header justify-center">Match Confidence</div>
          <div className="relative inline-flex items-center justify-center p-2 rounded-full mb-8">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={553} strokeDashoffset={553 - (553 * (analysis?.matchScore || 0)) / 100}
                      className={`${getScoreColor(analysis?.matchScore || 0)} transition-all duration-1000 ease-out`} 
                      strokeLinecap="round" />
            </svg>
            <span className="absolute text-5xl font-black">{analysis?.matchScore}%</span>
          </div>
          <div className={`text-lg font-bold mb-2 ${getScoreColor(analysis?.matchScore || 0)} uppercase tracking-widest`}>
            {analysis && analysis.matchScore >= 80 ? 'Exceptional Match' : analysis && analysis.matchScore >= 60 ? 'Strong Potential' : 'Needs Optimization'}
          </div>
        </div>

        {/* Changes Card */}
        <div className="lg:col-span-3 glass-card p-12">
          <div className="section-header">
            <Target className="w-4 h-4 text-emerald-500" />
            Core Optimizations
          </div>
          <div className="space-y-5">
            {analysis?.addedKeywords && analysis.addedKeywords.length > 0 ? (
              analysis.addedKeywords.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-lg text-slate-200 font-medium">{item}</span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center opacity-40">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p className="font-bold">No structural changes detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {pdfError && (
        <div className="mb-10 p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center max-w-2xl mx-auto animate-shake">
          <AlertCircle className="w-6 h-6 mr-4 shrink-0" />
          <span className="font-bold">{pdfError}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-8">
        <button
          onClick={handleGeneratePDF}
          className="group relative px-16 py-8 bg-blue-600 rounded-3xl text-2xl font-black flex items-center justify-center transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-[0_25px_60px_rgba(37,99,235,0.4)]"
        >
          <Sparkles className="w-8 h-8 mr-4 text-yellow-400 group-hover:rotate-12 transition-transform" />
          Build Tailored Resume
          <ChevronRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
        </button>
        <button onClick={handleStartOver} className="text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest text-xs flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Start Over
        </button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="max-w-2xl mx-auto text-center py-32 entry-animation">
      <div className="relative inline-block mb-12">
        <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-10 animate-pulse-soft" />
        <Loader2 className="w-24 h-24 text-indigo-500 mx-auto animate-spin relative" />
      </div>
      <h2 className="text-5xl font-black mb-6 tracking-tight">Drafting PDF Document</h2>
      <p className="text-slate-400 text-lg font-medium leading-relaxed">
        Applying professional typography and layout constraints to your tailored resume.
      </p>
    </div>
  );

  const renderResumeStep = () => (
    <div className="max-w-4xl mx-auto py-12 entry-animation">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
          <Sparkles className="w-10 h-10 text-indigo-500" />
        </div>
        <h2 className="text-5xl font-black mb-4 tracking-tight">Your Resume is Ready</h2>
        <p className="text-slate-400 text-xl font-medium">A high-impact, professional document is waiting for you.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 bg-gradient-to-br from-blue-600/10 to-transparent">
            <div className="section-header">Summary</div>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <FileText className="w-7 h-7 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-black truncate">tailored-resume.pdf</div>
                <div className={`text-xs font-black uppercase tracking-widest mt-1 ${getScoreColor(analysis?.matchScore || 0)}`}>
                  {analysis?.matchScore}% ATS Score
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary w-full py-5 text-lg group"
            >
              <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />
              Save to Device
            </button>
          </div>

          <div className="glass-card p-10">
            <div className="section-header">Next Steps</div>
            <ul className="space-y-4">
              {[
                'Apply via Company Portal',
                'Upload to LinkedIn',
                'Prepare for Interview'
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <button onClick={handleStartOver} className="btn-secondary w-full py-4 !rounded-2xl">
            <RotateCcw className="w-4 h-4 mr-3" />
            Tailor Another
          </button>
        </div>

        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="section-header !mb-0">
              <Globe className="w-4 h-4 text-blue-500" />
              Professional Preview
            </div>
          </div>
          <div className="bg-white">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-[700px] border-none" title="Resume Preview" />
            ) : (
              <div className="h-[700px] flex items-center justify-center text-slate-900 font-bold p-10 text-center">
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
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16">
          <button onClick={onBack} className="flex items-center text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest text-xs group">
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" />
            Exit Workshop
          </button>
          
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            {stepperSteps.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${
                    currentStepIndex === i ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110' : 
                    currentStepIndex > i ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-slate-900/50 border border-white/5 text-slate-600'
                  }`}>
                    {currentStepIndex > i ? <CheckCircle className="w-7 h-7" /> : i + 1}
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${
                    currentStepIndex === i ? 'text-white' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < stepperSteps.length - 1 && (
                  <div className={`w-12 h-px mb-6 transition-colors duration-500 ${currentStepIndex > i ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="hidden md:block w-32" /> {/* Spacer */}
        </header>

        <main className="pb-20">
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