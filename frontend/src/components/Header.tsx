import React from 'react';
import { Brain, Target, FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-600" />
              <Target className="h-4 w-4 text-purple-600 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ResumeAI Tailor</h1>
              <p className="text-sm text-slate-600">AI-Powered Resume Optimization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <FileText className="h-4 w-4" />
              <span>ATS Optimized</span>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}