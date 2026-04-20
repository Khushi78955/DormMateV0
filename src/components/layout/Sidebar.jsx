import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdAccountBalanceWallet,
  MdBuild,
  MdCalendarToday,
  MdCleaningServices,
  MdDashboard,
  MdFastfood,
  MdMood,
  MdPeople,
  MdPoll,
  MdShoppingCart,
  MdVolumeOff,
} from "react-icons/md";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useRoom } from "../../context/RoomContext";
import { logoutUser } from "../../services/authService";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { room } = useRoom();

  const nav = useMemo(
    () => [
      {
        section: "MAIN",
        items: [
          { label: "Dashboard", path: "/", icon: MdDashboard },
          {
            label: "Expenses",
            path: "/expenses",
            icon: MdAccountBalanceWallet,
          },
          { label: "Chores", path: "/chores", icon: MdCleaningServices },
          { label: "Shopping", path: "/shopping", icon: MdShoppingCart },
          { label: "Food Order", path: "/food", icon: MdFastfood },
          { label: "Maintenance", path: "/maintenance", icon: MdBuild },
          { label: "Noise Tracker", path: "/noise", icon: MdVolumeOff },
          { label: "Attendance", path: "/attendance", icon: MdPeople },
        ],
      },
      {
        section: "ADVANCED",
        items: [
          { label: "Room Mood", path: "/mood", icon: MdMood },
          { label: "Calendar", path: "/calendar", icon: MdCalendarToday },
          { label: "Polls", path: "/polls", icon: MdPoll },
        ],
      },
    ],
    []
  );

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const copyJoinCode = async () => {
    if (!room?.joinCode) return;
    await navigator.clipboard.writeText(room.joinCode);
    toast.success("Join code copied!");
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[260px] p-4 flex-col gap-4">
      <div className="glass-card p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-display font-bold text-lg neon-text">DormMate</span>
        </div>
        {room && (
          <div className="mt-4">
            <p className="text-white font-semibold leading-tight">{room.roomName}</p>
            <button
              onClick={copyJoinCode}
              className="mt-2 inline-flex items-center gap-2 text-xs text-white/70 hover:text-white"
            >
              <Badge variant="primary">{room.joinCode}</Badge>
              <span className="text-white/40">(copy)</span>
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-3 flex-1 overflow-y-auto">
        {nav.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="px-3 py-2 text-xs text-white/40 font-semibold">{group.section}</p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-3 flex items-center gap-3">
        <Avatar name={profile?.displayName || ""} src={profile?.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{profile?.displayName || ""}</p>
          <p className="text-xs text-white/40 truncate">{profile?.email || ""}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
