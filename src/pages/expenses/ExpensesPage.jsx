import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import MonthlyBarChart from "../../components/charts/MonthlyBarChart";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { addExpense, subscribeExpenses, deleteExpense } from "../../services/expenseService";
import { calculateSettlements } from "../../utils/calculations";
import { formatCurrency } from "../../utils/formatters";
import { monthKey, monthLabel, safeToDate } from "../../utils/helpers";
import AddExpenseModal from "./AddExpenseModal";
import ExpenseCard from "./ExpenseCard";

const getMember = (room, uid) =>
  room?.members?.find((m) => m.uid === uid) || { uid, displayName: "Unknown" };

const lastMonths = (count = 3) => {
  const res = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    res.push({ key: monthKey(d), label: monthLabel(d) });
  }
  return res;
};

export default function ExpensesPage() {
  const { room } = useRoom();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeExpenses(room.id, setExpenses);
    return unsub;
  }, [room?.id]);

  const settlements = useMemo(
    () => calculateSettlements(expenses, room?.memberIds || []),
    [expenses, room?.memberIds]
  );

  const filtered = useMemo(() => {
    if (selectedMonth === "all") return expenses;
    return expenses.filter((e) => {
      const d = safeToDate(e.date) || safeToDate(e.createdAt);
      return d && monthKey(d) === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const d = safeToDate(e.date) || safeToDate(e.createdAt) || new Date();
      const key = monthKey(d);
      const list = map.get(key) || [];
      list.push(e);
      map.set(key, list);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const chartData = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      const d = safeToDate(e.date) || safeToDate(e.createdAt) || new Date();
      const key = monthLabel(d);
      totals[key] = (totals[key] || 0) + Number(e.amount || 0);
    });
    return Object.entries(totals)
      .map(([month, amount]) => ({ month, amount: +amount.toFixed(2) }))
      .slice(-8);
  }, [expenses]);

  const handleMarkSettled = async (settlement) => {
    if (!room?.id || !user) return;
    const from = getMember(room, settlement.from);
    const to = getMember(room, settlement.to);
    try {
      await addExpense(room.id, {
        title: `Settlement: ${from.displayName} → ${to.displayName}`,
        amount: Number(settlement.amount),
        category: "other",
        paidBy: settlement.from,
        splitAmong: [settlement.to],
        date: new Date().toISOString(),
      });
      toast.success("Marked as settled");
    } catch (e) {
      toast.error(e?.message || "Failed to settle");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!room?.id) return;
    try {
      await deleteExpense(room.id, expenseId);
      toast.success("Expense deleted");
    } catch (e) {
      toast.error(e?.message || "Failed to delete expense");
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Expenses"
        subtitle="Split, track, and settle up"
        action={<Button onClick={() => setIsAddOpen(true)}>Add Expense</Button>}
      />

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">💸 Who Owes Whom</h2>
          <Badge variant="primary">{settlements.length} transfers</Badge>
        </div>
        {settlements.length === 0 ? (
          <p className="text-white/40">All settled up.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {settlements.map((s, idx) => {
              const from = getMember(room, s.from);
              const to = getMember(room, s.to);
              return (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={from.displayName} src={from.avatar} size="sm" />
                    <span className="text-white/70 truncate">{from.displayName}</span>
                    <span className="text-white/30">owes</span>
                    <Avatar name={to.displayName} src={to.avatar} size="sm" />
                    <span className="text-white/70 truncate">{to.displayName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(s.amount)}</span>
                    <Button variant="secondary" size="sm" onClick={() => handleMarkSettled(s)}>
                      Mark Settled
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedMonth === "all" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setSelectedMonth("all")}
        >
          All Time
        </Button>
        {lastMonths(3).map((m) => (
          <Button
            key={m.key}
            variant={selectedMonth === m.key ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedMonth(m.key)}
          >
            {m.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {grouped.length === 0 ? (
          <Card>
            <p className="text-white/40">No expenses yet.</p>
          </Card>
        ) : (
          grouped.map(([key, list]) => (
            <div key={key} className="flex flex-col gap-3">
              <p className="text-sm text-white/50 font-semibold">{monthLabel(key)}</p>
              {list.map((e) => (
                <ExpenseCard
                  key={e.id}
                  expense={e}
                  room={room}
                  canDelete={e.paidBy === user?.uid || room?.createdBy === user?.uid}
                  onDelete={handleDeleteExpense}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <Card>
          <h2 className="section-title mb-3">Monthly Spend</h2>
          <MonthlyBarChart data={chartData} />
        </Card>
      </div>

      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </PageWrapper>
  );
}
