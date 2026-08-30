import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";

const env = import.meta.env;
const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"],
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: env["VITE_FIREBASE_APP_ID"],
};

export const firebaseApp: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);
