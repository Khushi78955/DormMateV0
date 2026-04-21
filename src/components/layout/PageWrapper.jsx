import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useRoom } from "../../context/RoomContext";
import Spinner from "../ui/Spinner";

export default function PageWrapper({ children }) {
  const { loading: roomLoading } = useRoom();

  return (
    <div className="flex min-h-screen relative">
      <Sidebar />
      <div className="flex-1 md:ml-[260px] flex flex-col">
        <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
      </div>
      <MobileNav />

      {roomLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-surface-800/90 border border-white/10 p-6 text-center shadow-xl">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-white/80">Loading room data…</p>
          </div>
        </div>
      )}
    </div>
  );
}
