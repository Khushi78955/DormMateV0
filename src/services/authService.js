import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const FIRESTORE_WRITE_TIMEOUT_MS = 8000;
const FIRESTORE_READ_TIMEOUT_MS = 5000;
const PROFILE_CACHE_KEY = "dormmatee-user-profile";
const PROFILE_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

const withReadTimeout = (promise, label) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out (${FIRESTORE_READ_TIMEOUT_MS}ms)`)),
        FIRESTORE_READ_TIMEOUT_MS
      )
    ),
  ]);
};

const safeParseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getCachedUserProfile = (uid) => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
  if (!raw) return null;
  const cached = safeParseJSON(raw);
  if (!cached?.profile || cached.profile.uid !== uid) return null;
  if (Date.now() - (cached.cachedAt || 0) > PROFILE_CACHE_TTL_MS) return null;
  return cached.profile;
};

export const cacheUserProfile = (profile) => {
  if (typeof window === "undefined" || !profile) return;
  window.localStorage.setItem(
    PROFILE_CACHE_KEY,
    JSON.stringify({ profile, cachedAt: Date.now() })
  );
};

export const clearCachedUserProfile = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_CACHE_KEY);
};

async function settleFirestoreWrite(promise, label) {
  let timeoutId;
  try {
    const didComplete = await Promise.race([
      promise.then(() => true),
      new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(false), FIRESTORE_WRITE_TIMEOUT_MS);
      }),
    ]);
    if (!didComplete) {
      console.warn(
        `${label} is taking longer than ${FIRESTORE_WRITE_TIMEOUT_MS}ms (network offline/slow?). Continuing optimistically.`
      );
    }
    return didComplete;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const registerUser = async (email, password, displayName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    displayName,
    email,
    roomId: null,
    createdAt: serverTimestamp(),
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
  });
  return user;
};

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);

export const getUserProfile = async (uid) => {
  const ref = doc(db, "users", uid);

  try {
    const cached = await withReadTimeout(getDocFromCache(ref), "Cache lookup");
    if (cached.exists()) return cached.data();
  } catch {
    // Cache miss is fine
  }

  try {
    const snap = await withReadTimeout(getDocFromServer(ref), "Server fetch");
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    if (err?.code === "unavailable") return null;
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
};

export const updateUserRoom = async (uid, roomId) => {
  const writePromise = setDoc(doc(db, "users", uid), { roomId }, { merge: true });
  writePromise.catch((err) => console.error("updateUserRoom failed:", err));
  await settleFirestoreWrite(writePromise, "updateUserRoom write");
};
