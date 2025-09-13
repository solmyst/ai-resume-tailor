import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { ResumeData } from '../App';

interface FileUploadProps {
  onUpload: (data: ResumeData) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock resume text extraction
    const mockResumeText = `John Doe
JavaScript Developer

EXPERIENCE
Senior Frontend Developer - Tech Corp (2021-2024)
• Developed responsive web applications using React and TypeScript
• Collaborated with cross-functional teams to deliver high-quality products
• Implemented modern JavaScript frameworks and web development best practices
• Optimized application performance and user experience

SKILLS
• JavaScript, TypeScript, React, Node.js
• HTML, CSS, Tailwind CSS
• Git, Agile methodology
• Problem-solving and team collaboration`;

    const resumeData: ResumeData = {
      originalText: mockResumeText,
      tailoredText: mockResumeText,
      fileName: file.name
    };

    setIsProcessing(false);
    onUpload(resumeData);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
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
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg font-medium text-slate-700 mb-2">Processing Resume...</p>
            <p className="text-slate-500">Extracting text and analyzing content</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-medium text-slate-700 mb-2">Resume Uploaded Successfully!</p>
            <p className="text-slate-500 mb-4">{uploadedFile.name}</p>
            <button
              onClick={() => setUploadedFile(null)}
              className="flex items-center space-x-2 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              <span>Remove</span>
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
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <FileText className="h-5 w-5 mr-2" />
                Browse Files
              </span>
            </label>
            <p className="text-sm text-slate-500 mt-4">
              Supports PDF files up to 10MB
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