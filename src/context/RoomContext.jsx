import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const { profile } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!profile?.roomId) {
      setRoom(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "rooms", profile.roomId),
      (snap) => {
        setRoom(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to subscribe to room:", err);
        setRoom(null);
        setLoading(false);
      }
    );

    return unsub;
  }, [profile?.roomId]);

  return (
    <RoomContext.Provider value={{ room, loading }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
};
