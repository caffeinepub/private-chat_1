import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { AppRoute } from '../App';

interface AppHeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export default function AppHeader({ currentRoute, onNavigate }: AppHeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border bg-card shadow-soft">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate({ screen: 'chat-list' })}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <img 
            src="/assets/generated/private-chat-logo.dim_1024x256.png" 
            alt="Private Chat" 
            className="h-8 w-auto"
          />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={() => onNavigate({ screen: 'profile' })}
            className={`rounded-lg p-2 transition-colors ${
              currentRoute.screen === 'profile'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
