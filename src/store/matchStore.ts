import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import type { Match } from '../types';
import { toast } from 'react-hot-toast';

interface MatchState {
  matches: Match[];
  loading: boolean;
  error: string | null;
  fetchMatches: (userId: string) => Promise<void>;
  createMatch: (currentUserId: string, targetUserId: string) => Promise<string>;
  updateMatchStatus: (matchId: string, status: Match['status']) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
}

const handleFirebaseError = (error: any) => {
  console.error('Firebase error:', error);
  if (error?.code === 'permission-denied') {
    return 'You do not have permission to perform this action';
  }
  return error?.message || 'An unexpected error occurred';
};

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,

  fetchMatches: async (userId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to view matches');
      }

      set({ loading: true, error: null });
      const matchesQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(matchesQuery);
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Match[];
      
      set({ matches, loading: false, error: null });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false, matches: [] });
      toast.error(errorMessage);
    }
  },

  createMatch: async (currentUserId: string, targetUserId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to create matches');
      }

      set({ loading: true, error: null });
      
      const match: Omit<Match, 'id'> = {
        users: [currentUserId, targetUserId],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'matches'), {
        ...match,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await get().fetchMatches(currentUserId);
      set({ loading: false, error: null });
      
      return docRef.id;
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateMatchStatus: async (matchId: string, status: Match['status']) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to update match status');
      }

      set({ loading: true, error: null });
      
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }

      const matchData = matchDoc.data();
      if (!matchData.users.includes(auth.currentUser.uid)) {
        throw new Error('You do not have permission to update this match');
      }

      await updateDoc(matchRef, {
        status,
        updatedAt: serverTimestamp()
      });

      const { matches } = get();
      const updatedMatches = matches.map(match => 
        match.id === matchId ? { ...match, status } : match
      );
      
      set({ matches: updatedMatches, loading: false, error: null });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteMatch: async (matchId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in to delete matches');
      }

      set({ loading: true, error: null });
      
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }

      const matchData = matchDoc.data();
      if (!matchData.users.includes(auth.currentUser.uid)) {
        throw new Error('You do not have permission to delete this match');
      }

      await deleteDoc(matchRef);

      const { matches } = get();
      const updatedMatches = matches.filter(match => match.id !== matchId);
      
      set({ matches: updatedMatches, loading: false, error: null });
      
      // Also delete associated messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('matchId', '==', matchId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = db.batch();
      messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  }
}));