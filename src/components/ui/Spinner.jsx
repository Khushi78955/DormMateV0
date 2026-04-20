export default function Spinner({ fullScreen = false, size = "md" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  const el = (
    <div
      className={`${sizes[size]} border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin`}
    />
  );
  if (fullScreen)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-900/80 backdrop-blur-sm z-50">
        {el}
      </div>
    );
  return <div className="flex justify-center items-center p-4">{el}</div>;
}
