import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const ref = (roomId) => collection(db, "rooms", roomId, "foodPolls");

export const createFoodPoll = (roomId, data) =>
  addDoc(ref(roomId), {
    ...data,
    status: "active",
    createdAt: serverTimestamp(),
  });

/**
 * Toggle a user's vote.
 * - If clicking the same option they already voted for -> removes their vote.
 * - If switching to a different option -> removes old vote and adds new vote.
 */
export const voteOnPoll = async (roomId, pollId, optionId, uid, currentOptionId) => {
  const pollRef = doc(db, "rooms", roomId, "foodPolls", pollId);
  const updates = {};

  if (currentOptionId && currentOptionId !== optionId) {
    updates[`votes.${currentOptionId}`] = arrayRemove(uid);
    updates[`votes.${optionId}`] = arrayUnion(uid);
  } else if (currentOptionId === optionId) {
    updates[`votes.${optionId}`] = arrayRemove(uid);
  } else {
    updates[`votes.${optionId}`] = arrayUnion(uid);
  }

  await updateDoc(pollRef, updates);
};

export const closePoll = (roomId, pollId, winner) =>
  updateDoc(doc(db, "rooms", roomId, "foodPolls", pollId), {
    status: "closed",
    winner,
  });

export const subscribeFoodPolls = (roomId, cb) => {
  const q = query(ref(roomId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
