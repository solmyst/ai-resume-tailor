import React, { useState } from 'react';
import { ExternalLink, Github, Star, ArrowRight, Plus } from 'lucide-react';
import { PortfolioProject, JobDescription } from '../App';

interface PortfolioSuggestionsProps {
  projects: PortfolioProject[];
  jobDescription: JobDescription;
  onNext: () => void;
}

export function PortfolioSuggestions({ projects, jobDescription, onNext }: PortfolioSuggestionsProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const toggleProject = (projectName: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectName)
        ? prev.filter(name => name !== projectName)
        : [...prev, projectName]
    );
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Portfolio Recommendations</h2>
          <p className="text-slate-600">
            AI-matched projects that best showcase your skills for this role
          </p>
        </div>

        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                selectedProjects.includes(project.name)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => toggleProject(project.name)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{project.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(project.relevanceScore)}`}>
                      <Star className="h-3 w-3 inline mr-1" />
                      {project.relevanceScore}% Match
                    </div>
                  </div>
                  <p className="text-slate-600 mb-3">{project.description}</p>
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedProjects.includes(project.name)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-300'
                }`}>
                  {selectedProjects.includes(project.name) && (
                    <Plus className="h-4 w-4 text-white transform rotate-45" />
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 text-slate-600 hover:text-slate-800"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 text-slate-600 hover:text-slate-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">Why These Projects?</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Match {jobDescription.extractedSkills.length} key skills from the job description</li>
            <li>• Demonstrate relevant experience with required technologies</li>
            <li>• Show progression in complexity and responsibility</li>
            <li>• Include live deployments and source code access</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4">Selection Summary</h3>
        {selectedProjects.length > 0 ? (
          <div className="space-y-2">
            <p className="text-slate-600">
              Selected {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} to highlight:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {selectedProjects.map((projectName) => (
                <li key={projectName}>{projectName}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-slate-500">No projects selected yet. Click on projects above to include them.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Export & Finalize</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}