import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "@/lib/store";
import { ChoreForm } from "../ChoreForm/ChoreForm";

const RECURRENCE_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function recurrenceLabel(value) {
  if (!value) return null;
  if (RECURRENCE_LABELS[value]) return RECURRENCE_LABELS[value];
  if (value.startsWith("custom:")) {
    const [, n, unit] = value.split(":");
    return `Every ${n} ${unit}`;
  }
  return null;
}

export function ChoreItem({ chore }) {
  const { completeChore, updateChore, deleteChore, chore_lists } =
    useStore();
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chore.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const list = chore_lists.find((l) => l.id === chore.list_id);

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-center gap-3 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-gray-300 dark:text-gray-700 hover:text-gray-400 shrink-0"
        >
          <GripIcon />
        </button>

        <button
          onClick={() => completeChore(chore.id)}
          className="shrink-0 w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
        />

        <div className="flex-1 min-w-0">
          <span className="text-sm block truncate">{chore.name}</span>
          <p className="text-xs text-gray-400 mt-0.5 flex gap-2 flex-wrap">
            {list && (
              <span className="text-indigo-500 dark:text-indigo-400">
                {list.name}
              </span>
            )}
            {chore.recurrence && (
              <span>{recurrenceLabel(chore.recurrence)}</span>
            )}
            {chore.alarm_time && (
              <span className="inline-flex items-center gap-0.5">
                <BellIcon />
                {formatTime(chore.alarm_time)}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="text-gray-300 hover:text-indigo-500"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => deleteChore(chore.id)}
            className="text-gray-300 hover:text-red-500"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md mx-4 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-semibold">Edit Chore</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <ChoreForm
              initialValues={chore}
              onSubmit={(patch) => {
                updateChore(chore.id, patch);
                setShowEditModal(false);
              }}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-3 h-3 inline"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
