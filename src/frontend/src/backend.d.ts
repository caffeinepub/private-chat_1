import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    id: bigint;
    content: string;
    isRead: boolean;
    sender: Principal;
    timestamp: bigint;
    receiver: Principal;
}
export interface UserProfile {
    displayName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatList(): Promise<Array<{
        participants: [Principal, Principal];
        lastActivity: bigint;
    }>>;
    getMessages(withUser: Principal): Promise<Array<ChatMessage>>;
    getUnreadMessageCount(withUser: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessagesAsRead(withUser: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, content: string): Promise<void>;
    setUserProfile(profile: UserProfile): Promise<void>;
}
