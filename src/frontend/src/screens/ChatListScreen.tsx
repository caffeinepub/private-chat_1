import { useGetChatList } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import ChatThreadItem from '../components/ChatThreadItem';
import type { AppRoute } from '../App';

interface ChatListScreenProps {
  onNavigate: (route: AppRoute) => void;
}

export default function ChatListScreen({ onNavigate }: ChatListScreenProps) {
  const { data: chatList, isLoading } = useGetChatList();
  const { identity } = useInternetIdentity();
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');
  const [error, setError] = useState('');

  const currentUserId = identity?.getPrincipal().toString();

  const handleStartNewChat = () => {
    setError('');
    try {
      Principal.fromText(newChatUserId);
      if (newChatUserId === currentUserId) {
        setError('Cannot start a chat with yourself');
        return;
      }
      setNewChatDialogOpen(false);
      onNavigate({ screen: 'chat-thread', threadUserId: newChatUserId });
      setNewChatUserId('');
    } catch {
      setError('Invalid Principal ID');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  const hasChats = chatList && chatList.length > 0;

  return (
    <div className="mx-auto h-full max-w-4xl">
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Messages</h2>
            <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <MessageSquarePlus className="h-4 w-4" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User Principal ID</Label>
                    <Input
                      id="userId"
                      value={newChatUserId}
                      onChange={(e) => {
                        setNewChatUserId(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter principal ID"
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>
                  <Button onClick={handleStartNewChat} className="w-full" disabled={!newChatUserId.trim()}>
                    Start Chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!hasChats ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-12">
              <img 
                src="/assets/generated/private-chat-empty-state.dim_1200x800.png" 
                alt="No chats yet" 
                className="mb-6 h-48 w-auto opacity-60"
              />
              <h3 className="mb-2 text-xl font-semibold">No conversations yet</h3>
              <p className="mb-6 text-center text-muted-foreground">
                Start a new chat to begin messaging
              </p>
              <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <MessageSquarePlus className="h-4 w-4" />
                    Start Your First Chat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId-empty">User Principal ID</Label>
                      <Input
                        id="userId-empty"
                        value={newChatUserId}
                        onChange={(e) => {
                          setNewChatUserId(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter principal ID"
                      />
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <Button onClick={handleStartNewChat} className="w-full" disabled={!newChatUserId.trim()}>
                      Start Chat
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chatList.map((chat) => {
                const otherUserId = chat.participants[0].toString() === currentUserId
                  ? chat.participants[1].toString()
                  : chat.participants[0].toString();
                
                return (
                  <ChatThreadItem
                    key={otherUserId}
                    userId={otherUserId}
                    lastActivity={chat.lastActivity}
                    onClick={() => onNavigate({ screen: 'chat-thread', threadUserId: otherUserId })}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
