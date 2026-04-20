import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { createRoom } from "../../services/roomService";
import { updateUserRoom } from "../../services/authService";

export default function CreateRoomStep() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null); // { roomId, joinCode }
  const canEnter = useMemo(() => !!created?.roomId, [created]);

  const onCreate = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      const result = await createRoom(
        user.uid,
        profile?.displayName || user.displayName || "",
        roomName.trim()
      );
      setCreated(result);
      if (result?.writePending) {
        toast.success("Room created locally — will sync when online.");
      } else {
        toast.success("Room created!");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!created?.joinCode) return;
    await navigator.clipboard.writeText(created.joinCode);
    toast.success("Join code copied!");
  };

  const enter = async () => {
    if (!created?.roomId) return;
    setLoading(true);
    try {
      await updateUserRoom(user.uid, created.roomId);
      await refreshProfile();
      navigate("/");
    } catch (err) {
      toast.error(err?.message || "Failed to enter room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="section-title mb-4">Create your room</h2>
      <div className="space-y-4">
        <Input
          label="Room name"
          placeholder='e.g., "404 Not Found", "The Cave"'
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
          disabled={!!created}
        />

        {!created && (
          <Button onClick={onCreate} loading={loading} className="w-full">
            Create Room
          </Button>
        )}

        {created && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4">
              <p className="text-white/60 text-sm">Your join code</p>
              <div className="flex items-center justify-between gap-3 mt-2">
                <p className="font-display text-2xl font-bold text-white tracking-widest">
                  {created.joinCode}
                </p>
                <Button variant="secondary" size="sm" onClick={copy}>
                  Copy
                </Button>
              </div>
            </div>

            <Button
              onClick={enter}
              loading={loading}
              className="w-full"
              disabled={!canEnter}
            >
              Enter DormMate →
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
