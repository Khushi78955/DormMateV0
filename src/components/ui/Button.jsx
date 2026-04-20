import { clsx } from "clsx";
import Spinner from "./Spinner";

const variants = {
  primary: "bg-gradient-brand text-white shadow-glow hover:opacity-90",
  secondary:
    "bg-white/5 border border-white/10 text-white hover:bg-white/10",
  ghost: "text-white/70 hover:text-white hover:bg-white/5",
  danger:
    "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? <Spinner size="sm" /> : icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
