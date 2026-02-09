import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import SignInScreen from './screens/SignInScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatThreadScreen from './screens/ChatThreadScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import AppHeader from './components/AppHeader';
import { Toaster } from '@/components/ui/sonner';

type Screen = 'chat-list' | 'chat-thread' | 'profile';

export interface AppRoute {
  screen: Screen;
  threadUserId?: string;
}

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const [currentRoute, setCurrentRoute] = useState<AppRoute>({ screen: 'chat-list' });

  // Show profile setup dialog when authenticated but no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Reset to chat list when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentRoute({ screen: 'chat-list' });
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SignInScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen flex-col bg-background">
        <AppHeader currentRoute={currentRoute} onNavigate={setCurrentRoute} />
        
        <main className="flex-1 overflow-hidden">
          {currentRoute.screen === 'chat-list' && (
            <ChatListScreen onNavigate={setCurrentRoute} />
          )}
          {currentRoute.screen === 'chat-thread' && currentRoute.threadUserId && (
            <ChatThreadScreen 
              threadUserId={currentRoute.threadUserId} 
              onNavigate={setCurrentRoute}
            />
          )}
          {currentRoute.screen === 'profile' && (
            <ProfileScreen onNavigate={setCurrentRoute} />
          )}
        </main>

        {showProfileSetup && <ProfileSetupDialog />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
