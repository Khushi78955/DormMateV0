import { useLocation, useNavigate } from "react-router-dom";
import {
  MdAccountBalanceWallet,
  MdCleaningServices,
  MdDashboard,
  MdFastfood,
  MdShoppingCart,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

const items = [
  { path: "/", icon: MdDashboard, label: "Home" },
  { path: "/expenses", icon: MdAccountBalanceWallet, label: "Expenses" },
  { path: "/chores", icon: MdCleaningServices, label: "Chores" },
  { path: "/shopping", icon: MdShoppingCart, label: "Shopping" },
  { path: "/food", icon: MdFastfood, label: "Food" },
];

export default function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3">
      <div className="glass-card flex items-center justify-between px-4 py-2">
        {items.map((item) => {
          const active =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-2 rounded-xl transition-all ${
                active ? "text-primary-300 bg-primary-500/15" : "text-white/50"
              }`}
              aria-label={item.label}
            >
              <Icon size={22} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
