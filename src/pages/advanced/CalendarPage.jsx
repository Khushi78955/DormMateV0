import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  addDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";

const COLORS = ["#6c22ff", "#22d3ee", "#f59e0b", "#10b981", "#ef4444"];

export default function CalendarPage() {
  const { room } = useRoom();
  const { user } = useAuth();
  const [month, setMonth] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");
  const [type, setType] = useState("Shared");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room?.id) return;
    const ref = collection(db, "rooms", room.id, "events");
    const unsub = onSnapshot(ref, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [room?.id]);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const raw = eachDayOfInterval({ start, end });
    const pad = getDay(start);
    const padded = new Array(pad).fill(null).concat(raw);
    return padded;
  }, [month]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!e.date) return;
      map[e.date] = map[e.date] || [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const openForDay = (d) => {
    const dateStr = format(d, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setIsOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!room?.id || !user) return;
    if (!title.trim()) return toast.error("Title is required");
    setLoading(true);
    try {
      await addDoc(collection(db, "rooms", room.id, "events"), {
        title: title.trim(),
        date: selectedDate,
        time,
        type,
        color,
        createdBy: user.uid,
      });
      toast.success("Event added");
      setIsOpen(false);
      setTitle("");
      setTime("12:00");
      setType("Shared");
      setColor(COLORS[0]);
    } catch (err) {
      toast.error(err?.message || "Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Calendar"
        subtitle="Shared reminders and events"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>
              Prev
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
              Next
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">{format(month, "MMMM yyyy")}</h2>
          <p className="text-xs text-white/40">Click a day to add</p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map((d) => (
            <div key={d} className="text-xs text-white/40 text-center py-1">
              {d}
            </div>
          ))}
          {days.map((d, idx) => {
            if (!d) return <div key={idx} className="h-20" />;
            const dateStr = format(d, "yyyy-MM-dd");
            const ev = eventsByDate[dateStr] || [];
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => openForDay(d)}
                className="h-20 glass-card p-2 text-left hover:shadow-glow transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">{format(d, "d")}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {ev.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="w-2 h-2 rounded-full"
                      style={{ background: e.color || COLORS[0] }}
                      title={e.title}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Event" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {["Personal", "Shared", "Reminder"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  type === t ? "border-primary-500/40 bg-primary-500/20 text-white" : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            <p className="text-sm text-white/70 font-medium mb-2">Color</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border ${color === c ? "border-white" : "border-white/10"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
