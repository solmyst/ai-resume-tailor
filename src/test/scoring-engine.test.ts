import { describe, it, expect } from 'vitest';

// Re-implement the mock scoring logic from the Python backend in TypeScript for testing
// This mirrors _mock_tailor_resume's keyword matching
const COMMON_KEYWORDS = [
  'Scalability', 'Optimization', 'Architecture', 'Leadership', 'Agile',
  'Impact', 'Growth', 'Python', 'Java', 'React', 'Node', 'SQL', 'AWS',
  'Docker', 'Kubernetes', 'JavaScript', 'TypeScript', 'CI/CD', 'REST',
  'API', 'Cloud', 'Machine Learning', 'Data', 'Testing', 'DevOps',
  'Communication', 'Collaboration', 'Problem Solving'
];

function calculateKeywordScore(resumeText: string, jobText: string): number {
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobText.toLowerCase();
  const jobKeywords = COMMON_KEYWORDS.filter(k => jobLower.includes(k.toLowerCase()));
  if (jobKeywords.length === 0) return 50;
  const matched = jobKeywords.filter(k => resumeLower.includes(k.toLowerCase()));
  return Math.round((matched.length / jobKeywords.length) * 100);
}

function calculateLayoutScore(text: string): number {
  const sections = ['experience', 'education', 'skills', 'summary', 'projects'];
  const found = sections.filter(s => text.toLowerCase().includes(s));
  return Math.min(100, Math.round((found.length / 4) * 100));
}

function calculateMetricsScore(text: string): number {
  const bullets = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
  if (bullets.length === 0) return 0;
  const withMetrics = bullets.filter(b => /\d+%|\$[\d,]+|\d+x|\b\d{2,}\b/.test(b));
  return Math.round((withMetrics.length / bullets.length) * 100);
}

const ACTIVE_VERBS = ['Led', 'Developed', 'Architected', 'Optimized', 'Delivered', 'Implemented', 'Designed', 'Built', 'Managed', 'Spearheaded', 'Reduced', 'Increased'];

function calculateActiveVerbScore(text: string): number {
  const bullets = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
  if (bullets.length === 0) return 0;
  const withVerbs = bullets.filter(b => {
    const content = b.replace(/^[-•]\s*/, '').trim();
    return ACTIVE_VERBS.some(v => content.startsWith(v));
  });
  return Math.round((withVerbs.length / bullets.length) * 100);
}

function calculateWeightedATSScore(resume: string, job: string): number {
  const keyword = calculateKeywordScore(resume, job) * 0.4;
  const layout = calculateLayoutScore(resume) * 0.3;
  const metrics = calculateMetricsScore(resume) * 0.2;
  const verbs = calculateActiveVerbScore(resume) * 0.1;
  return Math.round(keyword + layout + metrics + verbs);
}

describe('4-Component ATS Scoring Engine', () => {
  describe('Keyword Match (40% weight)', () => {
    it('should score high when resume keywords match job description', () => {
      const resume = 'Expert in Python, React, AWS, Docker, and Kubernetes. Built REST APIs.';
      const job = 'Looking for Python developer with React, AWS, and Docker experience. REST API design required.';
      const score = calculateKeywordScore(resume, job);
      expect(score).toBeGreaterThanOrEqual(80);
    });

    it('should score low when resume lacks job-required keywords', () => {
      const resume = 'Experienced in sales and marketing. Team management.';
      const job = 'Looking for Python developer with React, AWS, Docker, Kubernetes, CI/CD, and REST API skills.';
      const score = calculateKeywordScore(resume, job);
      expect(score).toBeLessThan(30);
    });

    it('should return 50 when job has no recognizable keywords', () => {
      const score = calculateKeywordScore('any resume', 'nothing matches here xyz');
      expect(score).toBe(50);
    });
  });

  describe('Layout & Parsability (30% weight)', () => {
    it('should score high for well-structured resume with all sections', () => {
      const resume = '## Summary\nSenior dev\n## Experience\nWorked at...\n## Education\nBS CS\n## Skills\nPython';
      const score = calculateLayoutScore(resume);
      expect(score).toBe(100);
    });

    it('should score low for unstructured text', () => {
      const resume = 'I am a developer who has done many things. I once built a website.';
      const score = calculateLayoutScore(resume);
      expect(score).toBeLessThanOrEqual(25);
    });
  });

  describe('Quantifiable Accomplishments (20% weight)', () => {
    it('should score high when bullets have metrics', () => {
      const resume = '- Increased revenue by 35%\n- Reduced latency by 200ms to 50ms\n- Managed $2,000,000 budget\n- Led team of 12 engineers';
      const score = calculateMetricsScore(resume);
      expect(score).toBeGreaterThanOrEqual(75);
    });

    it('should score zero with no bullets', () => {
      const resume = 'Just a plain paragraph with no bullet points at all.';
      const score = calculateMetricsScore(resume);
      expect(score).toBe(0);
    });
  });

  describe('Active Verbs & Impact (10% weight)', () => {
    it('should score high with strong action verbs', () => {
      const resume = '- Led cross-functional team\n- Architected microservices platform\n- Optimized database queries\n- Developed real-time pipeline';
      const score = calculateActiveVerbScore(resume);
      expect(score).toBe(100);
    });

    it('should score low with passive language', () => {
      const resume = '- Was responsible for team\n- Helped with database\n- Worked on pipeline\n- Assisted with deployment';
      const score = calculateActiveVerbScore(resume);
      expect(score).toBe(0);
    });
  });

  describe('Weighted Composite Score', () => {
    it('should produce a high composite for a strong resume matched to job', () => {
      const resume = `## Summary
Senior Full Stack Developer with 8 years experience
## Skills
Python, React, AWS, Docker, Kubernetes, JavaScript, TypeScript, REST, API, SQL
## Experience
- Led migration of monolith to microservices, reducing deploy time by 40%
- Architected real-time data pipeline processing 1M events/day
- Developed React dashboard used by 500+ internal users
- Optimized SQL queries improving response time by 60%
## Education
BS Computer Science`;
      const job = 'Senior Python developer needed. React, AWS, Docker, REST API, SQL required.';
      const score = calculateWeightedATSScore(resume, job);
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should produce a low composite for a mismatched resume', () => {
      const resume = 'I worked at a store. I sold things. No bullet points.';
      const job = 'Senior Python React AWS Docker engineer needed. REST API, SQL, CI/CD, Kubernetes.';
      const score = calculateWeightedATSScore(resume, job);
      expect(score).toBeLessThanOrEqual(25);
    });
  });
});
