import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, ChatMessage } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const principal = Principal.fromText(userId);
        return await actor.getUserProfile(principal);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

// Chat List Query
export function useGetChatList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['chatList'],
    queryFn: async () => {
      if (!actor) return [];
      const list = await actor.getChatList();
      // Sort by last activity (most recent first)
      return list.sort((a, b) => Number(b.lastActivity - a.lastActivity));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// Chat Thread Queries
export function useGetMessages(withUserId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['messages', withUserId],
    queryFn: async () => {
      if (!actor || !withUserId) return [];
      try {
        const principal = Principal.fromText(withUserId);
        return await actor.getMessages(principal);
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!withUserId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(receiver);
      await actor.sendMessage(principal, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver] });
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useGetUnreadMessageCount(withUserId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['unreadCount', withUserId],
    queryFn: async () => {
      if (!actor || !withUserId) return BigInt(0);
      try {
        const principal = Principal.fromText(withUserId);
        return await actor.getUnreadMessageCount(principal);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching && !!withUserId,
    refetchInterval: 5000,
  });
}

export function useMarkMessagesAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (withUserId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(withUserId);
      await actor.markMessagesAsRead(principal);
    },
    onSuccess: (_, withUserId) => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount', withUserId] });
      queryClient.invalidateQueries({ queryKey: ['messages', withUserId] });
    },
  });
}
