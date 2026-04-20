import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { addShoppingItem, subscribeShoppingList } from "../../services/shoppingService";
import { SHOPPING_CATEGORIES } from "../../utils/constants";
import { clamp } from "../../utils/helpers";
import ShoppingItem from "./ShoppingItem";

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  ...SHOPPING_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

export default function ShoppingPage() {
  const { room } = useRoom();
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(SHOPPING_CATEGORIES[0]?.id || "food");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeShoppingList(room.id, setItems);
    return unsub;
  }, [room?.id]);

  const filtered = useMemo(() => {
    let list = items;
    if (activeCategory !== "all") list = list.filter((i) => i.category === activeCategory);
    const pending = list.filter((i) => !i.bought);
    const bought = list.filter((i) => i.bought);
    return pending.concat(bought);
  }, [items, activeCategory]);

  const progress = useMemo(() => {
    const total = items.length;
    const bought = items.filter((i) => i.bought).length;
    const pct = total ? Math.round((bought / total) * 100) : 0;
    return { total, bought, pct: clamp(pct, 0, 100) };
  }, [items]);

  const categoryOptions = useMemo(
    () => SHOPPING_CATEGORIES.map((c) => ({ value: c.id, label: `${c.icon} ${c.label}` })),
    []
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!room?.id || !user) return;
    if (!name.trim()) return toast.error("Item name is required");
    setLoading(true);
    try {
      await addShoppingItem(room.id, {
        name: name.trim(),
        category,
        addedBy: user.uid,
        addedByName: profile?.displayName || "",
      });
      setName("");
      toast.success("Added");
    } catch (err) {
      toast.error(err?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader title="Shopping" subtitle="Shared shopping list" />

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/70 text-sm">
            {progress.bought} of {progress.total} items bought
          </p>
          <p className="text-white/40 text-sm">{progress.pct}%</p>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-brand transition-all duration-300"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_TABS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={activeCategory === t.id ? "primary" : "secondary"}
            onClick={() => setActiveCategory(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <Card className="mb-4">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <Input
            className="md:col-span-3"
            label="Item"
            placeholder="Add an item…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            className="md:col-span-1"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />
          <Button className="md:col-span-1" type="submit" loading={loading}>
            Add
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-white/40">No items yet.</p>
          </Card>
        ) : (
          filtered.map((item) => <ShoppingItem key={item.id} item={item} room={room} />)
        )}
      </div>
    </PageWrapper>
  );
}
