import Badge from "../ui/Badge";

export default function StatusBadge({ status }) {
  const map = {
    pending: { variant: "warning", label: "Pending" },
    done: { variant: "success", label: "Done" },
    missed: { variant: "danger", label: "Missed" },
  };
  const def = map[status] || { variant: "default", label: status };
  return <Badge variant={def.variant}>{def.label}</Badge>;
}
