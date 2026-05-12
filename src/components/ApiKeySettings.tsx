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
    openai: { label: 'OpenAI GPT-4o-mini', color: 'text-emerald-400' },
    gemini: { label: 'Google Gemini', color: 'text-blue-400' },
    ollama: { label: 'Ollama (Local)', color: 'text-purple-400' },
    mock: { label: 'Offline Keywords', color: 'text-amber-400' },
    offline: { label: 'Backend Offline', color: 'text-red-400' },
    unknown: { label: 'Unknown', color: 'text-slate-400' },
  };

  const provider = providerLabel[currentProvider] || providerLabel.unknown;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-2xl shadow-blue-500/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">AI Settings</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Provider Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Current Provider Status */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-slate-300">Active Provider</span>
              </div>
              <span className={`text-sm font-black ${provider.color}`}>{provider.label}</span>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
              OpenAI API Key
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setStatus('idle'); }}
                placeholder="sk-proj-..."
                className="flex-1 glass-input bg-transparent font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={!apiKey.trim() || status === 'validating'}
                className="btn-primary !px-6 !py-3 !rounded-xl whitespace-nowrap disabled:opacity-40"
              >
                {status === 'validating' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              {message}
            </div>
          )}

          {/* Clear Key */}
          {hasKey && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove API Key
            </button>
          )}

          {/* Info */}
          <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-300 mb-1">Privacy & Cost</p>
                <p>Your key stays in memory only — it's never stored to disk or sent anywhere except OpenAI. Uses <span className="text-blue-400 font-bold">gpt-4o-mini</span> (~$0.15/M input tokens) for maximum cost efficiency.</p>
              </div>
            </div>
          </div>

          {/* Priority chain */}
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
            Priority: OpenAI → Gemini → Ollama → Offline
          </div>
        </div>
      </div>
    </div>
  );
};
