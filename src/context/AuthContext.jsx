import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  cacheUserProfile,
  clearCachedUserProfile,
  getCachedUserProfile,
  getUserProfile,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        clearCachedUserProfile();
        setLoading(false);
        return;
      }

      const cachedProfile = getCachedUserProfile(firebaseUser.uid);
      if (cachedProfile) {
        setProfile(cachedProfile);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const p = await getUserProfile(firebaseUser.uid);
        if (p) {
          setProfile(p);
          cacheUserProfile(p);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        if (!cachedProfile) {
          setProfile(null);
        }
      } finally {
        if (!cachedProfile) {
          setLoading(false);
        }
      }
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (user) {
      try {
        const p = await getUserProfile(user.uid);
        setProfile(p);
        cacheUserProfile(p);
      } catch (err) {
        console.error("Failed to refresh user profile:", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
