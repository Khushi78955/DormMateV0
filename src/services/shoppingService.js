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

const ref = (roomId) => collection(db, "rooms", roomId, "shopping");

export const addShoppingItem = (roomId, data) =>
  addDoc(ref(roomId), { ...data, bought: false, createdAt: serverTimestamp() });
export const toggleShoppingItem = (roomId, id, bought) =>
  updateDoc(doc(db, "rooms", roomId, "shopping", id), { bought });
export const deleteShoppingItem = (roomId, id) =>
  deleteDoc(doc(db, "rooms", roomId, "shopping", id));

export const subscribeShoppingList = (roomId, cb) => {
  const q = query(ref(roomId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
