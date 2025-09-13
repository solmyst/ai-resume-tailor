import React, { useState } from 'react';
import { Download, FileText, Mail, Share2, CheckCircle } from 'lucide-react';
import { ResumeData } from '../App';

interface ExportOptionsProps {
  resumeData: ResumeData;
}

export function ExportOptions({ resumeData }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportCompleted, setExportCompleted] = useState(false);

  const handleExport = async (format: 'pdf' | 'word' | 'txt') => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simple download simulation
    const element = document.createElement('a');
    const file = new Blob([resumeData.tailoredText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tailored_resume_${Date.now()}.${format === 'word' ? 'docx' : format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setIsExporting(false);
    setExportCompleted(true);
  };

  const handleEmailSend = async () => {
    // Simulate email sending
    const subject = encodeURIComponent('My Tailored Resume');
    const body = encodeURIComponent('Please find my tailored resume attached.');
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Export Your Tailored Resume</h2>
          <p className="text-slate-600">
            Download in ATS-optimized formats or share directly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-12 w-12 text-red-600 mb-3" />
            <h3 className="font-medium text-slate-900 mb-1">PDF Format</h3>
            <p className="text-sm text-slate-600 text-center">
              ATS-optimized PDF, perfect for most applications
            </p>
          </button>

          <button
            onClick={() => handleExport('word')}
            disabled={isExporting}
            className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-12 w-12 text-blue-600 mb-3" />
            <h3 className="font-medium text-slate-900 mb-1">Word Document</h3>
            <p className="text-sm text-slate-600 text-center">
              Editable format for further customization
            </p>
          </button>

          <button
            onClick={() => handleExport('txt')}
            disabled={isExporting}
            className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="font-medium text-slate-900 mb-1">Plain Text</h3>
            <p className="text-sm text-slate-600 text-center">
              Simple format for online applications
            </p>
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEmailSend}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Email Resume</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share Link</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Save to Drive</span>
            </button>
          </div>
        </div>

        {isExporting && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 font-medium">Generating ATS-optimized resume...</p>
            </div>
          </div>
        )}

        {exportCompleted && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">Resume exported successfully!</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4">Resume Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">87%</p>
            <p className="text-sm text-slate-600">Job Match Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">6</p>
            <p className="text-sm text-slate-600">Keywords Added</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">98%</p>
            <p className="text-sm text-slate-600">ATS Compatibility</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">3</p>
            <p className="text-sm text-slate-600">Portfolio Projects</p>
          </div>
        </div>
      </div>
    </div>
  );
}