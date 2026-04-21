import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
if (missingKeys.length) {
  // Fail fast with a clear message; this usually happens on Vercel Preview
  // when env vars are only configured for Production.
  throw new Error(
    `Missing Firebase env vars: ${missingKeys.join(", ")}. ` +
      `Check Vercel Environment Variables for this deployment environment (Preview/Production) ` +
      `and redeploy.`
  );
}

// Useful when debugging “works locally, fails deployed”.
if (typeof window !== "undefined") {
  console.info("[firebase] mode:", import.meta.env.MODE);
  console.info("[firebase] hostname:", window.location.hostname);
  console.info("[firebase] projectId:", firebaseConfig.projectId);
  console.info("[firebase] authDomain:", firebaseConfig.authDomain);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  cache: persistentLocalCache({ tabManager: persistentSingleTabManager() }),
});
