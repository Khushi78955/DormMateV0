import { useEffect, useMemo, useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useRoom } from "../../context/RoomContext";
import { subscribeChores } from "../../services/choreService";
import { getChoreLeaderboard } from "../../utils/calculations";
import { safeToDate } from "../../utils/helpers";
import AddChoreModal from "./AddChoreModal";
import ChoreCard from "./ChoreCard";

const isDueThisWeek = (dueDate) => {
  if (!dueDate) return false;
  const d = safeToDate(dueDate) || new Date(dueDate);
  const diffDays = Math.floor((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return diffDays >= -1 && diffDays <= 7;
};

export default function ChoresPage() {
  const { room } = useRoom();
  const [chores, setChores] = useState([]);
  const [activeTab, setActiveTab] = useState("week");
  const [assignee, setAssignee] = useState("all");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeChores(room.id, setChores);
    return unsub;
  }, [room?.id]);

  const assigneeOptions = useMemo(() => {
    const base = [{ value: "all", label: "All" }];
    const members = (room?.members || []).map((m) => ({ value: m.uid, label: m.displayName }));
    return base.concat(members);
  }, [room?.members]);

  const choresThisWeek = useMemo(() => {
    let list = chores.filter((c) => isDueThisWeek(c.dueDate));
    if (assignee !== "all") list = list.filter((c) => c.assignedTo === assignee);
    return list;
  }, [chores, assignee]);

  const leaderboard = useMemo(
    () => getChoreLeaderboard(chores, room?.members || []),
    [chores, room?.members]
  );

  const history = useMemo(() => {
    let list = [...chores];
    if (historyFilter !== "all") list = list.filter((c) => c.status === historyFilter);
    return list;
  }, [chores, historyFilter]);

  return (
    <PageWrapper>
      <PageHeader
        title="Chores"
        subtitle="Assign tasks and keep the room clean"
        action={<Button onClick={() => setIsAddOpen(true)}>Add Chore</Button>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant={activeTab === "week" ? "primary" : "secondary"}
          onClick={() => setActiveTab("week")}
        >
          Week
        </Button>
        <Button
          size="sm"
          variant={activeTab === "leaderboard" ? "primary" : "secondary"}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </Button>
        <Button
          size="sm"
          variant={activeTab === "history" ? "primary" : "secondary"}
          onClick={() => setActiveTab("history")}
        >
          History
        </Button>
      </div>

      {activeTab === "week" && (
        <>
          <div className="mb-4 max-w-xs">
            <Select
              label="Filter by assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              options={assigneeOptions}
            />
          </div>
          <div className="flex flex-col gap-3">
            {choresThisWeek.length === 0 ? (
              <Card>
                <p className="text-white/40">No chores due this week.</p>
              </Card>
            ) : (
              choresThisWeek.map((c) => <ChoreCard key={c.id} chore={c} room={room} />)
            )}
          </div>
        </>
      )}

      {activeTab === "leaderboard" && (
        <Card>
          <h2 className="section-title mb-3">🏆 Rankings</h2>
          {leaderboard.length === 0 ? (
            <p className="text-white/40">No chores yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((m, idx) => {
                const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "";
                return (
                  <div key={m.uid} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-white/60">{medal || idx + 1}</span>
                      <Avatar name={m.displayName} src={m.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-white/90">{m.displayName}</p>
                        <p className="text-xs text-white/40">
                          {m.completed} done · {m.missed} missed
                        </p>
                      </div>
                    </div>
                    <Badge variant={m.missed ? "warning" : "success"}>{m.completed} done</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {activeTab === "history" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              size="sm"
              variant={historyFilter === "all" ? "primary" : "secondary"}
              onClick={() => setHistoryFilter("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={historyFilter === "done" ? "primary" : "secondary"}
              onClick={() => setHistoryFilter("done")}
            >
              Done
            </Button>
            <Button
              size="sm"
              variant={historyFilter === "missed" ? "primary" : "secondary"}
              onClick={() => setHistoryFilter("missed")}
            >
              Missed
            </Button>
            <Button
              size="sm"
              variant={historyFilter === "pending" ? "primary" : "secondary"}
              onClick={() => setHistoryFilter("pending")}
            >
              Pending
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {history.length === 0 ? (
              <Card>
                <p className="text-white/40">No chores found.</p>
              </Card>
            ) : (
              history.map((c) => <ChoreCard key={c.id} chore={c} room={room} />)
            )}
          </div>
        </>
      )}

      <AddChoreModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </PageWrapper>
  );
}
