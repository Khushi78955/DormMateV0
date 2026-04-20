import { useMemo } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import { useRoom } from "../../context/RoomContext";
import { updateRoomMood } from "../../services/roomService";
import { ROOM_MOODS } from "../../utils/constants";

const tips = {
  study: "Keep distractions low, use headphones, and keep the desk tidy.",
  chill: "Relax and unwind—keep common areas comfortable and clean.",
  sleep: "Lights dim, volume low, and respect quiet conversations.",
  party: "Have fun—just keep noise reasonable and clean up after.",
};

export default function MoodPage() {
  const { room } = useRoom();
  const active = room?.mood || "chill";

  const activeMood = useMemo(() => ROOM_MOODS.find((m) => m.id === active), [active]);

  const setMood = async (moodId) => {
    if (!room?.id) return;
    try {
      await updateRoomMood(room.id, moodId);
      toast.success("Mood updated");
    } catch (e) {
      toast.error(e?.message || "Failed to update mood");
    }
  };

  return (
    <PageWrapper>
      <div
        className={`h-2 w-full rounded-full mb-4 ${
          active === "study"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
            : active === "chill"
              ? "bg-gradient-to-r from-green-600 to-teal-600"
              : active === "sleep"
                ? "bg-gradient-to-r from-indigo-900 to-gray-900"
                : "bg-gradient-to-r from-pink-600 to-purple-600"
        }`}
      />
      <PageHeader title="Room Mood" subtitle="Set the vibe for everyone" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROOM_MOODS.map((m) => {
          const isActive = m.id === active;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              className={`glass-card p-6 text-left transition-all ${
                isActive ? "glow-border scale-[1.02]" : "hover:shadow-glow"
              }`}
            >
              <div className={`rounded-2xl p-4 bg-gradient-to-br ${m.color} text-white`}
              >
                <p className="text-4xl">{m.icon}</p>
                <p className="mt-2 text-lg font-display font-bold">{m.label}</p>
              </div>
              {isActive ? <p className="mt-3 text-sm text-primary-300">✓ Active</p> : <p className="mt-3 text-sm text-white/40">Tap to activate</p>}
            </button>
          );
        })}
      </div>

      <Card className="mt-6">
        <h2 className="section-title mb-2">Mood Tips</h2>
        <p className="text-white/60">
          {tips[active] || "Pick a mood that matches your room’s vibe."}
        </p>
        {activeMood ? (
          <p className="mt-3 text-xs text-white/40">Current mood: {activeMood.label}</p>
        ) : null}
      </Card>
    </PageWrapper>
  );
}
