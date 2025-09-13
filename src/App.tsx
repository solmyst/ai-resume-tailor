import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ResumeTailor } from './components/ResumeTailor';
import { AuthModal } from './components/AuthModal';
import { Navigation } from './components/Navigation';

type User = {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium' | 'professional';
  avatar?: string;
};

type Page = 'landing' | 'dashboard' | 'resume' | 'analytics' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleAuth = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    if (!user && currentPage !== 'landing') {
      return <LandingPage onSignUp={() => setShowAuth(true)} onSignIn={() => setShowAuth(true)} />;
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onSignUp={() => setShowAuth(true)} onSignIn={() => setShowAuth(true)} />;
      case 'dashboard':
        return <Dashboard user={user!} onNavigate={setCurrentPage} />;
      case 'resume':
        return <ResumeTailor user={user!} onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard user={user!} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {user && (
        <Navigation 
          user={user} 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      
      <main className={user ? 'pt-16' : ''}>
        {renderPage()}
      </main>

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onAuth={handleAuth}
        />
      )}
    </div>
  );
}

export default App;