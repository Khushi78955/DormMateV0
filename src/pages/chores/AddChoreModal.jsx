import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import TextArea from "../../components/ui/TextArea";
import Button from "../../components/ui/Button";
import { useRoom } from "../../context/RoomContext";
import { addChore } from "../../services/choreService";
import { CHORE_TYPES } from "../../utils/constants";

const todayISODate = () => new Date().toISOString().slice(0, 10);

export default function AddChoreModal({ isOpen, onClose }) {
  const { room } = useRoom();
  const [type, setType] = useState(CHORE_TYPES[0]?.id || "cleaning");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState(todayISODate());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const memberOptions = useMemo(
    () => (room?.members || []).map((m) => ({ value: m.uid, label: m.displayName })),
    [room?.members]
  );

  const typeOptions = useMemo(
    () => CHORE_TYPES.map((c) => ({ value: c.id, label: `${c.icon} ${c.label}` })),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room?.id) return;
    if (!assignedTo) return toast.error("Assign the chore to someone");
    setLoading(true);
    try {
      await addChore(room.id, {
        type,
        assignedTo,
        dueDate,
        notes: notes.trim(),
      });
      toast.success("Chore added");
      onClose();
      setNotes("");
      setDueDate(todayISODate());
    } catch (err) {
      toast.error(err?.message || "Failed to add chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Chore" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Chore Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={typeOptions}
        />
        <Select
          label="Assigned To"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          options={[{ value: "", label: "Select roommate" }, ...memberOptions]}
        />
        <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <TextArea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add
          </Button>
        </div>
      </form>
    </Modal>
  );
}
