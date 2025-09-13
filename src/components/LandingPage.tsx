import React from 'react';
import { Brain, Target, FileText, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignUp, onSignIn }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-blue-600" />
                <Target className="h-4 w-4 text-purple-600 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI Resume Tailor</h1>
                <p className="text-sm text-slate-600">Smart Resume Optimization</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={onSignIn}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onSignUp}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Resume Tailoring
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Stop sending the same resume to every job. Our AI analyzes job descriptions and 
              automatically optimizes your resume for each application.
            </p>
            <button 
              onClick={onSignUp}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Start Tailoring Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AI Resume Tailor?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Smart NLP Analysis</h3>
              <p className="text-gray-600">
                Advanced spaCy and BERT models extract key skills and requirements from job descriptions
              </p>
            </div>
            
            <div className="text-center p-6">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">ATS Optimization</h3>
              <p className="text-gray-600">
                Ensures your resume passes Applicant Tracking Systems with proper keyword placement
              </p>
            </div>
            
            <div className="text-center p-6">
              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Portfolio Suggestions</h3>
              <p className="text-gray-600">
                Get personalized project recommendations to showcase relevant skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-gray-600">
                  Upload your current resume in PDF, DOC, or TXT format. Our AI extracts and analyzes your content.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Paste Job Description</h3>
                <p className="text-gray-600">
                  Copy and paste the job description. Our NLP models identify key requirements and skills.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Optimization</h3>
                <p className="text-gray-600">
                  Our AI rewrites your resume to match the job requirements while maintaining truthfulness.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Download & Apply</h3>
                <p className="text-gray-600">
                  Get your tailored resume with match scores, keyword analysis, and portfolio suggestions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who've improved their job application success rate
          </p>
          <button 
            onClick={onSignUp}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
};