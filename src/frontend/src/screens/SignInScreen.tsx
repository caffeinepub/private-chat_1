import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function SignInScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <img 
            src="/assets/generated/private-chat-logo.dim_1024x256.png" 
            alt="Private Chat" 
            className="mx-auto h-16 w-auto"
          />
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Private Chat</h1>
          <p className="text-lg text-muted-foreground">
            Secure, private messaging for the modern web
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-medium">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h2 className="mb-2 text-xl font-semibold">Sign in to continue</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Connect securely using Internet Identity
          </p>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full"
          >
            {isLoggingIn ? 'Connecting...' : 'Sign In'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>
    </div>
  );
}
