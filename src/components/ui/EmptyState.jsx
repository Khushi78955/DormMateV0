export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <span className="text-5xl animate-float">{icon}</span>
      <div>
        <h3 className="text-white/80 font-semibold text-lg">{title}</h3>
        {description && <p className="text-white/40 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
