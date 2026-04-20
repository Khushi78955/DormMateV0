import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { IoTrash } from "react-icons/io5";
import Badge from "../../components/ui/Badge";
import RoommateChip from "../../components/shared/RoommateChip";
import { EXPENSE_CATEGORIES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { safeToDate } from "../../utils/helpers";

const getMember = (room, uid) =>
  room?.members?.find((m) => m.uid === uid) || { uid, displayName: "Unknown" };

function ExpenseCard({ expense, room, canDelete = false, onDelete, compact = false }) {
  const cat = useMemo(
    () => EXPENSE_CATEGORIES.find((c) => c.id === expense.category) || EXPENSE_CATEGORIES.at(-1),
    [expense.category]
  );
  const paidBy = getMember(room, expense.paidBy);
  const date = safeToDate(expense.date) || safeToDate(expense.createdAt);
  const splitCount = expense.splitAmong?.length || 0;
  const share = splitCount ? Number(expense.amount || 0) / splitCount : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${cat?.color || "#6c22ff"}22` }}
          >
            <span>{cat?.icon || "📦"}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{expense.title}</p>
            <p className="text-xs text-white/40">
              Paid by <span className="text-white/70">{paidBy.displayName}</span>
              {date ? ` · ${formatDate(date)}` : ""}
            </p>
            {!compact && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(expense.splitAmong || []).map((uid) => {
                  const m = getMember(room, uid);
                  return <RoommateChip key={uid} member={m} />;
                })}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-display font-bold">{formatCurrency(expense.amount)}</p>
          <p className="text-xs text-white/40">{formatCurrency(share)} / person</p>
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-red-300/80 hover:text-red-300"
              type="button"
              title="Delete"
            >
              <IoTrash /> Delete
            </button>
          )}
        </div>
      </div>
      {!compact && expense.category && (
        <div className="mt-3">
          <Badge variant="primary">{cat?.label || expense.category}</Badge>
        </div>
      )}
    </motion.div>
  );
}

export default memo(ExpenseCard);
