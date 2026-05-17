import { useState } from 'react';
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

  // Auto-login for local dev or Quick Start
  const handleQuickStart = () => {
    const mockUser: User = {
      id: 'local-user',
      name: 'User',
      email: '',
      subscription: 'professional'
    };
    setUser(mockUser);
    setCurrentPage('resume'); // Go straight to the tailor
  };

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
      return (
        <LandingPage 
          onSignUp={() => setShowAuth(true)} 
          onSignIn={() => setShowAuth(true)} 
          onQuickStart={handleQuickStart}
        />
      );
    }

    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            onSignUp={() => setShowAuth(true)} 
            onSignIn={() => setShowAuth(true)} 
            onQuickStart={handleQuickStart}
          />
        );
      case 'dashboard':
        return <Dashboard user={user!} onNavigate={(page) => setCurrentPage(page as Page)} />;
      case 'resume':
        return <ResumeTailor user={user!} onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard user={user!} onNavigate={(page) => setCurrentPage(page as Page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-fog text-ink">
      {user && (
        <Navigation 
          user={user} 
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page as Page)}
          onLogout={handleLogout}
        />
      )}
      
      <main className={user ? 'pt-24 pb-8' : ''}>
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