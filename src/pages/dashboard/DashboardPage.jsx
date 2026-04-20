import { useEffect, useMemo, useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import ExpensePieChart from "../../components/charts/ExpensePieChart";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { subscribeExpenses } from "../../services/expenseService";
import { subscribeChores } from "../../services/choreService";
import { subscribeShoppingList } from "../../services/shoppingService";
import { subscribeMaintenance } from "../../services/maintenanceService";
import { subscribeAttendance } from "../../services/attendanceService";
import { calculateSettlements, getCategoryTotals, getChoreLeaderboard } from "../../utils/calculations";
import { formatCurrency, formatRelative } from "../../utils/formatters";
import { safeToDate } from "../../utils/helpers";
import ExpenseCard from "../expenses/ExpenseCard";

const getMember = (room, uid) =>
  room?.members?.find((m) => m.uid === uid) || { uid, displayName: "Unknown" };

export default function DashboardPage() {
  const { room } = useRoom();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [chores, setChores] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeExpenses(room.id, setExpenses);
    return unsub;
  }, [room?.id]);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeChores(room.id, setChores);
    return unsub;
  }, [room?.id]);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeShoppingList(room.id, setShoppingList);
    return unsub;
  }, [room?.id]);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeMaintenance(room.id, setMaintenance);
    return unsub;
  }, [room?.id]);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeAttendance(room.id, setAttendance);
    return unsub;
  }, [room?.id]);

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = safeToDate(e.date) || safeToDate(e.createdAt);
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const completedChoresThisWeek = useMemo(() => {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return chores.filter((c) => {
      if (c.status !== "done") return false;
      const d = safeToDate(c.updatedAt) || safeToDate(c.createdAt);
      return d && d.getTime() >= since;
    }).length;
  }, [chores]);

  const shoppingProgress = useMemo(() => {
    const total = shoppingList.length;
    const bought = shoppingList.filter((i) => i.bought).length;
    return { bought, total };
  }, [shoppingList]);

  const pendingMaintenance = useMemo(
    () => maintenance.filter((m) => m.status === "PENDING").length,
    [maintenance]
  );

  const roommatesHome = useMemo(() => {
    const statuses = Object.values(attendance || {});
    return statuses.filter((s) => s?.status === "hostel").length;
  }, [attendance]);

  const settlements = useMemo(
    () => calculateSettlements(expenses, room?.memberIds || []),
    [expenses, room?.memberIds]
  );

  const categoryTotals = useMemo(() => getCategoryTotals(expenses), [expenses]);

  const leaderboard = useMemo(
    () => getChoreLeaderboard(chores, room?.members || []),
    [chores, room?.members]
  );

  const recentExpenses = useMemo(() => expenses.slice(0, 3), [expenses]);

  if (!user) return null;

  return (
    <PageWrapper>
      <PageHeader
        title="Dashboard"
        subtitle={room?.roomName ? `Welcome back to ${room.roomName}` : ""}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-white/50 text-sm">Monthly Spend</p>
          <p className="text-3xl font-display font-bold">{formatCurrency(monthlyTotal)}</p>
          <p className="text-xs text-white/40">This month</p>
        </div>
        <div className="stat-card">
          <p className="text-white/50 text-sm">Chores Done</p>
          <p className="text-3xl font-display font-bold">{completedChoresThisWeek}</p>
          <p className="text-xs text-white/40">Last 7 days</p>
        </div>
        <div className="stat-card">
          <p className="text-white/50 text-sm">Shopping Progress</p>
          <p className="text-3xl font-display font-bold">
            {shoppingProgress.bought}/{shoppingProgress.total}
          </p>
          <p className="text-xs text-white/40">Items bought</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="stat-card">
          <p className="text-white/50 text-sm">Pending Maintenance</p>
          <p className="text-3xl font-display font-bold">{pendingMaintenance}</p>
          <p className="text-xs text-white/40">Needs attention</p>
        </div>
        <div className="stat-card">
          <p className="text-white/50 text-sm">Roommates Home</p>
          <p className="text-3xl font-display font-bold">{roommatesHome}</p>
          <p className="text-xs text-white/40">Marked “At Hostel”</p>
        </div>
        <div className="stat-card">
          <p className="text-white/50 text-sm">Room Mood</p>
          <p className="text-3xl font-display font-bold capitalize">{room?.mood || "—"}</p>
          <p className="text-xs text-white/40">Tap “Room Mood” to change</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">💸 Who Owes Whom</h2>
            <Badge variant="primary">{settlements.length} transfers</Badge>
          </div>
          {settlements.length === 0 ? (
            <p className="text-white/40">All settled up.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {settlements.slice(0, 5).map((s, idx) => {
                const from = getMember(room, s.from);
                const to = getMember(room, s.to);
                return (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={from.displayName} src={from.avatar} size="sm" />
                      <span className="text-white/70 truncate">{from.displayName}</span>
                      <span className="text-white/30">owes</span>
                      <Avatar name={to.displayName} src={to.avatar} size="sm" />
                      <span className="text-white/70 truncate">{to.displayName}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(s.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="section-title mb-3">🧾 Recent Expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="text-white/40">No expenses yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentExpenses.map((e) => (
                <ExpenseCard key={e.id} expense={e} compact room={room} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <h2 className="section-title mb-3">🍩 Spending by Category</h2>
          <ExpensePieChart expenses={expenses} totals={categoryTotals} />
        </Card>
        <Card>
          <h2 className="section-title mb-3">🏆 Chore Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p className="text-white/40">No chores yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.slice(0, 6).map((m, idx) => (
                <div key={m.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-white/40 text-sm">{idx + 1}</span>
                    <Avatar name={m.displayName} src={m.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-white/90">{m.displayName}</p>
                      <p className="text-xs text-white/40">
                        {m.completed} done · {m.missed} missed
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-white/40">
                    {m.updatedAt ? formatRelative(m.updatedAt) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
