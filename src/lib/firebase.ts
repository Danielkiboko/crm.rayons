import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId !== ''
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
}

// Helper to create users without logging out the current admin
export const createAdminSecondaryAppAuth = () => {
  const SECONDARY_APP_NAME = 'AdminUserCreationApp';
  let secondaryApp: FirebaseApp;
  
  const apps = getApps();
  const existingSecondary = apps.find(a => a.name === SECONDARY_APP_NAME);
  
  if (existingSecondary) {
    secondaryApp = existingSecondary;
  } else {
    secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  }
  
  return getAuth(secondaryApp);
};

export { app, db, auth };
