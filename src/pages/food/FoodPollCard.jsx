import { useMemo } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { clamp } from "../../utils/helpers";

export default function FoodPollCard({ poll, totalVoters, currentUid, onVote, onClose, canClose }) {
  const currentOptionId = useMemo(
    () =>
      Object.entries(poll.votes || {}).find(([, uids]) =>
        Array.isArray(uids) ? uids.includes(currentUid) : false
      )?.[0],
    [poll.votes, currentUid]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">{poll.question || "What should we order?"}</p>
          <p className="text-xs text-white/40">Created by {poll.createdByName || "—"}</p>
        </div>
        {canClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Poll
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {(poll.options || []).map((opt) => {
          const votes = (poll.votes?.[opt.id] || []).length;
          const pct = totalVoters ? Math.round((votes / totalVoters) * 100) : 0;
          const active = currentOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onVote(opt.id)}
              className={`glass-card p-4 text-left border transition-all ${
                active ? "glow-border" : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">{opt.label}</p>
                <Badge variant="primary">{votes} votes</Badge>
              </div>
              <div className="mt-2 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand"
                  style={{ width: `${clamp(pct, 0, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40">{pct}%</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
