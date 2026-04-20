import { clsx } from "clsx";

export default function Card({ children, className = "", glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass-card p-5 transition-all duration-300",
        glow && "hover:shadow-glow hover:border-primary-500/30",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
