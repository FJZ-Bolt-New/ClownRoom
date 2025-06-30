import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { RoomsView } from './components/Views/RoomsView';
import { RoastsView } from './components/Views/RoastsView';
import { StickersView } from './components/Views/StickersView';
import { ChallengesView } from './components/Views/ChallengesView';
import { MemoriesView } from './components/Views/MemoriesView';
import { ProfileView } from './components/Views/ProfileView';
import { ChatView } from './components/Views/ChatView';
import { SignInView } from './components/Auth/SignInView';
import { useStore, useHasHydrated, useVisibilityHandler } from './store/useStore';

function App() {
  const { activeView, currentRoom, currentUser } = useStore();
  const hasHydrated = useHasHydrated();
  
  // Handle browser visibility changes to maintain state
  useVisibilityHandler();

  // Show loading screen until store is hydrated
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 9999,
          }}
        >
          <img
            src="/white_circle_360x360.png"
            alt="Built with Bolt.new"
            style={{ height: '48px' }}
          />
        </a>

        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-doodle">🎪</div>
          <h1 className="text-2xl font-bold font-sketch mb-2">ClownRoom</h1>
          <p className="text-gray-400 font-hand">Loading your chaos...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show sign in view if no current user
  if (!currentUser) {
    return (
      <>
        <SignInView />
        
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#16213e',
              color: '#fff',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#4ECDC4',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF6B9D',
                secondary: '#fff',
              },
            },
          }}
        />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'rooms':
        return <RoomsView />;
      case 'roasts':
        return <RoastsView />;
      case 'chat':
        return <ChatView />;
      case 'stickers':
        return <StickersView />;
      case 'challenges':
        return <ChallengesView />;
      case 'memories':
        return <MemoriesView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <RoomsView />;
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Header />
      <main className="flex-1">
        {renderActiveView()}
      </main>
      <Navigation />
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#16213e',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#4ECDC4',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF6B9D',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
