import { useGetUserProfile, useGetUnreadMessageCount } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ChatThreadItemProps {
  userId: string;
  lastActivity: bigint;
  onClick: () => void;
}

export default function ChatThreadItem({ userId, lastActivity, onClick }: ChatThreadItemProps) {
  const { data: userProfile } = useGetUserProfile(userId);
  const { data: unreadCount } = useGetUnreadMessageCount(userId);

  const displayName = userProfile?.displayName || shortenPrincipal(userId);
  const hasUnread = unreadCount && unreadCount > 0;
  
  const lastActivityDate = new Date(Number(lastActivity) / 1000000);
  const timeAgo = formatDistanceToNow(lastActivityDate, { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-4 py-4 transition-colors hover:bg-accent/50 sm:px-6"
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 overflow-hidden text-left">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`truncate font-semibold ${hasUnread ? 'text-foreground' : 'text-foreground'}`}>
            {displayName}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">
            {userId.slice(0, 20)}...
          </p>
          {hasUnread && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {Number(unreadCount) > 9 ? '9+' : Number(unreadCount)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
