import React from 'react';
import { TrendingUp, Target, Award, AlertCircle } from 'lucide-react';
import { ResumeData, JobDescription } from '../App';

interface AnalyticsProps {
  resumeData: ResumeData | null;
  jobDescription: JobDescription | null;
}

export function Analytics({ resumeData, jobDescription }: AnalyticsProps) {
  if (!resumeData && !jobDescription) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4">Resume Analytics</h3>
        <p className="text-slate-500 text-sm">
          Upload your resume to see detailed analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Match Score
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Overall Match</span>
              <span className="text-sm font-medium text-slate-900">87%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Keyword Match</span>
              <span className="text-sm font-medium text-slate-900">92%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">ATS Score</span>
              <span className="text-sm font-medium text-slate-900">95%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-600" />
          Key Matches
        </h3>
        
        {jobDescription && (
          <div className="space-y-2">
            {jobDescription.extractedSkills.slice(0, 4).map((skill, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{skill}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Match</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-600" />
          Improvements
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
            <span className="text-slate-600">Added industry keywords</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
            <span className="text-slate-600">Optimized formatting</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
            <span className="text-slate-600">Enhanced descriptions</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
          Tips
        </h3>
        
        <div className="space-y-2 text-sm text-slate-600">
          <p>• Save multiple versions for different job applications</p>
          <p>• Update your LinkedIn profile to match</p>
          <p>• Prepare examples for mentioned skills</p>
        </div>
      </div>
    </div>
  );
}