import { useState } from "react";

export default function Tooltip({ children, text }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && text && (
        <span className="absolute z-50 -top-2 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 rounded-lg text-xs bg-surface-700 border border-white/10 text-white/80 whitespace-nowrap shadow-card">
          {text}
        </span>
      )}
    </span>
  );
}
