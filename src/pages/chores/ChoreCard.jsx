import { memo, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/shared/StatusBadge";
import { CHORE_TYPES } from "../../utils/constants";
import { updateChoreStatus } from "../../services/choreService";
import { safeToDate } from "../../utils/helpers";

const getMember = (room, uid) =>
  room?.members?.find((m) => m.uid === uid) || { uid, displayName: "Unknown" };

const isOverdue = (dueDate, status) => {
  if (status !== "pending") return false;
  const d = safeToDate(dueDate) || new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

function ChoreCard({ chore, room }) {
  const type = useMemo(
    () => CHORE_TYPES.find((t) => t.id === chore.type) || CHORE_TYPES[0],
    [chore.type]
  );
  const member = getMember(room, chore.assignedTo);
  const overdue = isOverdue(chore.dueDate, chore.status);

  const setStatus = async (status) => {
    if (!room?.id) return;
    try {
      await updateChoreStatus(room.id, chore.id, status);
      toast.success("Updated");
    } catch (e) {
      toast.error(e?.message || "Failed to update");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className={`glass-card p-4 relative ${overdue ? "border border-red-500/30" : ""}`}
      >
        <div className="absolute top-3 right-3">
          <StatusBadge status={chore.status} />
        </div>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
            {type?.icon || "🧹"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold">{type?.label || "Chore"}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
              <Avatar name={member.displayName} src={member.avatar} size="xs" />
              <span className="truncate">{member.displayName}</span>
              {chore.dueDate && (
                <span className={overdue ? "text-red-300" : ""}>· due {chore.dueDate}</span>
              )}
            </div>
            {chore.notes ? <p className="mt-2 text-sm text-white/60">{chore.notes}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setStatus("done")}>
                ✅ Done
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setStatus("missed")}>
                ❌ Missed
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setStatus("pending")}>
                🔄 Reset
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(ChoreCard);
