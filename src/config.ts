/**
 * Application Configuration
 */

// Use environment variable for API URL if provided, otherwise fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://ai-resume-tailor-efof.onrender.com');

export const APP_CONFIG = {
  VERSION: '1.0.0',
  API_BASE_URL,
};
