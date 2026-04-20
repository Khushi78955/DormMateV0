import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const ref = (roomId) => collection(db, "rooms", roomId, "expenses");

export const addExpense = (roomId, data) =>
  addDoc(ref(roomId), { ...data, createdAt: serverTimestamp() });
export const deleteExpense = (roomId, id) =>
  deleteDoc(doc(db, "rooms", roomId, "expenses", id));

export const subscribeExpenses = (roomId, cb) => {
  const q = query(ref(roomId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
