import { describe, it, expect } from 'vitest';

// Mirrors the type definitions and validation from App.tsx and ResumeTailor.tsx

type Subscription = 'free' | 'premium' | 'professional';

interface User {
  id: string;
  name: string;
  email: string;
  subscription: Subscription;
  avatar?: string;
}

interface ResumeData {
  originalText: string;
  fileName: string;
  skills: string[];
  experience: string[];
  education: string[];
}

interface AnalysisResult {
  matchScore: number;
  addedKeywords: string[];
  tailoredText: string;
  atsOptimized: boolean;
}

function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'local-user',
    name: 'User',
    email: '',
    subscription: 'professional',
    ...overrides,
  };
}

function isValidResumeData(data: unknown): data is ResumeData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.originalText === 'string' &&
    typeof d.fileName === 'string' &&
    Array.isArray(d.skills) &&
    Array.isArray(d.experience) &&
    Array.isArray(d.education)
  );
}

function isValidAnalysisResult(data: unknown): data is AnalysisResult {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.matchScore === 'number' &&
    d.matchScore >= 0 &&
    d.matchScore <= 100 &&
    Array.isArray(d.addedKeywords) &&
    typeof d.tailoredText === 'string' &&
    typeof d.atsOptimized === 'boolean'
  );
}

function mapBackendResponse(data: {
  tailored_resume: string;
  match_score?: number;
  added_keywords?: string[];
  ats_optimized?: boolean;
}): AnalysisResult {
  return {
    tailoredText: data.tailored_resume,
    matchScore: data.match_score || 0,
    addedKeywords: data.added_keywords || [],
    atsOptimized: data.ats_optimized || false,
  };
}

describe('Type Contracts & Data Validation', () => {
  describe('User type', () => {
    it('creates a valid mock user matching Quick Start behavior', () => {
      const user = createMockUser();
      expect(user.id).toBe('local-user');
      expect(user.name).toBe('User');
      expect(user.email).toBe('');
      expect(user.subscription).toBe('professional');
    });

    it('allows overriding mock user fields', () => {
      const user = createMockUser({ name: 'Test', subscription: 'free' });
      expect(user.name).toBe('Test');
      expect(user.subscription).toBe('free');
    });
  });

  describe('ResumeData validation', () => {
    it('accepts valid resume data', () => {
      const data: ResumeData = {
        originalText: 'My resume text',
        fileName: 'resume.pdf',
        skills: ['Python', 'React'],
        experience: ['Company A'],
        education: ['BS CS'],
      };
      expect(isValidResumeData(data)).toBe(true);
    });

    it('rejects incomplete resume data', () => {
      expect(isValidResumeData({ originalText: 'text' })).toBe(false);
      expect(isValidResumeData(null)).toBe(false);
      expect(isValidResumeData(undefined)).toBe(false);
    });
  });

  describe('AnalysisResult validation', () => {
    it('accepts valid analysis result', () => {
      const result: AnalysisResult = {
        matchScore: 85,
        addedKeywords: ['React', 'AWS'],
        tailoredText: 'Tailored resume text',
        atsOptimized: true,
      };
      expect(isValidAnalysisResult(result)).toBe(true);
    });

    it('rejects analysis with out-of-range score', () => {
      expect(isValidAnalysisResult({ matchScore: 150, addedKeywords: [], tailoredText: '', atsOptimized: true })).toBe(false);
      expect(isValidAnalysisResult({ matchScore: -5, addedKeywords: [], tailoredText: '', atsOptimized: true })).toBe(false);
    });
  });

  describe('Backend response mapping', () => {
    it('maps snake_case backend response to camelCase frontend types', () => {
      const backendData = {
        tailored_resume: 'Optimized resume content',
        match_score: 78,
        added_keywords: ['Docker', 'Kubernetes'],
        ats_optimized: true,
      };
      const result = mapBackendResponse(backendData);
      expect(result.tailoredText).toBe('Optimized resume content');
      expect(result.matchScore).toBe(78);
      expect(result.addedKeywords).toEqual(['Docker', 'Kubernetes']);
      expect(result.atsOptimized).toBe(true);
    });

    it('provides defaults for missing optional fields', () => {
      const backendData = { tailored_resume: 'Text' };
      const result = mapBackendResponse(backendData);
      expect(result.matchScore).toBe(0);
      expect(result.addedKeywords).toEqual([]);
      expect(result.atsOptimized).toBe(false);
    });
  });
});
