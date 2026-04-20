import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const ref = (roomId) => collection(db, "rooms", roomId, "chores");

export const addChore = (roomId, data) =>
  addDoc(ref(roomId), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
export const updateChoreStatus = (roomId, id, status) =>
  updateDoc(doc(db, "rooms", roomId, "chores", id), {
    status,
    updatedAt: serverTimestamp(),
  });
export const deleteChore = (roomId, id) =>
  deleteDoc(doc(db, "rooms", roomId, "chores", id));

export const subscribeChores = (roomId, cb) => {
  const q = query(ref(roomId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
