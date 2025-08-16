import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { ResumeData } from '../App';
import { apiService, ParsedResume } from '../services/api';

interface FileUploadProps {
  onUpload: (data: ResumeData, parsed?: ParsedResume) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);
    setError(null);
    
    try {
      // Upload and parse resume using real API
      const parsed = await apiService.uploadResume(file);
      setParsedResume(parsed);
      
      // Convert to ResumeData format for the UI
      const resumeText = formatResumeText(parsed);
      const resumeData: ResumeData = {
        originalText: resumeText,
        tailoredText: resumeText,
        fileName: file.name
      };

      setIsProcessing(false);
      onUpload(resumeData, parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
      setIsProcessing(false);
      setUploadedFile(null);
    }
  };

  const formatResumeText = (parsed: ParsedResume): string => {
    let text = `${parsed.name}\n`;
    if (parsed.email) text += `${parsed.email}\n`;
    if (parsed.phone) text += `${parsed.phone}\n`;
    text += `\nPROFESSIONAL SUMMARY\n${parsed.summary}\n\n`;
    
    if (parsed.skills.length > 0) {
      text += `SKILLS\n• ${parsed.skills.join(', ')}\n\n`;
    }
    
    if (parsed.experience.length > 0) {
      text += `PROFESSIONAL EXPERIENCE\n`;
      parsed.experience.forEach(exp => {
        text += `${exp.title} - ${exp.company} (${exp.duration})\n`;
        text += `${exp.description}\n\n`;
      });
    }
    
    if (parsed.education.length > 0) {
      text += `EDUCATION\n`;
      parsed.education.forEach(edu => {
        text += `${edu.degree} - ${edu.school} (${edu.year})\n`;
      });
    }
    
    return text;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (
      file.type === 'application/pdf' || 
      file.name.endsWith('.pdf') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx') ||
      file.type === 'text/plain' ||
      file.name.endsWith('.txt')
    )) {
      processFile(file);
    } else {
      setError('Please upload a PDF, DOCX, or TXT file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setParsedResume(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Resume</h2>
        <p className="text-slate-600">
          Upload your current resume to get started with AI-powered optimization
        </p>
      </div>

      <div
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 hover:border-slate-400'
          }
          ${isProcessing ? 'bg-slate-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {error ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-lg font-medium text-red-700 mb-2">Upload Failed</p>
            <p className="text-red-600 mb-4 text-center">{error}</p>
            <button
              onClick={resetUpload}
              className="flex items-center space-x-2 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg font-medium text-slate-700 mb-2">Processing Resume...</p>
            <p className="text-slate-500">Extracting text and analyzing content with AI</p>
          </div>
        ) : uploadedFile && parsedResume ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-medium text-slate-700 mb-2">Resume Processed Successfully!</p>
            <p className="text-slate-500 mb-2">{uploadedFile.name}</p>
            <div className="text-sm text-slate-600 mb-4 text-center">
              <p>✓ Extracted: {parsedResume.name}</p>
              <p>✓ Found {parsedResume.skills.length} skills</p>
              <p>✓ Parsed {parsedResume.experience.length} work experiences</p>
            </div>
            <button
              onClick={resetUpload}
              className="flex items-center space-x-2 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              <span>Upload Different Resume</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-16 w-16 text-slate-400 mb-4" />
            <p className="text-xl font-medium text-slate-700 mb-2">
              Drag and drop your resume here
            </p>
            <p className="text-slate-500 mb-6">or</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <FileText className="h-5 w-5 mr-2" />
                Browse Files
              </span>
            </label>
            <p className="text-sm text-slate-500 mt-4">
              Supports PDF, DOCX, and TXT files up to 10MB
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Your resume data is processed securely and never stored permanently
        </p>
      </div>
    </div>
  );
}