import { useState } from "react";
import { useStore } from "@/lib/store";
import { Form, FieldsRow, Input, Select } from "@/base";

function parseRecurrence(value) {
  if (!value)
    return { recurrence: "", customInterval: "3", customUnit: "months" };
  if (value.startsWith("custom:")) {
    const [, n, unit] = value.split(":");
    return { recurrence: "custom", customInterval: n, customUnit: unit };
  }
  return { recurrence: value, customInterval: "3", customUnit: "months" };
}

export function ChoreForm({
  initialValues = {},
  onSubmit,
  submitLabel = "Save",
  onAddList,
}) {
  const { chore_lists } = useStore();
  const parsed = parseRecurrence(initialValues.recurrence);

  const [name, setName] = useState(initialValues.name ?? "");
  const [listId, setListId] = useState(initialValues.list_id ?? "");
  const [dueDate, setDueDate] = useState(initialValues.due_date ?? "");
  const [recurrence, setRecurrence] = useState(parsed.recurrence);
  const [customInterval, setCustomInterval] = useState(parsed.customInterval);
  const [customUnit, setCustomUnit] = useState(parsed.customUnit);
  const [alarmTime, setAlarmTime] = useState(initialValues.alarm_time ?? "");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    let recurrenceValue = recurrence || null;
    if (recurrence === "custom") {
      const n = parseInt(customInterval, 10);
      recurrenceValue = n > 0 ? `custom:${n}:${customUnit}` : null;
    }
    onSubmit({
      name: trimmed,
      list_id: listId || null,
      due_date: dueDate || null,
      recurrence: recurrenceValue,
      recurrence_day: null,
      alarm_time: alarmTime || null,
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Chore name…"
        id="chore-name"
        name="chore-name"
        showLabel={false}
      />
      <FieldsRow>
        <Select
          value={listId}
          onChange={(e) => setListId(e.target.value)}
          id="chore-list"
          name="chore-list"
          label="List"
        >
          <option value="">No list</option>
          {chore_lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <Select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          id="chore-recurrence"
          name="chore-recurrence"
          label="Recurrence"
        >
          <option value="">No recurrence</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom…</option>
        </Select>
      </FieldsRow>
      {recurrence === "custom" && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">Every</span>
          <input
            type="number"
            min="1"
            value={customInterval}
            onChange={(e) => setCustomInterval(e.target.value)}
            className="w-20 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      )}
      <FieldsRow variant="wrap">
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          id="chore-due-date"
          name="chore-due-date"
          label="Due date"
        />
        <Input
          type="time"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
          id="chore-alarm-time"
          name="chore-alarm-time"
          label="Alarm time"
        />
      </FieldsRow>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {submitLabel}
        </button>
        {onAddList && (
          <button
            type="button"
            onClick={() => {
              const n = prompt("List name?");
              if (n) onAddList(n);
            }}
            className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          >
            + List
          </button>
        )}
      </div>
    </Form>
  );
}
