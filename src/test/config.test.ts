import { describe, it, expect } from 'vitest';
import { APP_CONFIG, API_BASE_URL } from '../config';

describe('Application Configuration', () => {
  it('exports a valid API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL.length).toBeGreaterThan(0);
  });

  it('APP_CONFIG contains required fields', () => {
    expect(APP_CONFIG).toHaveProperty('VERSION');
    expect(APP_CONFIG).toHaveProperty('API_BASE_URL');
    expect(APP_CONFIG.VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('API_BASE_URL uses HTTPS in production', () => {
    if (!API_BASE_URL.includes('localhost')) {
      expect(API_BASE_URL).toMatch(/^https:\/\//);
    }
  });
});
