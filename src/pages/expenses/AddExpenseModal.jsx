import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { addExpense } from "../../services/expenseService";
import { EXPENSE_CATEGORIES } from "../../utils/constants";

const todayISODate = () => new Date().toISOString().slice(0, 10);

export default function AddExpenseModal({ isOpen, onClose }) {
  const { room } = useRoom();
  const { user, profile } = useAuth();

  const memberOptions = useMemo(
    () =>
      (room?.members || []).map((m) => ({ value: m.uid, label: m.displayName })),
    [room?.members]
  );

  const categoryOptions = useMemo(
    () =>
      EXPENSE_CATEGORIES.map((c) => ({
        value: c.id,
        label: `${c.icon} ${c.label}`,
      })),
    []
  );

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.id || "other");
  const [paidBy, setPaidBy] = useState(user?.uid || "");
  const [splitAmong, setSplitAmong] = useState(room?.memberIds || []);
  const [date, setDate] = useState(todayISODate());
  const [loading, setLoading] = useState(false);

  const toggleSplit = (uid) => {
    setSplitAmong((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room?.id || !user) return;
    if (!title.trim()) return toast.error("Title is required");
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return toast.error("Amount must be > 0");
    if (!paidBy) return toast.error("Select who paid");
    if (splitAmong.length === 0) return toast.error("Pick at least one roommate");

    setLoading(true);
    try {
      await addExpense(room.id, {
        title: title.trim(),
        amount: n,
        category,
        paidBy,
        splitAmong,
        date: new Date(date).toISOString(),
        createdBy: user.uid,
        createdByName: profile?.displayName || "",
      });
      toast.success("Expense added!");
      onClose();
      setTitle("");
      setAmount("");
      setCategory(EXPENSE_CATEGORIES[0]?.id || "other");
      setPaidBy(user.uid);
      setSplitAmong(room.memberIds || []);
      setDate(todayISODate());
    } catch (err) {
      toast.error(err?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            required
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />
          <Select
            label="Paid By"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            options={memberOptions}
          />
        </div>

        <div>
          <p className="text-sm text-white/70 font-medium mb-2">Split Among</p>
          <div className="flex flex-wrap gap-2">
            {(room?.members || []).map((m) => {
              const active = splitAmong.includes(m.uid);
              return (
                <button
                  type="button"
                  key={m.uid}
                  onClick={() => toggleSplit(m.uid)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                    active
                      ? "border-primary-500/40 bg-primary-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {m.displayName}
                </button>
              );
            })}
          </div>
          <div className="mt-2">
            <Badge variant="info">{splitAmong.length} selected</Badge>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
