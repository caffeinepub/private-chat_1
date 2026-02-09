# Specification

## Summary
**Goal:** Build “Private Chat”, a WhatsApp-like (but visually distinct) 1:1 private chat web app with Internet Identity authentication, polling-based messaging, and premium-themed UI/branding in English.

**Planned changes:**
- Create the “Private Chat” app shell/branding and ensure all UI copy is English.
- Add Internet Identity sign-in and gate all chat functionality behind authentication; use the user Principal for all chat actions.
- Backend (single Motoko actor): implement 1:1 threads and messages with strict access control so only participants can read/send; return explicit errors for unauthorized access.
- Backend APIs: list threads sorted by last activity; fetch message history with pagination and stable timestamp-based ordering.
- Frontend premium, WhatsApp-different design system applied across Login, Chat List, Chat Thread, and Settings/Profile; responsive for mobile and desktop.
- Chat List screen: show existing threads with last message preview, last activity time, unread indicator (if available), navigation into threads, and an empty state.
- Chat Thread screen: message bubbles with timestamps, composer with optimistic sending, and polling to refresh messages.
- Settings/Profile: allow setting/updating display name; show display names in chat list and thread header (fallback to shortened principal).
- Safety/quality: enforce message size limits, prevent empty sends, sanitize user text for display, and show graceful error states/toasts on failures.
- Add generated static image assets for branding and empty states under `frontend/public/assets/generated` and render them in the UI.

**User-visible outcome:** Users can sign in with Internet Identity, set a display name, view/create 1:1 chats, send and read messages in a polished, distinct-themed interface that updates via polling (no real-time sockets), with clear error handling and branded static visuals.
