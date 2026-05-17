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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone/95 border-b border-linen shadow-[0_2px_12px_rgba(18,18,27,0.015)] mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="bg-gradient-to-tr from-ember to-ember-light p-1.5 rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-['Outfit'] tracking-tighter text-ink">
                Resume<span className="text-ember">Tailor</span>AI
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
                        ? 'bg-ink text-fog border border-ember/30 shadow-sm'
                        : 'text-slate hover:text-ink hover:bg-linen/20 border border-transparent'
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
                className="p-2 text-slate hover:text-ember hover:bg-linen/20 rounded-xl transition-all active:scale-90"
                title="AI Settings & API Key"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 group px-3 py-1.5 rounded-xl border border-linen bg-stone hover:bg-linen/20 transition-colors cursor-default">
                <div className="w-8 h-8 bg-gradient-to-tr from-ember to-ember-light rounded-lg flex items-center justify-center shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-black text-ink leading-tight">{user.name}</p>
                  <p className="text-[10px] text-ember font-black uppercase tracking-widest">{user.subscription}</p>
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
