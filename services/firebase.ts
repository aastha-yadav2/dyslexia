// services/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile,
  User,
  UserCredential
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

/**
 * Replace with your project's values from Firebase Console.
 * For local development you can keep these inline, but for production
 * prefer environment variables (NEXT_PUBLIC_...).
 */
const firebaseConfig = {
  apiKey: "AIzaSyBs5Kj5ErifBtF16X5NiWbHRMPp6R8sGmw",
  authDomain: "includify-d95af.firebaseapp.com",
  projectId: "includify-d95af",
  // IMPORTANT: use the typical .appspot.com storageBucket format
  storageBucket: "includify-d95af.appspot.com",
  messagingSenderId: "152175373115",
  appId: "1:152175373115:web:d461baba8f3a1e38fca51e",
  measurementId: "G-E41HE2C7V1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* -------------------------
   Email signup / signin
   ------------------------- */
export async function signupWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  if (displayName) {
    try {
      await updateProfile(user, { displayName });
    } catch (e) {
      console.warn("updateProfile failed", e);
    }
  }

  // Save user info to Firestore (optional but useful)
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName ?? user.displayName ?? null,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn("Failed to write user doc:", e);
  }

  return user;
}

export async function signinWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/* -------------------------
   Google popup / redirect
   ------------------------- */

/**
 * Popup-based Google sign-in. Returns the signed-in User.
 * Caller should handle errors (popup-blocked, popup-closed-by-user, etc.).
 */
export async function signinWithGooglePopup(): Promise<User> {
  const cred: UserCredential = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  // save/update to Firestore
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? null,
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn("Failed to save Google popup user doc:", e);
  }

  return user;
}

/**
 * Start Google redirect flow. This navigates away to Google.
 * After Google returns to your app, call getGoogleRedirectResult() (or rely on onAuthStateChanged).
 */
export async function signinWithGoogleRedirect(): Promise<void> {
  return signInWithRedirect(auth, googleProvider);
}

/**
 * Call on app load to process a redirect result (if any).
 * Returns the User or null.
 */
export async function getGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    const user = result.user;

    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? null,
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Failed to save redirect user doc:", e);
    }

    return user;
  } catch (e) {
    console.warn("getGoogleRedirectResult error:", e);
    return null;
  }
}

/* -------------------------
   Sign out + exports
   ------------------------- */
export function signOutUser(): Promise<void> {
  return signOut(auth);
}

// export auth objects used elsewhere
export { auth, db, fbOnAuthStateChanged as onAuthStateChanged };
