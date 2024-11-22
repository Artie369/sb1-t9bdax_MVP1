import { create } from 'zustand';
import { db, rtdb } from '../lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  onValue,
  set,
  push,
  serverTimestamp as rtdbTimestamp
} from 'firebase/database';
import type { ChatMessage, ChatRoom, ChatParticipant } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  rooms: ChatRoom[];
  participants: Record<string, ChatParticipant>;
  activeRoom: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  sendMessage: (roomId: string, content: string, contentType: ChatMessage['contentType'], metadata?: ChatMessage['metadata']) => Promise<void>;
  markAsRead: (roomId: string, messageIds: string[]) => Promise<void>;
  setTypingStatus: (roomId: string, isTyping: boolean) => void;
  loadRoom: (roomId: string) => Promise<void>;
  createRoom: (participantIds: string[]) => Promise<string>;
}

export const useChatStore = create<ChatState>((set, get) => {
  // Helper to manage real-time presence
  const setupPresence = (userId: string) => {
    const userStatusRef = ref(rtdb, `status/${userId}`);
    const connectedRef = ref(rtdb, '.info/connected');

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        const presence = {
          status: 'online',
          lastSeen: rtdbTimestamp(),
        };

        set(userStatusRef, presence);
        
        // When user disconnects, update the last seen
        onDisconnect(userStatusRef).update({
          status: 'offline',
          lastSeen: rtdbTimestamp(),
        });
      }
    });
  };

  return {
    messages: {},
    rooms: [],
    participants: {},
    activeRoom: null,
    loading: false,
    error: null,
    initialized: false,

    sendMessage: async (roomId, content, contentType, metadata) => {
      try {
        const { activeRoom } = get();
        if (!activeRoom) return;

        const messageId = uuidv4();
        const message: ChatMessage = {
          id: messageId,
          matchId: roomId,
          senderId: auth.currentUser!.uid,
          content,
          contentType,
          metadata,
          status: 'sending',
          createdAt: new Date(),
        };

        // Optimistically update UI
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: [...(state.messages[roomId] || []), message]
          }
        }));

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'messages'), {
          ...message,
          createdAt: serverTimestamp()
        });

        // Update message status
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: state.messages[roomId].map(msg =>
              msg.id === messageId ? { ...msg, status: 'sent' } : msg
            )
          }
        }));

        // Update room's last message
        await updateDoc(doc(db, 'rooms', roomId), {
          lastMessage: {
            content,
            contentType,
            senderId: auth.currentUser!.uid,
            createdAt: serverTimestamp()
          },
          updatedAt: serverTimestamp()
        });

      } catch (error) {
        console.error('Error sending message:', error);
        // Update failed message status
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: state.messages[roomId].map(msg =>
              msg.id === messageId ? { ...msg, status: 'failed' } : msg
            )
          }
        }));
      }
    },

    markAsRead: async (roomId, messageIds) => {
      try {
        const batch = writeBatch(db);
        messageIds.forEach(messageId => {
          const messageRef = doc(db, 'messages', messageId);
          batch.update(messageRef, {
            status: 'read',
            readAt: serverTimestamp()
          });
        });
        await batch.commit();

        // Update local state
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: state.messages[roomId].map(msg =>
              messageIds.includes(msg.id)
                ? { ...msg, status: 'read', readAt: new Date() }
                : msg
            )
          }
        }));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },

    setTypingStatus: (roomId, isTyping) => {
      if (!auth.currentUser) return;
      
      const typingRef = ref(rtdb, `rooms/${roomId}/typing/${auth.currentUser.uid}`);
      set(typingRef, isTyping);

      // Clear typing indicator after 5 seconds of inactivity
      if (isTyping) {
        setTimeout(() => {
          set(typingRef, false);
        }, 5000);
      }
    },

    loadRoom: async (roomId) => {
      try {
        set({ loading: true, error: null });

        // Subscribe to room messages
        const messagesQuery = query(
          collection(db, 'messages'),
          where('roomId', '==', roomId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ChatMessage[];

          set(state => ({
            messages: {
              ...state.messages,
              [roomId]: messages.reverse()
            }
          }));
        });

        // Subscribe to typing indicators
        const typingRef = ref(rtdb, `rooms/${roomId}/typing`);
        onValue(typingRef, (snapshot) => {
          const typing = snapshot.val() || {};
          set(state => ({
            rooms: state.rooms.map(room =>
              room.id === roomId ? { ...room, typing } : room
            )
          }));
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading room:', error);
        set({ error: (error as Error).message, loading: false });
      }
    },

    createRoom: async (participantIds) => {
      try {
        set({ loading: true, error: null });
        
        const room: Omit<ChatRoom, 'id'> = {
          participants: participantIds,
          unreadCount: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
          typing: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'rooms'), {
          ...room,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        return docRef.id;
      } catch (error) {
        console.error('Error creating room:', error);
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    }
  };
});