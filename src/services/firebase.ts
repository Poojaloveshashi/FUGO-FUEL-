import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (using custom databaseId if configured)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Validate Firestore connection on boot (per skill requirement)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection test: client is offline or network restricted.');
    }
  }
}
testConnection();

export interface FugoUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  createdAt?: string;
  lastLoginAt?: string;
}

/**
 * Creates or updates the user profile document in Firestore (/users/{userId})
 */
export async function syncUserProfile(user: FirebaseUser, extra?: { phoneNumber?: string; displayName?: string }): Promise<FugoUserProfile> {
  const profile: FugoUserProfile = {
    uid: user.uid,
    email: user.email || null,
    displayName: extra?.displayName || user.displayName || user.email?.split('@')[0] || 'Fugo Customer',
    phoneNumber: extra?.phoneNumber || user.phoneNumber || null,
    photoURL: user.photoURL || null,
    lastLoginAt: new Date().toISOString(),
  };

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      profile.createdAt = new Date().toISOString();
      await setDoc(userDocRef, profile, { merge: true });
    } else {
      await setDoc(userDocRef, { ...profile, lastLoginAt: new Date().toISOString() }, { merge: true });
    }
  } catch (e) {
    console.warn('Could not sync profile to Firestore, keeping in-memory profile', e);
  }

  return profile;
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email: string, pass: string) {
  const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const profile = await syncUserProfile(res.user);
  return { user: res.user, profile };
}

/**
 * Sign up with email and password
 */
export async function registerWithEmail(email: string, pass: string, name?: string, phone?: string) {
  const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (name && res.user) {
    try {
      await updateProfile(res.user, { displayName: name });
    } catch (e) {
      console.warn('Could not update profile display name', e);
    }
  }
  const profile = await syncUserProfile(res.user, { displayName: name, phoneNumber: phone });
  return { user: res.user, profile };
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
  const res = await signInWithPopup(auth, googleProvider);
  const profile = await syncUserProfile(res.user);
  return { user: res.user, profile };
}

/**
 * Guest / Anonymous Sign In
 */
export async function loginGuest(preferredPhone?: string) {
  const res = await signInAnonymously(auth);
  const profile = await syncUserProfile(res.user, { phoneNumber: preferredPhone });
  return { user: res.user, profile };
}

/**
 * Send Password Reset Email
 */
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out
 */
export async function logoutFirebase() {
  return signOut(auth);
}

/**
 * Auth state listener
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
