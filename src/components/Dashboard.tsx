import React, { useState, useEffect } from 'react';
import { FileText, Plus, Clock, CheckCircle, Loader2, ArrowRight, Sparkles, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    subscription: 'free' | 'premium' | 'professional';
    avatar?: string;
  };
  onNavigate: (page: string) => void;
}

interface UserStats {
  resumes_tailored: number;
  average_match_score: number;
  applications_sent: number;
  recent_activity: Array<{
    id: number;
    action: string;
    time: string;
    status: string;
  }>;
}

interface HealthStatus {
  status: string;
  ai_provider: string;
  database: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
    fetchHealthStatus();
  }, [user.id]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${user.id}/stats`);
      
      if (!response.ok) {
        setStats({
          resumes_tailored: 0,
          average_match_score: 0,
          applications_sent: 0,
          recent_activity: []
        });
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setStats({
          resumes_tailored: 0,
          average_match_score: 0,
          applications_sent: 0,
          recent_activity: []
        });
      }
    } catch (error) {
      setStats({
        resumes_tailored: 0,
        average_match_score: 0,
        applications_sent: 0,
        recent_activity: []
      });
    }
  };

  const fetchHealthStatus = async () => {
    setHealthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      } else {
        setHealth(null);
      }
    } catch (error) {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'gemini': return 'Google Gemini';
      case 'ollama': return 'Ollama (Local)';
      case 'mock': return 'Offline Fallback';
      default: return provider;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gemini': return 'text-blue-400';
      case 'ollama': return 'text-emerald-400';
      case 'mock': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 entry-animation">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <div className="section-header !mb-0">Overview</div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
            Welcome back, <span className="premium-gradient-text">{user.name}</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
            {stats && stats.resumes_tailored > 0 
              ? <>You've optimized <span className="text-white font-bold">{stats.resumes_tailored} resumes</span>. Ready to land your next role?</>
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
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] group-hover:bg-blue-600/10 transition-all duration-700" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 group-hover:bg-blue-600/20 group-hover:scale-110 transition-all duration-500">
                  <Plus className="w-10 h-10 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black mb-2 font-['Outfit']">Tailor New Resume</h3>
                  <p className="text-slate-400 text-lg font-medium">Upload, analyze, and generate a professional ATS-optimized resume in seconds.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">
                Quick Start <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Stats Column */}
          <div className="lg:col-span-2 space-y-10">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="glass-card p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <CheckCircle className="w-24 h-24" />
                </div>
                <div className="section-header">Match Quality</div>
                <div className="text-6xl font-black mb-4">{stats?.average_match_score || 0}%</div>
                <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-8">Average Match Score</div>
                <div className="w-full bg-slate-900/50 rounded-full h-2 border border-white/5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
                    style={{ width: `${stats?.average_match_score || 0}%` }} 
                  />
                </div>
              </div>

              <div className="glass-card p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <FileText className="w-24 h-24" />
                </div>
                <div className="section-header">Total Output</div>
                <div className="text-6xl font-black mb-4">{stats?.resumes_tailored || 0}</div>
                <div className="text-slate-500 font-bold uppercase tracking-wider text-xs">Resumes Tailored</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="section-header !mb-0">Recent Activity</div>
                <Clock className="w-5 h-5 text-slate-700" />
              </div>
              
              <div className="space-y-4">
                {stats?.recent_activity && stats.recent_activity.length > 0 ? stats.recent_activity.map((a) => (
                  <div key={a.id} className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      a.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    } group-hover:scale-110`}>
                      {a.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{a.action}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{a.time}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                      <FileText className="w-8 h-8 text-slate-800" />
                    </div>
                    <p className="font-bold text-xl text-slate-600 mb-2">No activity recorded</p>
                    <p className="text-sm text-slate-700">Your tailored resumes will appear here.</p>
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
                <div className="flex items-center gap-4 text-slate-500 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">Checking AI Engine...</span>
                </div>
              ) : health ? (
                <div className="space-y-8 mt-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-300">Backend API</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="font-bold text-slate-500 uppercase tracking-widest">AI Provider</span>
                      <span className={`font-black uppercase tracking-widest ${getProviderColor(health.ai_provider)}`}>
                        {getProviderLabel(health.ai_provider)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="font-bold text-slate-500 uppercase tracking-widest">Database</span>
                      <span className="font-black uppercase tracking-widest text-emerald-500">
                        {health.database === 'connected' ? 'Healthy' : 'Sync Error'}
                      </span>
                    </div>
                  </div>

                  {health.ai_provider === 'mock' && (
                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-amber-500/80 leading-relaxed">
                          Running in limited mode. For full AI capabilities, please start Ollama or set up a Gemini API key.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 mt-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-3">
                      <WifiOff className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-bold text-slate-300">Backend API</span>
                    </div>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Offline</span>
                  </div>
                  <p className="text-xs text-red-400/70 leading-relaxed px-2">
                    Cannot reach the backend server. Please verify the Python application is running on port 5000.
                  </p>
                  <button 
                    onClick={fetchHealthStatus}
                    className="btn-secondary w-full !py-3 text-sm hover:border-blue-500/50"
                  >
                    Reconnect
                  </button>
                </div>
              )}
            </div>
            
            {/* Quick Tips */}
            <div className="glass-card p-10 bg-gradient-to-br from-indigo-600/10 to-transparent">
              <div className="section-header">Success Tip</div>
              <h4 className="text-xl font-bold mb-4">Focus on Quantifiable Impact</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Resumes with numbers (e.g., "Increased sales by 20%") have a 40% higher chance of passing ATS filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};