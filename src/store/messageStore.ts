import { create } from 'zustand';
import { db, auth, handleFirebaseError } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  limit,
  getDoc
} from 'firebase/firestore';
import type { Message } from '../types';
import { toast } from 'react-hot-toast';

interface MessageState {
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  subscribeToMessages: (matchId: string) => () => void;
  sendMessage: (matchId: string, senderId: string, content: string, type?: Message['type']) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  loading: false,
  error: null,

  subscribeToMessages: (matchId: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to view messages');
      return () => {};
    }

    set({ loading: true });

    // First verify match exists and user has access
    const matchRef = doc(db, 'matches', matchId);
    
    const unsubscribePromise = getDoc(matchRef).then(matchDoc => {
      if (!matchDoc.exists()) {
        throw new Error('Chat not found');
      }

      const matchData = matchDoc.data();
      if (!matchData?.users?.includes(auth.currentUser?.uid)) {
        throw new Error('You do not have access to this chat');
      }

      // Create a compound query with the required index
      const messagesQuery = query(
        collection(db, 'messages'),
        where('matchId', '==', matchId),
        orderBy('createdAt', 'asc'),
        limit(100)
      );

      return onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Message[];

          set(state => ({
            messages: {
              ...state.messages,
              [matchId]: messages
            },
            loading: false,
            error: null
          }));
        },
        (error) => {
          const errorMessage = handleFirebaseError(error);
          console.error('Error subscribing to messages:', error);
          set({ error: errorMessage, loading: false });
          toast.error('Failed to load messages. Please try again.');
        }
      );
    }).catch(error => {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return () => {};
    });

    // Return cleanup function
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe?.());
    };
  },

  sendMessage: async (matchId: string, senderId: string, content: string, type: Message['type'] = 'text') => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to send messages');
      }

      set({ loading: true, error: null });

      // Verify match exists and user has access
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Chat not found');
      }

      const matchData = matchDoc.data();
      if (!matchData?.users?.includes(auth.currentUser.uid)) {
        throw new Error('You do not have access to this chat');
      }

      const message = {
        matchId,
        senderId,
        content,
        type,
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'messages'), message);
      set({ loading: false, error: null });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to mark messages as read');
      }

      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data();
      if (messageData.senderId === auth.currentUser.uid) {
        return; // Don't mark own messages as read
      }

      await updateDoc(messageRef, { 
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
}));