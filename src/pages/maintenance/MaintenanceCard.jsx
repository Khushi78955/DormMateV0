import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoTrash } from "react-icons/io5";
import Avatar from "../../components/ui/Avatar";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import { MAINTENANCE_CATEGORIES, MAINTENANCE_STATUS } from "../../utils/constants";
import { formatRelative } from "../../utils/formatters";
import { deleteMaintenanceRequest, updateMaintenanceStatus } from "../../services/maintenanceService";
import { useAuth } from "../../context/AuthContext";

export default function MaintenanceCard({ item, room }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const category = useMemo(
    () => MAINTENANCE_CATEGORIES.find((c) => c.id === item.category),
    [item.category]
  );
  const statusMeta = MAINTENANCE_STATUS[item.status] || MAINTENANCE_STATUS.PENDING;

  const canDelete = user?.uid && (item.reportedBy === user.uid || room?.createdBy === user.uid);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  const handleStatus = async (status) => {
    if (!room?.id) return;
    setLoading(true);
    try {
      await updateMaintenanceStatus(room.id, item.id, status);
      toast.success("Updated");
    } catch (e) {
      toast.error(e?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!room?.id) return;
    setLoading(true);
    try {
      await deleteMaintenanceRequest(room.id, item.id);
      toast.success("Deleted");
    } catch (e) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const priorityVariant = item.priority === "High" ? "danger" : item.priority === "Low" ? "success" : "warning";

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
            {category?.icon || "🔩"}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{item.title}</p>
            <p className="text-sm text-white/50 line-clamp-2">{item.description || ""}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant={priorityVariant}>{item.priority || "Medium"}</Badge>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
              <Avatar name={item.reportedByName || ""} size="xs" />
              <span className="truncate">{item.reportedByName || "—"}</span>
              {item.createdAt ? <span>· {formatRelative(item.createdAt)}</span> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <Select
            value={item.status || "PENDING"}
            onChange={(e) => handleStatus(e.target.value)}
            options={statusOptions}
          />
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
              title="Delete"
            >
              <IoTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
