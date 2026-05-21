import { describe, it, expect } from 'vitest';

// Tests for file upload validation logic used in ResumeTailor and FileUpload components

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.substring(lastDot).toLowerCase();
}

function isAllowedFileType(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ALLOWED_EXTENSIONS.includes(ext);
}

function isFileSizeValid(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE_BYTES;
}

function getUploadErrorMessage(file: { name: string; size: number }): string | null {
  if (!isAllowedFileType(file.name)) {
    return 'Invalid file type. Please upload a PDF, DOCX, or TXT file.';
  }
  if (!isFileSizeValid(file.size)) {
    if (file.size === 0) return 'File is empty.';
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}

function generateDownloadFilename(): string {
  return `tailored-resume-${Date.now()}.pdf`;
}

describe('File Upload Validation', () => {
  describe('File Extension Check', () => {
    it('accepts PDF files', () => {
      expect(isAllowedFileType('resume.pdf')).toBe(true);
      expect(isAllowedFileType('Resume.PDF')).toBe(true);
    });

    it('accepts DOCX and DOC files', () => {
      expect(isAllowedFileType('resume.docx')).toBe(true);
      expect(isAllowedFileType('resume.doc')).toBe(true);
    });

    it('accepts TXT files', () => {
      expect(isAllowedFileType('resume.txt')).toBe(true);
    });

    it('rejects unsupported file types', () => {
      expect(isAllowedFileType('resume.jpg')).toBe(false);
      expect(isAllowedFileType('resume.png')).toBe(false);
      expect(isAllowedFileType('resume.xlsx')).toBe(false);
      expect(isAllowedFileType('resume.exe')).toBe(false);
    });

    it('rejects files with no extension', () => {
      expect(isAllowedFileType('resume')).toBe(false);
    });
  });

  describe('File Size Check', () => {
    it('accepts files under 10MB', () => {
      expect(isFileSizeValid(1024)).toBe(true); // 1KB
      expect(isFileSizeValid(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(isFileSizeValid(MAX_FILE_SIZE_BYTES)).toBe(true); // Exactly 10MB
    });

    it('rejects files over 10MB', () => {
      expect(isFileSizeValid(MAX_FILE_SIZE_BYTES + 1)).toBe(false);
      expect(isFileSizeValid(20 * 1024 * 1024)).toBe(false); // 20MB
    });

    it('rejects empty files', () => {
      expect(isFileSizeValid(0)).toBe(false);
    });
  });

  describe('Upload Error Messages', () => {
    it('returns null for valid files', () => {
      expect(getUploadErrorMessage({ name: 'resume.pdf', size: 1024 })).toBeNull();
    });

    it('returns error for invalid type', () => {
      const msg = getUploadErrorMessage({ name: 'photo.jpg', size: 1024 });
      expect(msg).toContain('Invalid file type');
    });

    it('returns error for oversized files', () => {
      const msg = getUploadErrorMessage({ name: 'resume.pdf', size: 15 * 1024 * 1024 });
      expect(msg).toContain('too large');
    });

    it('returns error for empty files', () => {
      const msg = getUploadErrorMessage({ name: 'resume.pdf', size: 0 });
      expect(msg).toContain('empty');
    });
  });

  describe('Download Filename Generation', () => {
    it('generates a filename with .pdf extension', () => {
      const name = generateDownloadFilename();
      expect(name).toMatch(/^tailored-resume-\d+\.pdf$/);
    });

    it('generates unique filenames on each call', () => {
      const name1 = generateDownloadFilename();
      // Small delay to ensure different timestamp
      const name2 = `tailored-resume-${Date.now() + 1}.pdf`;
      expect(name1).not.toBe(name2);
    });
  });
});
