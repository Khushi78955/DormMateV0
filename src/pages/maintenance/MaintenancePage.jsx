import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import TextArea from "../../components/ui/TextArea";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { addMaintenanceRequest, subscribeMaintenance } from "../../services/maintenanceService";
import { MAINTENANCE_CATEGORIES } from "../../utils/constants";
import MaintenanceCard from "./MaintenanceCard";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "RESOLVED", label: "Resolved" },
];

export default function MaintenancePage() {
  const { room } = useRoom();
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState(MAINTENANCE_CATEGORIES[0]?.id || "other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeMaintenance(room.id, setItems);
    return unsub;
  }, [room?.id]);

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter((i) => i.status === active);
  }, [items, active]);

  const categoryOptions = useMemo(
    () => MAINTENANCE_CATEGORIES.map((c) => ({ value: c.id, label: `${c.icon} ${c.label}` })),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room?.id || !user) return;
    if (!title.trim()) return toast.error("Title is required");
    setLoading(true);
    try {
      await addMaintenanceRequest(room.id, {
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
        reportedBy: user.uid,
        reportedByName: profile?.displayName || "",
      });
      toast.success("Issue reported");
      setIsOpen(false);
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setCategory(MAINTENANCE_CATEGORIES[0]?.id || "other");
    } catch (err) {
      toast.error(err?.message || "Failed to report issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Maintenance"
        subtitle="Report issues and track fixes"
        action={<Button onClick={() => setIsOpen(true)}>+ Report Issue</Button>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={active === t.id ? "primary" : "secondary"}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {active === "all" ? (
          ["PENDING", "IN_PROGRESS", "RESOLVED"].map((status) => (
            <Card key={status} className="min-h-[200px]">
              <h2 className="section-title mb-3">{status.replace("_", " ")}</h2>
              <div className="flex flex-col gap-3">
                {items
                  .filter((i) => i.status === status)
                  .map((i) => (
                    <MaintenanceCard key={i.id} item={i} room={room} />
                  ))}
                {items.filter((i) => i.status === status).length === 0 ? (
                  <p className="text-white/40 text-sm">No items.</p>
                ) : null}
              </div>
            </Card>
          ))
        ) : (
          <div className="md:col-span-3 flex flex-col gap-3">
            {filtered.length === 0 ? (
              <Card>
                <p className="text-white/40">No items found.</p>
              </Card>
            ) : (
              filtered.map((i) => <MaintenanceCard key={i.id} item={i} room={room} />)
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Report Maintenance Issue" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />
          <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <p className="text-sm text-white/70 font-medium mb-2">Priority</p>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    priority === p
                      ? "border-primary-500/40 bg-primary-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
