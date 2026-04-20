import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const updateAttendance = (roomId, uid, status) =>
  setDoc(
    doc(db, "rooms", roomId, "attendance", uid),
    { status, updatedAt: new Date() },
    { merge: true }
  );

export const subscribeAttendance = (roomId, cb) =>
  onSnapshot(collection(db, "rooms", roomId, "attendance"), (snap) => {
    const data = {};
    snap.docs.forEach((d) => (data[d.id] = d.data()));
    cb(data);
  });
