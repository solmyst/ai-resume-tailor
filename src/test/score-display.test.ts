import { describe, it, expect } from 'vitest';

// Mirror getScoreColor from ResumeTailor.tsx
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-ember';
  if (score >= 60) return 'text-slate';
  if (score >= 40) return 'text-slate';
  return 'text-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

describe('Score Display Utilities', () => {
  it('returns ember for scores >= 80', () => {
    expect(getScoreColor(80)).toBe('text-ember');
    expect(getScoreColor(95)).toBe('text-ember');
    expect(getScoreColor(100)).toBe('text-ember');
  });

  it('returns slate for mid-range scores (40-79)', () => {
    expect(getScoreColor(60)).toBe('text-slate');
    expect(getScoreColor(45)).toBe('text-slate');
    expect(getScoreColor(79)).toBe('text-slate');
  });

  it('returns red for low scores (< 40)', () => {
    expect(getScoreColor(0)).toBe('text-red-500');
    expect(getScoreColor(20)).toBe('text-red-500');
    expect(getScoreColor(39)).toBe('text-red-500');
  });

  it('clamps scores to 0-100 range', () => {
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(150)).toBe(100);
    expect(clampScore(75)).toBe(75);
  });

  it('returns correct labels for score ranges', () => {
    expect(getScoreLabel(90)).toBe('Excellent');
    expect(getScoreLabel(65)).toBe('Good');
    expect(getScoreLabel(45)).toBe('Fair');
    expect(getScoreLabel(20)).toBe('Needs Work');
  });
});
