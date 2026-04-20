import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { closePoll, createFoodPoll, subscribeFoodPolls, voteOnPoll } from "../../services/foodService";
import { FOOD_OPTIONS } from "../../utils/constants";
import FoodPollCard from "./FoodPollCard";

const buildOption = (label, idx) => ({
  id: `opt_${idx}_${Math.random().toString(16).slice(2, 8)}`,
  label,
});

export default function FoodPage() {
  const { room } = useRoom();
  const { user, profile } = useAuth();
  const [polls, setPolls] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeFoodPolls(room.id, setPolls);
    return unsub;
  }, [room?.id]);

  const activePoll = useMemo(() => polls.find((p) => p.status === "active"), [polls]);
  const closedPolls = useMemo(() => polls.filter((p) => p.status === "closed"), [polls]);

  const totalVoters = room?.memberIds?.length || 0;

  const handleCreate = async () => {
    if (!room?.id || !user) return;
    const base = Array.from(selected).map((label, idx) => buildOption(label, idx));
    const opts = custom.trim() ? base.concat(buildOption(custom.trim(), base.length)) : base;
    if (opts.length < 2) return toast.error("Pick at least 2 options");

    const votes = {};
    opts.forEach((o) => (votes[o.id] = []));

    setLoading(true);
    try {
      await createFoodPoll(room.id, {
        question: "What should we order?",
        options: opts,
        createdBy: user.uid,
        createdByName: profile?.displayName || "",
        votes,
      });
      toast.success("Poll created");
      setIsCreateOpen(false);
      setSelected(new Set());
      setCustom("");
    } catch (e) {
      toast.error(e?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelected = (label) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleVote = async (poll, optionId) => {
    if (!room?.id || !user) return;
    const currentOptionId = Object.entries(poll.votes || {}).find(([, uids]) =>
      Array.isArray(uids) ? uids.includes(user.uid) : false
    )?.[0];
    try {
      await voteOnPoll(room.id, poll.id, optionId, user.uid, currentOptionId);
    } catch (e) {
      toast.error(e?.message || "Failed to vote");
    }
  };

  const handleClose = async (poll) => {
    if (!room?.id || !user) return;
    if (poll.createdBy !== user.uid) return;
    const options = poll.options || [];
    const votes = poll.votes || {};
    let winner = options[0]?.label || "";
    let best = -1;
    options.forEach((o) => {
      const count = (votes[o.id] || []).length;
      if (count > best) {
        best = count;
        winner = o.label;
      }
    });
    try {
      await closePoll(room.id, poll.id, winner);
      toast.success("Poll closed");
    } catch (e) {
      toast.error(e?.message || "Failed to close poll");
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Food Order"
        subtitle="Vote and coordinate group orders"
        action={
          !activePoll ? <Button onClick={() => setIsCreateOpen(true)}>Create Food Poll</Button> : null
        }
      />

      <Card className="mb-4">
        <h2 className="section-title mb-2">Active Poll</h2>
        {!activePoll ? (
          <p className="text-white/40">No active poll right now.</p>
        ) : (
          <FoodPollCard
            poll={activePoll}
            totalVoters={totalVoters}
            currentUid={user?.uid}
            onVote={(optId) => handleVote(activePoll, optId)}
            onClose={() => handleClose(activePoll)}
            canClose={activePoll.createdBy === user?.uid}
          />
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-title">Past Orders</h2>
          <Badge variant="primary">{closedPolls.length}</Badge>
        </div>
        {closedPolls.length === 0 ? (
          <p className="text-white/40">No past orders yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {closedPolls.map((p) => (
              <div key={p.id} className="glass-card p-4">
                <p className="text-white font-semibold">{p.question || "Food Poll"}</p>
                <p className="text-sm text-white/50 mt-1">
                  Winner: <span className="text-white/80">{p.winner || "—"}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Food Poll" size="lg">
        <div className="space-y-4">
          <p className="text-white/60 text-sm">Pick options (at least 2).</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {FOOD_OPTIONS.map((opt) => {
              const active = selected.has(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleSelected(opt)}
                  className={`px-3 py-2 rounded-xl border text-sm ${
                    active
                      ? "border-primary-500/40 bg-primary-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <Input
            label="Custom option (optional)"
            placeholder="e.g., Paneer Tikka"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={loading}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
