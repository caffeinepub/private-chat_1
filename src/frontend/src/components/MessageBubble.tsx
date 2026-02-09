import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { ChatMessage } from '../backend';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { identity } = useInternetIdentity();
  const currentUserId = identity?.getPrincipal().toString();
  const isOwnMessage = message.sender.toString() === currentUserId;

  const timestamp = new Date(Number(message.timestamp) / 1000000);
  const timeString = format(timestamp, 'HH:mm');

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-soft ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card text-card-foreground rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>
        <div className={`mt-1 flex items-center justify-end gap-1 text-xs ${
          isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          <span>{timeString}</span>
        </div>
      </div>
    </div>
  );
}
