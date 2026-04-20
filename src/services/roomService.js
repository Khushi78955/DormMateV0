import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firebase";

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

export const createRoom = async (creatorUid, creatorName, roomName) => {
  const roomId = uuidv4().slice(0, 8).toUpperCase();
  const joinCode = uuidv4().slice(0, 6).toUpperCase();

  const writePromise = setDoc(doc(db, "rooms", roomId), {
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

  // Avoid hanging forever in offline/slow networks. Still surface real errors.
  writePromise.catch((err) => console.error("createRoom failed:", err));
  const didComplete = await settleFirestoreWrite(writePromise, "createRoom write");

  return { roomId, joinCode, writePending: !didComplete };
};

export const joinRoom = async (joinCode, uid, displayName) => {
  const q = query(
    collection(db, "rooms"),
    where("joinCode", "==", joinCode.toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty)
    throw new Error("Invalid room code. Please check and try again.");

  const roomDoc = snap.docs[0];
  const roomData = roomDoc.data();
  if (roomData.memberIds.includes(uid))
    throw new Error("You are already in this room.");

  await updateDoc(roomDoc.ref, {
    memberIds: arrayUnion(uid),
    members: arrayUnion({
      uid,
      displayName,
      role: "member",
      joinedAt: Timestamp.now(),
    }),
  });

  return roomData.roomId;
};

export const getRoomData = async (roomId) => {
  const snap = await getDoc(doc(db, "rooms", roomId));
  if (!snap.exists()) throw new Error("Room not found.");
  return snap.data();
};

export const updateRoomMood = (roomId, mood) =>
  updateDoc(doc(db, "rooms", roomId), { mood });
