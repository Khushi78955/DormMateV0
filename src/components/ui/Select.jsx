import { clsx } from "clsx";

export default function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  className = "",
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm text-white/70 font-medium">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-2.5 text-white",
          "focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30 transition-all"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
