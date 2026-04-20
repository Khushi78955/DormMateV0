import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const ref = (roomId) => collection(db, "rooms", roomId, "noiseComplaints");

export const addNoiseComplaint = (roomId, data) =>
  addDoc(ref(roomId), { ...data, resolved: false, createdAt: serverTimestamp() });

export const resolveNoiseComplaint = (roomId, id) =>
  updateDoc(doc(db, "rooms", roomId, "noiseComplaints", id), { resolved: true });

export const subscribeNoiseComplaints = (roomId, cb) => {
  const q = query(ref(roomId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
