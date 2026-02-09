import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRoute } from '../App';

interface ProfileScreenProps {
  onNavigate: (route: AppRoute) => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const [displayName, setDisplayName] = useState('');
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      saveProfile({ displayName: displayName.trim() });
    }
  };

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    toast.success('Principal ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-2xl overflow-y-auto px-4 py-8 sm:px-6">
      <div className="space-y-6">
        <div className="text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Display Name</CardTitle>
            <CardDescription>This is how other users will see you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={50}
                />
              </div>
              <Button type="submit" disabled={isPending || !displayName.trim()}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Principal ID</CardTitle>
            <CardDescription>Share this ID with others to receive messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={principalId} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPrincipal}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={() => onNavigate({ screen: 'chat-list' })}>
            Back to Messages
          </Button>
        </div>
      </div>
    </div>
  );
}
