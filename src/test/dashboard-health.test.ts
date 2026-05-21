import { describe, it, expect } from 'vitest';

// Mirrors the Dashboard's getProviderLabel and getProviderColor from Dashboard.tsx

function getProviderLabel(provider: string): string {
  switch (provider) {
    case 'openai': return 'OpenAI GPT-4o-mini';
    case 'gemini': return 'Google Gemini';
    case 'ollama': return 'Ollama (Local)';
    case 'mock': return 'Offline Keywords';
    default: return 'Unknown';
  }
}

function getProviderColor(provider: string): string {
  switch (provider) {
    case 'openai': return 'text-ember';
    case 'gemini': return 'text-ember';
    case 'ollama': return 'text-emerald-500';
    case 'mock': return 'text-slate';
    default: return 'text-slate';
  }
}

function getDatabaseStatusLabel(status: string): string {
  return status === 'connected' ? 'Healthy' : 'Sync Error';
}

function isMockProvider(provider: string): boolean {
  return provider === 'mock';
}

interface HealthStatus {
  status: string;
  ai_provider: string;
  database: string;
}

function isHealthy(health: HealthStatus | null): boolean {
  if (!health) return false;
  return health.status === 'ok' || health.status === 'healthy';
}

describe('Dashboard Health & Provider Display', () => {
  describe('Provider Labels', () => {
    it('returns correct label for openai provider', () => {
      expect(getProviderLabel('openai')).toBe('OpenAI GPT-4o-mini');
    });

    it('returns correct label for gemini provider', () => {
      expect(getProviderLabel('gemini')).toBe('Google Gemini');
    });

    it('returns correct label for ollama provider', () => {
      expect(getProviderLabel('ollama')).toBe('Ollama (Local)');
    });

    it('returns correct label for mock provider', () => {
      expect(getProviderLabel('mock')).toBe('Offline Keywords');
    });

    it('returns Unknown for unrecognized provider', () => {
      expect(getProviderLabel('something-else')).toBe('Unknown');
    });
  });

  describe('Provider Colors', () => {
    it('uses ember color for openai and gemini', () => {
      expect(getProviderColor('openai')).toBe('text-ember');
      expect(getProviderColor('gemini')).toBe('text-ember');
    });

    it('uses emerald for ollama (local)', () => {
      expect(getProviderColor('ollama')).toBe('text-emerald-500');
    });

    it('uses slate for mock and unknown', () => {
      expect(getProviderColor('mock')).toBe('text-slate');
      expect(getProviderColor('xyz')).toBe('text-slate');
    });
  });

  describe('Database Status', () => {
    it('shows Healthy for connected database', () => {
      expect(getDatabaseStatusLabel('connected')).toBe('Healthy');
    });

    it('shows Sync Error for non-connected database', () => {
      expect(getDatabaseStatusLabel('disconnected')).toBe('Sync Error');
      expect(getDatabaseStatusLabel('')).toBe('Sync Error');
    });
  });

  describe('Mock Provider Warning', () => {
    it('identifies mock provider for warning display', () => {
      expect(isMockProvider('mock')).toBe(true);
      expect(isMockProvider('openai')).toBe(false);
      expect(isMockProvider('ollama')).toBe(false);
    });
  });

  describe('Health Status Check', () => {
    it('returns false when health is null (offline)', () => {
      expect(isHealthy(null)).toBe(false);
    });

    it('returns true for ok status', () => {
      expect(isHealthy({ status: 'ok', ai_provider: 'openai', database: 'connected' })).toBe(true);
    });

    it('returns false for error status', () => {
      expect(isHealthy({ status: 'error', ai_provider: 'mock', database: 'disconnected' })).toBe(false);
    });
  });
});
