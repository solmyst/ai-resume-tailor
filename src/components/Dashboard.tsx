import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Plus, Clock, Wifi, WifiOff, CheckCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface DashboardProps {
  user: {
    name: string;
    subscription: 'free' | 'premium' | 'professional';
  };
  onNavigate: (page: string) => void;
}

interface Stats {
  resumes_tailored: number;
  average_match_score: number;
  recent_activity: Array<{
    id: string;
    action: string;
    time: string;
    status: 'completed' | 'processing';
  }>;
}

interface HealthStatus {
  status: string;
  ai_provider: string;
  database: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchHealthStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchHealthStatus = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI GPT-4o-mini';
      case 'gemini': return 'Google Gemini';
      case 'ollama': return 'Ollama (Local)';
      case 'mock': return 'Offline Keywords';
      default: return 'Unknown';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'text-ember';
      case 'gemini': return 'text-ember';
      case 'ollama': return 'text-emerald-500';
      case 'mock': return 'text-slate';
      default: return 'text-slate';
    }
  };

  return (
    <div className="py-8 px-6 entry-animation">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-stone flex items-center justify-center border border-linen shadow-sm">
              <Sparkles className="w-6 h-6 text-ember" />
            </div>
            <div className="section-header !mb-0">Overview</div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
            Welcome back, <span className="premium-gradient-text">{user.name}</span>
          </h1>
          <p className="text-slate text-xl font-medium max-w-2xl leading-relaxed">
            {stats && stats.resumes_tailored > 0 
              ? <>You've optimized <span className="text-ink font-bold">{stats.resumes_tailored} resumes</span>. Ready to land your next role?</>
              : <>Your career transformation starts here. Upload your first resume to begin.</>
            }
          </p>
        </div>

        {/* Action Card */}
        <div className="mb-16">
          <button
            onClick={() => onNavigate('resume')}
            className="glass-card glass-card-hover p-12 text-left w-full group relative overflow-hidden"
          >
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-stone rounded-3xl border border-linen group-hover:border-ember/60 group-hover:scale-110 transition-all duration-500">
                  <Plus className="w-10 h-10 text-ember" />
                </div>
                <div>
                  <h3 className="text-3xl font-black mb-2 font-['Outfit'] text-ink">Tailor New Resume</h3>
                  <p className="text-slate text-lg font-medium">Upload, analyze, and generate a professional ATS-optimized resume in seconds.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-slate group-hover:text-ink transition-colors">
                Quick Start <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform text-ember" />
              </div>
            </div>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Stats Column */}
          <div className="lg:col-span-2 space-y-10">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="glass-card glass-card-hover p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <CheckCircle className="w-24 h-24" />
                </div>
                <div className="section-header">Match Quality</div>
                <div className="text-6xl font-black mb-4 text-ink">{stats?.average_match_score || 0}%</div>
                <div className="text-slate font-bold uppercase tracking-wider text-xs mb-8">Average Match Score</div>
                <div className="w-full bg-fog rounded-full h-2 border border-linen overflow-hidden">
                  <div 
                    className="bg-ember h-full shadow-[0_0_8px_rgba(184,124,56,0.4)] transition-all duration-1000 ease-out" 
                    style={{ width: `${stats?.average_match_score || 0}%` }} 
                  />
                </div>
              </div>

              <div className="glass-card glass-card-hover p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <FileText className="w-24 h-24" />
                </div>
                <div className="section-header">Total Output</div>
                <div className="text-6xl font-black mb-4 text-ink">{stats?.resumes_tailored || 0}</div>
                <div className="text-slate font-bold uppercase tracking-wider text-xs">Resumes Tailored</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="section-header !mb-0">Recent Activity</div>
                <Clock className="w-5 h-5 text-slate" />
              </div>
              
              <div className="space-y-4">
                {stats?.recent_activity && stats.recent_activity.length > 0 ? stats.recent_activity.map((a) => (
                  <div key={a.id} className="flex items-center gap-6 p-6 rounded-2xl bg-stone border border-linen hover:bg-linen/20 transition-all group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      a.status === 'completed' ? 'bg-linen/20 text-ember border border-linen' : 'bg-ink/5 text-slate border border-linen'
                    } group-hover:scale-110`}>
                      {a.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-ink">{a.action}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate mt-1">{a.time}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-ember" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-slate rounded-full flex items-center justify-center mx-auto mb-6 border border-linen">
                      <FileText className="w-8 h-8 text-slate/40" />
                    </div>
                    <p className="font-bold text-xl text-slate mb-2">No activity recorded</p>
                    <p className="text-sm text-slate/60">Your tailored resumes will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Column */}
          <div className="space-y-10">
            <div className="glass-card p-10">
              <div className="section-header">Engine Status</div>
              
              {healthLoading ? (
                <div className="flex items-center gap-4 text-slate py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-ember" />
                  <span className="text-sm font-bold uppercase tracking-widest">Checking AI Engine...</span>
                </div>
              ) : health ? (
                <div className="space-y-8 mt-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-linen/20 border border-ember/30">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-ember" />
                      <span className="text-sm font-bold text-ink">Backend API</span>
                    </div>
                    <span className="text-[10px] font-black text-ember uppercase tracking-widest">Online</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="font-bold text-slate uppercase tracking-widest">AI Provider</span>
                      <span className={`font-black uppercase tracking-widest ${getProviderColor(health.ai_provider)}`}>
                        {getProviderLabel(health.ai_provider)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="font-bold text-slate uppercase tracking-widest">Database</span>
                      <span className="font-black uppercase tracking-widest text-ember">
                        {health.database === 'connected' ? 'Healthy' : 'Sync Error'}
                      </span>
                    </div>
                  </div>

                  {health.ai_provider === 'mock' && (
                    <div className="p-6 rounded-2xl bg-linen/20 border border-ember/20">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-ember shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-slate leading-relaxed">
                          Running in limited mode. For full AI capabilities, please start Ollama or set up a Gemini API key.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 mt-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-ink/5 border border-linen">
                    <div className="flex items-center gap-3">
                      <WifiOff className="w-5 h-5 text-slate" />
                      <span className="text-sm font-bold text-ink">Backend API</span>
                    </div>
                    <span className="text-[10px] font-black text-slate uppercase tracking-widest">Offline</span>
                  </div>
                  <p className="text-xs text-slate leading-relaxed px-2">
                    Cannot reach the backend server. Please verify the Python application is running on port 5000.
                  </p>
                  <button 
                    onClick={fetchHealthStatus}
                    className="btn-secondary w-full !py-3 text-sm hover:border-ember/50"
                  >
                    Reconnect
                  </button>
                </div>
              )}
            </div>
            
            {/* Quick Tips */}
            <div className="glass-card p-10 bg-gradient-to-br from-linen/20 to-transparent">
              <div className="section-header">Success Tip</div>
              <h4 className="text-xl font-bold mb-4 text-ink">Focus on Quantifiable Impact</h4>
              <p className="text-sm text-slate leading-relaxed font-medium">
                Resumes with numbers (e.g., "Increased sales by 20%") have a 40% higher chance of passing ATS filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};