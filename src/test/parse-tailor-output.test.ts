import { describe, it, expect } from 'vitest';

// Port of _parse_tailor_output from ai_service.py
function parseTailorOutput(raw: string): { tailoredText: string; matchScore: number; changesMade: string[] } {
  let matchScore = 65;
  let changes: string[] = [];
  let resumeText = raw.trim();

  const scoreMatch = raw.match(/MATCH_SCORE:\s*(\d+)/);
  if (scoreMatch) {
    matchScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
  }

  const changesMatch = raw.match(/CHANGES:\s*(.+)/);
  if (changesMatch) {
    changes = changesMatch[1].split('|').map(c => c.trim()).filter(c => c.length > 0);
  }

  resumeText = resumeText.replace(/\n*MATCH_SCORE:.*/, '').trim();
  resumeText = resumeText.replace(/\n*CHANGES:.*/, '').trim();
  resumeText = resumeText.replace(/^```\w*\n?/, '');
  resumeText = resumeText.replace(/\n?```\s*$/, '');

  if (changes.length === 0) {
    changes = ['Tailored resume to match job description', 'Optimized keywords for ATS'];
  }

  return { tailoredText: resumeText, matchScore, changesMade: changes };
}

describe('Parse Tailor Output', () => {
  it('extracts MATCH_SCORE correctly', () => {
    const raw = '# Resume Content\nSome text\n\nMATCH_SCORE: 87\nCHANGES: Added keywords | Improved structure';
    const result = parseTailorOutput(raw);
    expect(result.matchScore).toBe(87);
  });

  it('extracts CHANGES as array', () => {
    const raw = 'Resume body\n\nMATCH_SCORE: 72\nCHANGES: Optimized summary | Added React keyword | Restructured experience';
    const result = parseTailorOutput(raw);
    expect(result.changesMade).toHaveLength(3);
    expect(result.changesMade[0]).toBe('Optimized summary');
  });

  it('strips metadata lines from resume body', () => {
    const raw = '# John Doe\nDeveloper\n\nMATCH_SCORE: 80\nCHANGES: Fixed layout';
    const result = parseTailorOutput(raw);
    expect(result.tailoredText).not.toContain('MATCH_SCORE');
    expect(result.tailoredText).not.toContain('CHANGES');
    expect(result.tailoredText).toContain('# John Doe');
  });

  it('defaults to score 65 when no MATCH_SCORE found', () => {
    const result = parseTailorOutput('Just a resume without metadata');
    expect(result.matchScore).toBe(65);
  });

  it('provides default changes when none specified', () => {
    const result = parseTailorOutput('Just a resume');
    expect(result.changesMade).toHaveLength(2);
    expect(result.changesMade[0]).toContain('Tailored');
  });

  it('clamps score to 0-100 range', () => {
    const over = parseTailorOutput('Resume\nMATCH_SCORE: 150');
    expect(over.matchScore).toBe(100);
  });

  it('strips markdown code fences', () => {
    const raw = '```markdown\n# Resume\nContent here\n```\nMATCH_SCORE: 75\nCHANGES: Cleaned up';
    const result = parseTailorOutput(raw);
    expect(result.tailoredText).not.toMatch(/^```/);
    expect(result.tailoredText).not.toMatch(/```$/);
  });
});
