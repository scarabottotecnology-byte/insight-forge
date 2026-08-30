import { type App, cert, getApps, initializeApp } from "firebase-admin/app";
import { type Auth, getAuth } from "firebase-admin/auth";
import { type Firestore, getFirestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

// Server-only: never import this from client components. Relies on
// FIREBASE_SERVICE_ACCOUNT (the service account JSON, minified to one line)
// which must stay out of any VITE_-prefixed env var so it never reaches the client bundle.
function loadServiceAccount() {
  const raw = process.env["FIREBASE_SERVICE_ACCOUNT"];
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set");
  }
  return JSON.parse(raw);
}

const adminApp: App = getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
export const adminStorage: Storage = getStorage(adminApp);
