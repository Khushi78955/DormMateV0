import Avatar from "../ui/Avatar";

export default function RoommateChip({ member }) {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/80">
      <Avatar name={member.displayName} src={member.avatar} size="xs" />
      <span>{member.displayName}</span>
    </div>
  );
}
