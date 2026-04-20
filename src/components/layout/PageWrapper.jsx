import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function PageWrapper({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-[260px] flex flex-col">
        <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
