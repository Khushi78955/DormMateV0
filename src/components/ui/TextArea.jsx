import { clsx } from "clsx";

export default function TextArea({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  rows = 4,
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm text-white/70 font-medium">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          "w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30",
          "focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30 transition-all"
        )}
      />
    </div>
  );
}
