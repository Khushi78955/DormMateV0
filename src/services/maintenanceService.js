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

const ref = (roomId) => collection(db, "rooms", roomId, "maintenance");

export const addMaintenanceRequest = (roomId, data) =>
  addDoc(ref(roomId), { ...data, status: "PENDING", createdAt: serverTimestamp() });
export const updateMaintenanceStatus = (roomId, id, status) =>
  updateDoc(doc(db, "rooms", roomId, "maintenance", id), { status });
export const deleteMaintenanceRequest = (roomId, id) =>
  deleteDoc(doc(db, "rooms", roomId, "maintenance", id));

export const subscribeMaintenance = (roomId, cb) => {
  const q = query(ref(roomId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
