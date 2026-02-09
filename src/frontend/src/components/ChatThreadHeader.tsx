import { useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatThreadHeaderProps {
  userId: string;
}

export default function ChatThreadHeader({ userId }: ChatThreadHeaderProps) {
  const { data: userProfile } = useGetUserProfile(userId);

  const displayName = userProfile?.displayName || shortenPrincipal(userId);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="overflow-hidden">
        <h2 className="truncate font-semibold">{displayName}</h2>
        <p className="truncate text-xs text-muted-foreground">{shortenPrincipal(userId)}</p>
      </div>
    </div>
  );
}

function shortenPrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-6)}`;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
