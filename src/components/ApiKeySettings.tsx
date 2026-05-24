import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Loader2, X, Zap, Shield, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [currentProvider, setCurrentProvider] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      const data = await res.json();
      setCurrentProvider(data.ai_provider || 'unknown');
      setHasKey(data.has_openai_key || false);
    } catch {
      setCurrentProvider('offline');
    }
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) return;

    setStatus('validating');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'API key activated!');
        setCurrentProvider(data.provider);
        setHasKey(true);
        setApiKey('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Validation failed');
      }
    } catch {
      setStatus('error');
      setMessage('Cannot connect to backend server');
    }
  };

  const handleClear = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/api-key`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setCurrentProvider(data.provider);
        setHasKey(false);
        setStatus('idle');
        setMessage('');
      }
    } catch {
      setMessage('Failed to clear key');
    }
  };

  if (!isOpen) return null;

  const providerLabel: Record<string, { label: string; color: string }> = {
    openai: { label: 'OpenAI GPT-4o-mini', color: 'text-ember font-bold' },
    gemini: { label: 'Google Gemini', color: 'text-ember font-bold' },
    ollama: { label: 'Ollama (Local)', color: 'text-ember font-bold' },
    mock: { label: 'Offline Keywords', color: 'text-slate font-bold' },
    offline: { label: 'Backend Offline', color: 'text-red-500 font-bold' },
    unknown: { label: 'Unknown', color: 'text-slate font-bold' },
  };

  const provider = Object.prototype.hasOwnProperty.call(providerLabel, currentProvider)
    ? providerLabel[currentProvider]
    : providerLabel.unknown;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-stone border border-linen rounded-3xl shadow-[0_12px_40px_rgba(18,18,27,0.08)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linen/20 rounded-2xl flex items-center justify-center border border-linen">
              <Key className="w-6 h-6 text-ember" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">AI Settings</h2>
              <p className="text-xs text-slate/60 font-bold uppercase tracking-widest mt-1">Provider Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate hover:text-ink hover:bg-linen/20 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Current Provider Status */}
          <div className="p-5 rounded-2xl bg-linen/20 border border-linen">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-ember" />
                <span className="text-sm font-bold text-slate">Active Provider</span>
              </div>
              <span className={`text-sm ${provider.color}`}>{provider.label}</span>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate/60 mb-3">
              OpenAI API Key
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setStatus('idle'); }}
                placeholder="sk-proj-..."
                className="flex-1 glass-input font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={!apiKey.trim() || status === 'validating'}
                className="btn-primary !px-6 !py-3 !rounded-xl whitespace-nowrap"
              >
                {status === 'validating' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-fog" />
                ) : (
                  'Activate'
                )}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-bold ${
              status === 'success'
                ? 'bg-linen/20 border border-ember/40 text-ember'
                : 'bg-ink/5 border border-linen text-slate'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-ember" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              )}
              {message}
            </div>
          )}

          {/* Clear Key */}
          {hasKey && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 text-xs font-bold text-slate/60 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove API Key
            </button>
          )}

          {/* Info */}
          <div className="p-5 rounded-2xl bg-linen/20 border border-linen space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-ember mt-0.5 shrink-0" />
              <div className="text-xs text-slate leading-relaxed">
                <p className="font-bold text-ink mb-1">Privacy & Cost</p>
                <p>Your key stays in memory only — it's never stored to disk or sent anywhere except OpenAI. Uses <span className="text-ember font-bold">gpt-4o-mini</span> (~$0.15/M input tokens) for maximum cost efficiency.</p>
              </div>
            </div>
          </div>

          {/* Priority chain */}
          <div className="text-[10px] text-slate/40 font-bold uppercase tracking-widest text-center">
            Priority: OpenAI → Gemini → Ollama → Offline
          </div>
        </div>
      </div>
    </div>
  );
};
