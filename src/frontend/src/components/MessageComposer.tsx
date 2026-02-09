import { useState, useRef, useEffect } from 'react';
import { useSendMessage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { validateMessage } from '../lib/validation';

interface MessageComposerProps {
  receiverId: string;
}

export default function MessageComposer({ receiverId }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { mutate: sendMessage, isPending } = useSendMessage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateMessage(message);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    sendMessage(
      { receiver: receiverId, content: message.trim() },
      {
        onSuccess: () => {
          setMessage('');
          setError('');
          textareaRef.current?.focus();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
          disabled={isPending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isPending || !message.trim()}
          className="h-11 w-11 shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
