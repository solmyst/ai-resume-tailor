import React, { useState } from 'react';
import { FileText, BarChart3, LogOut, User, Sparkles, Settings } from 'lucide-react';
import { ApiKeySettings } from './ApiKeySettings';

interface NavigationProps {
  user: {
    id: string;
    name: string;
    email: string;
    subscription: 'free' | 'premium' | 'professional';
    avatar?: string;
  };
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ user, currentPage, onNavigate, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'resume', label: 'Resume Tailor', icon: FileText },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/95 border-b border-white/5 mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-['Outfit'] tracking-tighter">
                Resume<span className="text-blue-500">Tailor</span>AI
              </span>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Settings / API Key Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/5 rounded-xl transition-all active:scale-90"
                title="AI Settings & API Key"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 group px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors cursor-default">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-black text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{user.subscription}</p>
                </div>
              </div>
              
              {/* 
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all active:scale-90"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              */}
            </div>
          </div>
        </div>
      </nav>

      {/* API Key Settings Modal */}
      <ApiKeySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};