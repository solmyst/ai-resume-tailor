import { describe, it, expect } from 'vitest';

// Port of backend's validate_resume_format logic to TypeScript
function validateResumeFormat(text: string): { isValid: boolean; warning: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, warning: 'Empty or invalid document text.' };
  }

  const clean = text.trim();
  if (clean.length < 250) {
    return { isValid: false, warning: `Document too short (${clean.length} chars).` };
  }

  const hasExperience = /\b(experience|employment|work history|professional experience)\b/i.test(clean);
  const hasEducation = /\b(education|academic|university|college|degree|certifications)\b/i.test(clean);
  const hasSkills = /\b(skills|technical skills|technologies|proficiencies|core competencies)\b/i.test(clean);
  const hasSummary = /\b(summary|objective|profile|professional summary|about me)\b/i.test(clean);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(clean);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(clean);

  const structuralMatches = [hasExperience, hasEducation, hasSkills, hasSummary].filter(Boolean).length;
  const hasContact = hasEmail || hasPhone;
  const isValid = (hasExperience || hasEducation) && (structuralMatches >= 2 || (structuralMatches >= 1 && hasContact));

  if (!isValid) {
    const issues: string[] = [];
    if (!hasExperience) issues.push('Missing Experience section');
    if (!hasEducation) issues.push('Missing Education section');
    if (!hasSkills && !hasSummary) issues.push('Missing Skills or Summary section');
    if (!hasContact) issues.push('Missing contact details');
    return { isValid: false, warning: issues.join('; ') };
  }

  return { isValid: true, warning: '' };
}

describe('Resume Format Validation', () => {
  it('accepts a well-structured resume', () => {
    const resume = `John Doe
john@email.com | 555-123-4567

Professional Summary
Experienced software engineer with 5 years building scalable systems.

Technical Skills
Python, React, AWS, Docker, PostgreSQL

Professional Experience
Senior Developer at TechCorp (2020-2024)
- Built microservices architecture serving 1M daily requests
- Led team of 5 engineers on cloud migration project

Education
BS Computer Science, MIT, 2019
${'x'.repeat(100)}`; // Ensure length > 250
    const result = validateResumeFormat(resume);
    expect(result.isValid).toBe(true);
    expect(result.warning).toBe('');
  });

  it('rejects empty text', () => {
    expect(validateResumeFormat('').isValid).toBe(false);
    expect(validateResumeFormat('').warning).toBe('Empty or invalid document text.');
  });

  it('rejects text shorter than 250 characters', () => {
    const result = validateResumeFormat('Too short to be a resume');
    expect(result.isValid).toBe(false);
    expect(result.warning).toContain('too short');
  });

  it('rejects a document without experience or education sections', () => {
    const doc = `${'This is a random document about cooking recipes. '.repeat(10)}`;
    const result = validateResumeFormat(doc);
    expect(result.isValid).toBe(false);
  });

  it('accepts resume with experience + contact even without explicit skills heading', () => {
    const resume = `Jane Smith\njane@email.com\n\nProfessional Experience\nWorked at Google for 5 years building infrastructure systems and managing deployments across regions.\n${'x'.repeat(200)}`;
    const result = validateResumeFormat(resume);
    expect(result.isValid).toBe(true);
  });
});
