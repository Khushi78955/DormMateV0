import { clsx } from "clsx";

const variants = {
  default: "bg-white/10 text-white/70",
  primary: "bg-primary-500/20 text-primary-300 border border-primary-500/30",
  success: "bg-green-500/20 text-green-300 border border-green-500/30",
  warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  danger: "bg-red-500/20 text-red-300 border border-red-500/30",
  info: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
};

export default function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
