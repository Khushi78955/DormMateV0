import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextArea from "../../components/ui/TextArea";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { addNoiseComplaint, subscribeNoiseComplaints } from "../../services/noiseService";
import { db } from "../../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import ComplaintCard from "./ComplaintCard";

export default function NoisePage() {
  const { room } = useRoom();
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [severity, setSeverity] = useState("Low");
  const [newRule, setNewRule] = useState("");
  const [savingRule, setSavingRule] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeNoiseComplaints(room.id, setComplaints);
    return unsub;
  }, [room?.id]);

  const isQuietHours = useMemo(() => {
    const h = new Date().getHours();
    return h >= 23 || h < 7;
  }, []);

  const isAdmin = user?.uid && (room?.createdBy === user.uid);

  const handleAddRule = async () => {
    if (!room?.id || !isAdmin) return;
    if (!newRule.trim()) return;
    setSavingRule(true);
    try {
      const next = [...(room.houseRules || []), newRule.trim()];
      await updateDoc(doc(db, "rooms", room.id), { houseRules: next });
      setNewRule("");
      toast.success("Rule added");
    } catch (e) {
      toast.error(e?.message || "Failed to update rules");
    } finally {
      setSavingRule(false);
    }
  };

  const handleDeleteRule = async (idx) => {
    if (!room?.id || !isAdmin) return;
    setSavingRule(true);
    try {
      const next = (room.houseRules || []).filter((_, i) => i !== idx);
      await updateDoc(doc(db, "rooms", room.id), { houseRules: next });
      toast.success("Rule removed");
    } catch (e) {
      toast.error(e?.message || "Failed to update rules");
    } finally {
      setSavingRule(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room?.id || !user) return;
    if (!description.trim()) return toast.error("Description is required");
    setSubmitting(true);
    try {
      await addNoiseComplaint(room.id, {
        description: description.trim(),
        anonymous,
        severity,
        reportedBy: anonymous ? null : user.uid,
        reportedByName: anonymous ? "Anonymous" : profile?.displayName || "",
      });
      toast.success("Complaint reported");
      setIsOpen(false);
      setDescription("");
      setAnonymous(false);
      setSeverity("Low");
    } catch (err) {
      toast.error(err?.message || "Failed to report complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Noise Tracker"
        subtitle="Keep things peaceful"
        action={<Button onClick={() => setIsOpen(true)}>Report Complaint</Button>}
      />

      <Card className={`mb-4 ${isQuietHours ? "glow-border" : ""}`}>
        <div className="flex items-center justify-between">
          <p className="section-title">{isQuietHours ? "🔇 Quiet Hours Active" : "🔊 Normal Hours"}</p>
          <Badge variant={isQuietHours ? "danger" : "info"}>{isQuietHours ? "23:00–07:00" : "Daytime"}</Badge>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">House Rules</h2>
          {isAdmin ? <Badge variant="primary">Admin</Badge> : <Badge>Read only</Badge>}
        </div>
        <div className="space-y-2">
          {(room?.houseRules || []).map((r, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <p className="text-white/70">• {r}</p>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteRule(idx)}
                  disabled={savingRule}
                >
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <Input
              className="md:col-span-4"
              label="Add rule"
              placeholder="e.g., Keep noise low after 11pm"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
            />
            <Button className="md:col-span-1" variant="secondary" onClick={handleAddRule} loading={savingRule}>
              Add
            </Button>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        {complaints.length === 0 ? (
          <Card>
            <p className="text-white/40">No complaints yet.</p>
          </Card>
        ) : (
          complaints.map((c) => <ComplaintCard key={c.id} complaint={c} room={room} />)
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Report Complaint" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextArea
            label="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4 accent-[#6c22ff]"
            />
            <span className="text-white/70 text-sm">Report anonymously</span>
          </div>
          <div>
            <p className="text-sm text-white/70 font-medium mb-2">Severity</p>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    severity === s
                      ? "border-primary-500/40 bg-primary-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
