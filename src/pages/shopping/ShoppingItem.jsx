import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { IoTrash } from "react-icons/io5";
import Badge from "../../components/ui/Badge";
import { SHOPPING_CATEGORIES } from "../../utils/constants";
import { deleteShoppingItem, toggleShoppingItem } from "../../services/shoppingService";

function ShoppingItem({ item, room }) {
  const [loading, setLoading] = useState(false);
  const cat = useMemo(
    () => SHOPPING_CATEGORIES.find((c) => c.id === item.category),
    [item.category]
  );

  const handleToggle = async () => {
    if (!room?.id) return;
    setLoading(true);
    try {
      await toggleShoppingItem(room.id, item.id, !item.bought);
    } catch (e) {
      toast.error(e?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!room?.id) return;
    setLoading(true);
    try {
      await deleteShoppingItem(room.id, item.id);
      toast.success("Deleted");
    } catch (e) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 flex items-center justify-between gap-3 ${
        item.bought ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          checked={!!item.bought}
          onChange={handleToggle}
          disabled={loading}
          className="w-5 h-5 accent-[#6c22ff]"
        />
        <div className="min-w-0">
          <p className={`text-white font-semibold truncate ${item.bought ? "line-through" : ""}`}>
            {item.name}
          </p>
          <p className="text-xs text-white/40 truncate">Added by {item.addedByName || "—"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="primary">{cat ? `${cat.icon} ${cat.label}` : item.category}</Badge>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
          title="Delete"
        >
          <IoTrash />
        </button>
      </div>
    </motion.div>
  );
}

export default memo(ShoppingItem);
