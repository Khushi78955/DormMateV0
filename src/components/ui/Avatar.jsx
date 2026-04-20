import { getInitials } from "../../utils/formatters";

const COLORS = [
  "from-purple-500 to-indigo-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-amber-500",
];

export default function Avatar({ name = "", src, size = "md", className = "" }) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-primary-500/30 ${className}`}
      />
    );
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-glow-sm flex-shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
