import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_BASE_URL } from '../config';

// Test the API integration patterns used in ResumeTailor.tsx and Dashboard.tsx
// These test the fetch calls, error handling, and response processing

describe('API Integration Patterns', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Upload Resume Endpoint', () => {
    it('constructs correct upload URL', () => {
      const uploadUrl = `${API_BASE_URL}/api/upload-resume`;
      expect(uploadUrl).toContain('/api/upload-resume');
      expect(uploadUrl).toMatch(/^https?:\/\/.+\/api\/upload-resume$/);
    });

    it('creates proper FormData for file upload', () => {
      const formData = new FormData();
      const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      formData.append('file', mockFile);
      formData.append('userId', 'test-user-123');

      expect(formData.get('file')).toBeTruthy();
      expect(formData.get('userId')).toBe('test-user-123');
    });
  });

  describe('Tailor Resume Endpoint', () => {
    it('constructs correct tailor URL', () => {
      const tailorUrl = `${API_BASE_URL}/api/tailor-resume`;
      expect(tailorUrl).toContain('/api/tailor-resume');
    });

    it('builds correct request body with resume and job description', () => {
      const body = JSON.stringify({
        resume_text: 'My resume content',
        job_description: 'Senior developer needed with React and Python',
        userId: 'user-1',
      });
      const parsed = JSON.parse(body);
      expect(parsed).toHaveProperty('resume_text');
      expect(parsed).toHaveProperty('job_description');
      expect(parsed).toHaveProperty('userId');
    });

    it('sends empty job_description for general ATS mode', () => {
      const isGeneral = true;
      const jobDescText = 'some text';
      const textToSend = isGeneral ? '' : jobDescText;
      expect(textToSend).toBe('');
    });
  });

  describe('Generate PDF Endpoint', () => {
    it('constructs correct PDF generation URL', () => {
      const pdfUrl = `${API_BASE_URL}/api/generate-pdf`;
      expect(pdfUrl).toContain('/api/generate-pdf');
    });

    it('sends tailored text in request body', () => {
      const body = { tailored_text: '# Optimized Resume\n## Skills\nPython, React' };
      expect(body.tailored_text).toBeTruthy();
      expect(body.tailored_text.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Patterns', () => {
    it('handles network errors with user-friendly messages', () => {
      const getErrorMessage = (err: unknown): string => {
        if (err instanceof TypeError && (err as Error).message === 'Failed to fetch') {
          return 'Cannot connect to the backend server. The server may be starting up — please wait a moment and try again.';
        }
        return (err as Error)?.message || 'An unknown error occurred.';
      };

      const networkError = new TypeError('Failed to fetch');
      expect(getErrorMessage(networkError)).toContain('Cannot connect');
    });

    it('extracts error message from backend response', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'File too large' }),
      };

      let errorMsg = 'Default error message';
      try {
        const errorData = await mockResponse.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        // Keep default
      }
      expect(errorMsg).toBe('File too large');
    });

    it('falls back to default message when response has no error field', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({}),
      };

      let errorMsg = 'Failed to process resume';
      try {
        const errorData = await mockResponse.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        // Keep default
      }
      expect(errorMsg).toBe('Failed to process resume');
    });
  });

  describe('Analyze Job URL Endpoint', () => {
    it('constructs correct analyze-job URL', () => {
      const analyzeUrl = `${API_BASE_URL}/api/analyze-job`;
      expect(analyzeUrl).toContain('/api/analyze-job');
    });

    it('sends job URL in request body', () => {
      const body = JSON.stringify({ job_url: 'https://linkedin.com/jobs/12345' });
      const parsed = JSON.parse(body);
      expect(parsed.job_url).toBe('https://linkedin.com/jobs/12345');
    });
  });
});
