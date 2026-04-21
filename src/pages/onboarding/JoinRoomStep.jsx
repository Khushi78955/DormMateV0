import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { joinRoom } from "../../services/roomService";
import { updateUserRoom } from "../../services/authService";

export default function JoinRoomStep() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatted = useMemo(
    () => joinCode.toUpperCase().replace(/\s+/g, "").slice(0, 6),
    [joinCode]
  );

  const onJoin = async () => {
    setError("");
    if (formatted.length !== 6) {
      setError("Please enter a valid 6-character join code.");
      return;
    }
    setLoading(true);
    try {
      const roomId = await joinRoom(
        formatted,
        user.uid,
        profile?.displayName || user.displayName || ""
      );
      await updateUserRoom(user.uid, roomId);
      await refreshProfile();
      toast.success("Joined room!");
      navigate("/");
    } catch (err) {
      const msg = err?.message || "Invalid room code.";
      const isPermission =
        err?.code === "permission-denied" ||
        /insufficient permissions|permission/i.test(msg);
      setError(
        isPermission
          ? "Room code is valid, but join was blocked by Firebase permissions. Publish the latest Firestore rules and ensure your deployed domain is added in Firebase Auth → Authorized domains."
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="section-title mb-4">Join an existing room</h2>
      <div className="space-y-4">
        <Input
          label="Join code"
          placeholder="ABC123"
          value={formatted}
          onChange={(e) => setJoinCode(e.target.value)}
          required
          error={error || undefined}
        />

        <Button onClick={onJoin} loading={loading} className="w-full">
          Join Room
        </Button>
      </div>
    </Card>
  );
}
