import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firebase";

const FIRESTORE_WRITE_TIMEOUT_MS = 8000;
const FIRESTORE_READ_TIMEOUT_MS = 5000;

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

export const createRoom = async (creatorUid, creatorName, roomName) => {
  const roomId = uuidv4().slice(0, 8).toUpperCase();
  const joinCode = uuidv4().slice(0, 6).toUpperCase();

  const roomRef = doc(db, "rooms", roomId);
  const joinCodeRef = doc(db, "joinCodes", joinCode);

  const roomWrite = setDoc(roomRef, {
    roomId,
    joinCode,
    roomName,
    createdBy: creatorUid,
    memberIds: [creatorUid],
    members: [
      {
        uid: creatorUid,
        displayName: creatorName,
        role: "admin",
        joinedAt: Timestamp.now(),
      },
    ],
    mood: "chill",
    createdAt: serverTimestamp(),
    houseRules: ["Keep noise low after 11pm", "Clean shared spaces"],
  });

  const joinCodeWrite = setDoc(joinCodeRef, {
    roomId,
    createdAt: serverTimestamp(),
  });

  const writePromise = Promise.all([roomWrite, joinCodeWrite]);
  writePromise.catch((err) => console.error("createRoom failed:", err));
  const didComplete = await settleFirestoreWrite(writePromise, "createRoom write");

  return { roomId, joinCode, writePending: !didComplete };
};

export const joinRoom = async (joinCode, uid, displayName) => {
  const upperCode = joinCode.toUpperCase();

  // Join is intentionally implemented without querying rooms by joinCode,
  // because most secure rulesets block non-members from listing rooms.
  console.log("[joinRoom] Attempting joinCodes lookup for:", upperCode);
  const codeRef = doc(db, "joinCodes", upperCode);
  const codeSnap = await getDoc(codeRef);
  if (!codeSnap.exists()) {
    throw new Error("Invalid room code. Please check and try again.");
  }

  const { roomId } = codeSnap.data() || {};
  if (!roomId) {
    throw new Error("Invalid room code. Please check and try again.");
  }

  console.log("[joinRoom] joinCode found, room ID:", roomId);
  const roomRef = doc(db, "rooms", roomId);

  // Step 1: self-join by only adding uid to memberIds.
  // This works with strict rules that allow a non-member to add themselves.
  try {
    await updateDoc(roomRef, {
      memberIds: arrayUnion(uid),
    });
  } catch (err) {
    console.warn("[joinRoom] Failed to self-join (memberIds update):", err?.message);
    throw err;
  }

  // Step 2: now that the user is a member, add the richer member record.
  try {
    await updateDoc(roomRef, {
      members: arrayUnion({
        uid,
        displayName,
        role: "member",
        joinedAt: Timestamp.now(),
      }),
    });
  } catch (err) {
    console.warn("[joinRoom] Joined memberIds, but failed to add members entry:", err?.message);
    throw err;
  }

  return roomId;
};

export const getRoomData = async (roomId) => {
  const snap = await getDoc(doc(db, "rooms", roomId));
  if (!snap.exists()) throw new Error("Room not found.");
  return snap.data();
};

export const updateRoomMood = (roomId, mood) =>
  updateDoc(doc(db, "rooms", roomId), { mood });
