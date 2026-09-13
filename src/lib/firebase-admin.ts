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
    throw new ConfigError(
      "FIREBASE_SERVICE_ACCOUNT não está configurada no ambiente do servidor. " +
        "Sem ela o servidor não consegue gravar pedidos nem assinar links de download.",
    );
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new ConfigError(
      "FIREBASE_SERVICE_ACCOUNT está configurada mas não é um JSON válido — " +
        "cole o JSON da service account minificado em uma linha só.",
    );
  }
}

/**
 * Missing/invalid server configuration, as opposed to a bug or a user error.
 * Server functions surface its message to the buyer instead of blowing up into a
 * generic 500 HTML page, which is what a throw during module evaluation used to do.
 */
export class ConfigError extends Error {
  override readonly name = "ConfigError";
}

// Lazy on purpose: initializing at module scope meant a missing env var threw while the
// module was being evaluated, so every server function that imported it answered with the
// 500 error-page HTML instead of a message anyone could act on.
let adminApp: App | undefined;

function getAdminApp(): App {
  if (!adminApp) {
    adminApp = getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });
  }
  return adminApp;
}

export const getAdminAuth = (): Auth => getAuth(getAdminApp());
export const getAdminDb = (): Firestore => getFirestore(getAdminApp());
export const getAdminStorage = (): Storage => getStorage(getAdminApp());

/** Bucket that holds the private deliverables (V-203). */
export function getDeliverablesBucket() {
  const name =
    process.env["FIREBASE_STORAGE_BUCKET"] ?? process.env["VITE_FIREBASE_STORAGE_BUCKET"];
  if (!name) {
    throw new ConfigError(
      "FIREBASE_STORAGE_BUCKET (ou VITE_FIREBASE_STORAGE_BUCKET) não está configurada — " +
        "sem o nome do bucket não é possível assinar links de download.",
    );
  }
  return getAdminStorage().bucket(name);
}
