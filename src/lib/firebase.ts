import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAj45okA16HL8XDdlBfaw-Jdis-WEe3KJo",
  authDomain: "sfvbedwa.firebaseapp.com",
  projectId: "sfvbedwa",
  storageBucket: "sfvbedwa.firebasestorage.app",
  messagingSenderId: "556384153571",
  appId: "1:556384153571:web:a9853c1cf4dbf4505c3ad6",
  measurementId: "G-4VYC9SQC1S",
  databaseURL: "https://sfvbedwa-default-rtdb.firebaseio.com"
};

// Initialize Firebase only once
let app;
let db;
let auth;
let rtdb;
let storage;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    // Initialize Firestore with persistence
    db = initializeFirestore(app, {
      cache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });

    auth = getAuth(app);
    rtdb = getDatabase(app);
    storage = getStorage(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    rtdb = getDatabase(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Helper function to handle Firebase errors
export const handleFirebaseError = (error: any): string => {
  console.error('Firebase error:', error);

  if (error?.code === 'failed-precondition' && error.message.includes('index')) {
    return 'Database is being updated. Please try again in a few minutes.';
  }

  // Common Firebase error codes
  const errorMessages: Record<string, string> = {
    'permission-denied': 'You do not have permission to perform this action.',
    'unauthenticated': 'Please sign in to continue.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'failed-precondition': 'Operation failed. Please try again.',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'cancelled': 'Operation was cancelled.',
    'data-loss': 'Unable to retrieve data. Please try again.',
    'unknown': 'An unknown error occurred.',
    'invalid-argument': 'Invalid data provided.',
    'deadline-exceeded': 'Request timed out.',
    'unavailable': 'Service is currently unavailable.',
  };

  if (error?.code) {
    const errorCode = error.code.replace('auth/', '').replace('firestore/', '');
    return errorMessages[errorCode] || error.message || 'An unexpected error occurred';
  }

  return error?.message || 'An unexpected error occurred';
};

export { app, auth, db, rtdb, storage };