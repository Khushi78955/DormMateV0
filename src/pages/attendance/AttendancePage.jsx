import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { subscribeAttendance, updateAttendance } from "../../services/attendanceService";
import { ATTENDANCE_STATUSES } from "../../utils/constants";
import { formatRelative } from "../../utils/formatters";

const statusMeta = (id) => ATTENDANCE_STATUSES.find((s) => s.id === id) || ATTENDANCE_STATUSES[0];

export default function AttendancePage() {
  const { room } = useRoom();
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!room?.id) return;
    const unsub = subscribeAttendance(room.id, setAttendance);
    return unsub;
  }, [room?.id]);

  const members = room?.members || [];

  const requestUpdate = (status) => {
    if (!room?.id || !user?.uid) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await updateAttendance(room.id, user.uid, status);
        toast.success("Updated");
      } catch (e) {
        toast.error(e?.message || "Failed to update");
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  const cards = useMemo(
    () =>
      members.map((m) => {
        const rec = attendance?.[m.uid];
        const meta = statusMeta(rec?.status || "hostel");
        return { member: m, rec, meta };
      }),
    [members, attendance]
  );

  return (
    <PageWrapper>
      <PageHeader title="Attendance" subtitle="See where everyone is" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(({ member, rec, meta }) => {
          const isMe = member.uid === user?.uid;
          return (
            <Card key={member.uid} className="p-4">
              <div className="flex flex-col items-center text-center">
                <Avatar name={member.displayName} src={member.avatar} size="lg" className="mb-2" />
                <p className="text-white font-semibold">{member.displayName}</p>
                <p className={`mt-1 text-sm ${meta.color}`}>{meta.icon} {meta.label}</p>
                {rec?.updatedAt ? (
                  <p className="text-xs text-white/40 mt-1">Updated {formatRelative(rec.updatedAt)}</p>
                ) : (
                  <p className="text-xs text-white/40 mt-1">No updates yet</p>
                )}

                {isMe ? (
                  <div className="mt-4 w-full">
                    <Badge variant="primary">Your status</Badge>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center">
                      {ATTENDANCE_STATUSES.map((s) => (
                        <Button
                          key={s.id}
                          size="sm"
                          variant={rec?.status === s.id ? "primary" : "secondary"}
                          onClick={() => requestUpdate(s.id)}
                          disabled={saving}
                        >
                          {s.icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </PageWrapper>
  );
}
