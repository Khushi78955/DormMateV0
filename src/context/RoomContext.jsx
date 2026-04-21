import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const ROOM_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

const safeParseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getCachedRoom = (roomId) => {
  if (typeof window === "undefined" || !roomId) return null;
  const raw = window.localStorage.getItem(`dormmatee-room-${roomId}`);
  if (!raw) return null;
  const cached = safeParseJSON(raw);
  if (!cached?.room || Date.now() - (cached.cachedAt || 0) > ROOM_CACHE_TTL_MS) return null;
  return cached.room;
};

const cacheRoom = (roomId, room) => {
  if (typeof window === "undefined" || !roomId || !room) return;
  window.localStorage.setItem(
    `dormmatee-room-${roomId}`,
    JSON.stringify({ room, cachedAt: Date.now() })
  );
};

const clearCachedRoom = (roomId) => {
  if (typeof window === "undefined" || !roomId) return;
  window.localStorage.removeItem(`dormmatee-room-${roomId}`);
};

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

    const cachedRoom = getCachedRoom(profile.roomId);
    if (cachedRoom) {
      setRoom(cachedRoom);
      setLoading(false);
    }

    const unsub = onSnapshot(
      doc(db, "rooms", profile.roomId),
      (snap) => {
        const roomData = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        setRoom(roomData);
        if (roomData) cacheRoom(profile.roomId, roomData);
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
