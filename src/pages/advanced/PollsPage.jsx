import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { addHours } from "date-fns";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { clamp } from "../../utils/helpers";

const makeId = () => `opt_${Math.random().toString(16).slice(2, 10)}`;

export default function PollsPage() {
  const { room } = useRoom();
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room?.id) return;
    const ref = collection(db, "rooms", room.id, "polls");
    const unsub = onSnapshot(ref, (snap) => {
      setPolls(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [room?.id]);

  const now = Date.now();
  const activePolls = useMemo(
    () =>
      polls.filter((p) => {
        const exp = p.expiresAt?.toDate ? p.expiresAt.toDate().getTime() : null;
        return p.status !== "closed" && (!exp || exp > now);
      }),
    [polls, now]
  );
  const closedPolls = useMemo(
    () =>
      polls.filter((p) => {
        const exp = p.expiresAt?.toDate ? p.expiresAt.toDate().getTime() : null;
        return p.status === "closed" || (exp && exp <= now);
      }),
    [polls, now]
  );

  const openCreate = () => {
    setIsOpen(true);
    setQuestion("");
    setOptions(["", ""]);
    setMultipleChoice(false);
    setExpiryHours(24);
  };

  const handleCreate = async () => {
    if (!room?.id || !user) return;
    const q = question.trim();
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!q) return toast.error("Question is required");
    if (opts.length < 2) return toast.error("Add at least 2 options");
    if (opts.length > 4) return toast.error("Max 4 options");

    const optionObjs = opts.map((label) => ({ id: makeId(), label }));
    const votes = {};
    optionObjs.forEach((o) => (votes[o.id] = []));

    setLoading(true);
    try {
      await addDoc(collection(db, "rooms", room.id, "polls"), {
        question: q,
        options: optionObjs,
        votes,
        multipleChoice,
        createdBy: user.uid,
        status: "active",
        expiresAt: Timestamp.fromDate(addHours(new Date(), expiryHours)),
        createdAt: Timestamp.fromDate(new Date()),
      });
      toast.success("Poll created");
      setIsOpen(false);
    } catch (e) {
      toast.error(e?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const vote = async (poll, optionId) => {
    if (!room?.id || !user) return;
    const pollRef = doc(db, "rooms", room.id, "polls", poll.id);
    const votes = poll.votes || {};
    const currentSelections = Object.entries(votes)
      .filter(([, uids]) => Array.isArray(uids) && uids.includes(user.uid))
      .map(([id]) => id);

    try {
      if (!poll.multipleChoice) {
        const updates = {};
        currentSelections.forEach((id) => {
          updates[`votes.${id}`] = arrayRemove(user.uid);
        });
        if (!currentSelections.includes(optionId)) updates[`votes.${optionId}`] = arrayUnion(user.uid);
        await updateDoc(pollRef, updates);
      } else {
        const isOn = currentSelections.includes(optionId);
        await updateDoc(pollRef, {
          [`votes.${optionId}`]: isOn ? arrayRemove(user.uid) : arrayUnion(user.uid),
        });
      }
    } catch (e) {
      toast.error(e?.message || "Failed to vote");
    }
  };

  const closePoll = async (poll) => {
    if (!room?.id || !user || poll.createdBy !== user.uid) return;
    try {
      await updateDoc(doc(db, "rooms", room.id, "polls", poll.id), { status: "closed" });
      toast.success("Poll closed");
    } catch (e) {
      toast.error(e?.message || "Failed to close poll");
    }
  };

  const renderPoll = (poll) => {
    const totalVotes = Object.values(poll.votes || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    const exp = poll.expiresAt?.toDate ? poll.expiresAt.toDate().getTime() : null;
    const remainingMs = exp ? exp - Date.now() : null;
    const remaining = remainingMs != null ? Math.max(0, Math.floor(remainingMs / 60000)) : null;

    const selections = new Set(
      Object.entries(poll.votes || {})
        .filter(([, uids]) => Array.isArray(uids) && uids.includes(user?.uid))
        .map(([id]) => id)
    );

    return (
      <div key={poll.id} className="glass-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-semibold">{poll.question}</p>
            <p className="text-xs text-white/40">
              {poll.multipleChoice ? "Multiple choice" : "Single choice"}
              {remaining != null ? ` · ${remaining}m left` : ""}
            </p>
          </div>
          {poll.createdBy === user?.uid && poll.status !== "closed" ? (
            <Button size="sm" variant="secondary" onClick={() => closePoll(poll)}>
              Close
            </Button>
          ) : null}
        </div>

        <div className="mt-3 space-y-2">
          {(poll.options || []).map((opt) => {
            const count = (poll.votes?.[opt.id] || []).length;
            const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
            const active = selections.has(opt.id);
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => vote(poll, opt.id)}
                className={`w-full text-left glass-card p-3 border ${active ? "glow-border" : "border-white/10"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/80">{opt.label}</span>
                  <Badge variant="primary">{count}</Badge>
                </div>
                <div className="mt-2 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand" style={{ width: `${clamp(pct, 0, 100)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Polls"
        subtitle="Run quick votes for the room"
        action={<Button onClick={openCreate}>+ Create Poll</Button>}
      />

      <Card className="mb-4">
        <h2 className="section-title mb-3">Active Polls</h2>
        {activePolls.length === 0 ? (
          <p className="text-white/40">No active polls.</p>
        ) : (
          <div className="flex flex-col gap-3">{activePolls.map(renderPoll)}</div>
        )}
      </Card>

      <Card>
        <h2 className="section-title mb-3">Closed Polls</h2>
        {closedPolls.length === 0 ? (
          <p className="text-white/40">No closed polls.</p>
        ) : (
          <div className="flex flex-col gap-3">{closedPolls.map(renderPoll)}</div>
        )}
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Poll" size="lg">
        <div className="space-y-4">
          <Input label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />

          <div className="space-y-2">
            <p className="text-sm text-white/70 font-medium">Options (max 4)</p>
            {options.map((opt, idx) => (
              <Input
                key={idx}
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) =>
                  setOptions((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                }
              />
            ))}
            {options.length < 4 ? (
              <Button variant="secondary" size="sm" onClick={() => setOptions((p) => p.concat(""))}>
                + Add Option
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={multipleChoice}
              onChange={(e) => setMultipleChoice(e.target.checked)}
              className="w-4 h-4 accent-[#6c22ff]"
            />
            <span className="text-white/70 text-sm">Allow multiple choice</span>
          </div>

          <div>
            <p className="text-sm text-white/70 font-medium mb-2">Expiry</p>
            <div className="flex flex-wrap gap-2">
              {[1, 6, 24, 48].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setExpiryHours(h)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    expiryHours === h
                      ? "border-primary-500/40 bg-primary-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
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
