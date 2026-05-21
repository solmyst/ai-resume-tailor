import { describe, it, expect } from 'vitest';

// Mirrors the step logic from ResumeTailor.tsx
type Step = 'upload' | 'job-description' | 'processing' | 'analysis' | 'generating' | 'resume';

const STEPPER_STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'job-description', label: 'Target' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'resume', label: 'Document' },
];

function getStepIndex(step: Step): number {
  if (step === 'upload') return 0;
  if (step === 'job-description') return 1;
  if (step === 'processing' || step === 'analysis') return 2;
  if (step === 'generating' || step === 'resume') return 3;
  return 0;
}

function getVisibleSteps(): { key: string; label: string }[] {
  return STEPPER_STEPS;
}

function isStepCompleted(currentStep: Step, checkStep: string): boolean {
  const currentIndex = getStepIndex(currentStep);
  const checkIndex = STEPPER_STEPS.findIndex(s => s.key === checkStep);
  return currentIndex > checkIndex;
}

function canNavigateToStep(currentStep: Step, targetStep: Step): boolean {
  // Users can only go back, not forward
  const currentIdx = getStepIndex(currentStep);
  const targetIdx = getStepIndex(targetStep);
  return targetIdx < currentIdx;
}

describe('Workflow Step Navigation', () => {
  it('maps upload to step index 0', () => {
    expect(getStepIndex('upload')).toBe(0);
  });

  it('maps job-description to step index 1', () => {
    expect(getStepIndex('job-description')).toBe(1);
  });

  it('maps both processing and analysis to step index 2', () => {
    expect(getStepIndex('processing')).toBe(2);
    expect(getStepIndex('analysis')).toBe(2);
  });

  it('maps both generating and resume to step index 3', () => {
    expect(getStepIndex('generating')).toBe(3);
    expect(getStepIndex('resume')).toBe(3);
  });

  it('shows exactly 4 visible stepper steps', () => {
    const steps = getVisibleSteps();
    expect(steps).toHaveLength(4);
    expect(steps[0].label).toBe('Upload');
    expect(steps[3].label).toBe('Document');
  });

  it('marks previous steps as completed', () => {
    expect(isStepCompleted('analysis', 'upload')).toBe(true);
    expect(isStepCompleted('analysis', 'job-description')).toBe(true);
    expect(isStepCompleted('analysis', 'analysis')).toBe(false);
  });

  it('does not allow forward navigation', () => {
    expect(canNavigateToStep('upload', 'analysis')).toBe(false);
    expect(canNavigateToStep('analysis', 'upload')).toBe(true);
  });
});
