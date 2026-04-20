import { clsx } from "clsx";

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  required = false,
  icon,
  className = "",
  disabled = false,
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm text-white/70 font-medium">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            "w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30",
            "focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-10",
            error && "border-red-500/50"
          )}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
