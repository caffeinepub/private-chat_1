import { useEffect, useRef } from 'react';
import { useGetMessages, useMarkMessagesAsRead } from '../hooks/useQueries';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageBubble from '../components/MessageBubble';
import MessageComposer from '../components/MessageComposer';
import ChatThreadHeader from '../components/ChatThreadHeader';
import type { AppRoute } from '../App';

interface ChatThreadScreenProps {
  threadUserId: string;
  onNavigate: (route: AppRoute) => void;
}

export default function ChatThreadScreen({ threadUserId, onNavigate }: ChatThreadScreenProps) {
  const { data: messages, isLoading } = useGetMessages(threadUserId);
  const { mutate: markAsRead } = useMarkMessagesAsRead();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsRead = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when entering thread
  useEffect(() => {
    if (!hasMarkedAsRead.current && messages && messages.length > 0) {
      markAsRead(threadUserId);
      hasMarkedAsRead.current = true;
    }
  }, [messages, threadUserId, markAsRead]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col">
      <div className="border-b border-border bg-card px-4 py-3 shadow-soft sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate({ screen: 'chat-list' })}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <ChatThreadHeader userId={threadUserId} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-accent/5 px-4 py-6 sm:px-6">
        <div className="space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble key={message.id.toString()} message={message} />
            ))
          ) : (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-center text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-4 sm:px-6">
        <MessageComposer receiverId={threadUserId} />
      </div>
    </div>
  );
}
