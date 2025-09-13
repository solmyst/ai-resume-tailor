import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: string;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${isCompleted 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : isActive 
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 text-slate-400 bg-white'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive || isCompleted ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              
              {!isLast && (
                <div className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}