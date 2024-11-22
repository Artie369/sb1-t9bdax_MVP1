import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '../types';
import { toast } from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
}

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const useAuthStore = create<AuthState>((set) => {
  // Set up auth state listener
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    try {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          set({ 
            user: { 
              ...userData, 
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            } as User,
            loading: false,
            initialized: true,
            error: null
          });
        } else {
          set({ user: null, loading: false, initialized: true, error: null });
        }
      } else {
        set({ user: null, loading: false, initialized: true, error: null });
      }
    } catch (error) {
      console.error('Auth state error:', error);
      set({ 
        user: null,
        error: (error as Error).message, 
        loading: false, 
        initialized: true 
      });
    }
  });

  return {
    user: null,
    loading: true,
    error: null,
    initialized: false,

    signIn: async (email: string, password: string) => {
      try {
        set({ loading: true, error: null });
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } catch (error) {
        console.error('Sign in error:', error);
        const errorMessage = (error as Error).message;
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    signUp: async (email: string, password: string, userData: Partial<User>) => {
      try {
        set({ loading: true, error: null });
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        const newUser = {
          email,
          username: userData.username || '',
          age: userData.age || 0,
          genderIdentity: userData.genderIdentity || '',
          sexualOrientation: userData.sexualOrientation || '',
          bio: userData.bio || '',
          interests: userData.interests || [],
          preferredAgeRange: userData.preferredAgeRange || { min: 18, max: 50 },
          preferredDistance: userData.preferredDistance || 50,
          membershipTier: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        set({ loading: false, error: null });
        toast.success('Welcome to our community!');
      } catch (error) {
        console.error('Sign up error:', error);
        const errorMessage = (error as Error).message;
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    signOut: async () => {
      try {
        set({ loading: true, error: null });
        await firebaseSignOut(auth);
        set({ user: null, loading: false, error: null });
        toast.success('Signed out successfully');
      } catch (error) {
        console.error('Sign out error:', error);
        const errorMessage = (error as Error).message;
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    updateProfile: async (userId: string, data: Partial<User>) => {
      try {
        set({ loading: true, error: null });
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          ...data,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        set(state => ({
          user: state.user ? { ...state.user, ...data } : null,
          loading: false,
          error: null
        }));
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Profile update error:', error);
        const errorMessage = (error as Error).message;
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    clearError: () => set({ error: null }),
  };
});