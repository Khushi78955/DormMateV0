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

  // Prefer cached data when offline/unavailable.
  try {
    const cached = await getDocFromCache(ref);
    if (cached.exists()) return cached.data();
  } catch {
    // Cache miss is fine.
  }

  try {
    const snap = await getDocFromServer(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    // When offline, avoid throwing here; caller can treat missing profile as null.
    if (err?.code === "unavailable") return null;

    // Fallback to default behavior (may use cache depending on SDK state).
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
};

export const updateUserRoom = async (uid, roomId) => {
  const writePromise = setDoc(doc(db, "users", uid), { roomId }, { merge: true });
  writePromise.catch((err) => console.error("updateUserRoom failed:", err));
  await settleFirestoreWrite(writePromise, "updateUserRoom write");
};
