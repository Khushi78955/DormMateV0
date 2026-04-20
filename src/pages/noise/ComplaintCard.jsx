import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import { formatRelative } from "../../utils/formatters";
import { resolveNoiseComplaint } from "../../services/noiseService";
import { useAuth } from "../../context/AuthContext";

export default function ComplaintCard({ complaint, room }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const severityVariant =
    complaint.severity === "High" ? "danger" : complaint.severity === "Medium" ? "warning" : "info";

  const isAdmin = useMemo(() => user?.uid && room?.createdBy === user.uid, [user?.uid, room?.createdBy]);

  const handleResolve = async () => {
    if (!room?.id) return;
    setLoading(true);
    try {
      await resolveNoiseComplaint(room.id, complaint.id);
      toast.success("Resolved");
    } catch (e) {
      toast.error(e?.message || "Failed to resolve");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`glass-card p-4 ${complaint.resolved ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={severityVariant}>{complaint.severity || "Low"}</Badge>
            {complaint.resolved ? <Badge variant="success">Resolved</Badge> : null}
          </div>
          <p className="mt-2 text-white/80">{complaint.description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
            {complaint.reportedByName === "Anonymous" ? (
              <span>👤 Anonymous</span>
            ) : (
              <>
                <Avatar name={complaint.reportedByName || ""} size="xs" />
                <span>{complaint.reportedByName || "—"}</span>
              </>
            )}
            {complaint.createdAt ? <span>· {formatRelative(complaint.createdAt)}</span> : null}
          </div>
        </div>

        {isAdmin && !complaint.resolved ? (
          <Button variant="secondary" size="sm" onClick={handleResolve} loading={loading}>
            Resolve
          </Button>
        ) : null}
      </div>
    </div>
  );
}
