import { useState } from 'react'

const GROUPS = ['AM', 'Misc', 'PM']

const RECURRENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'specific_days', label: 'Specific days' },
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function HabitForm({ initialValues = {}, onSubmit, submitLabel = 'Save' }) {
  const [name, setName] = useState(initialValues.name ?? '')
  const [group, setGroup] = useState(initialValues.group_name ?? 'AM')
  const [recurrence, setRecurrence] = useState(initialValues.recurrence ?? 'daily')
  const [days, setDays] = useState(initialValues.recurrence_days ?? [])
  const [alarmTime, setAlarmTime] = useState(initialValues.alarm_time ?? '')
  const [startDate, setStartDate] = useState(initialValues.start_date ?? '')
  const [endDate, setEndDate] = useState(initialValues.end_date ?? '')

  function toggleDay(d) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit({
      name: trimmed,
      group_name: group,
      recurrence,
      recurrence_days: recurrence === 'specific_days' ? days : [],
      alarm_time: alarmTime || null,
      start_date: startDate || null,
      end_date: endDate || null,
    })
    setName(initialValues.name ?? '')
    setGroup(initialValues.group_name ?? 'AM')
    setRecurrence(initialValues.recurrence ?? 'daily')
    setDays(initialValues.recurrence_days ?? [])
    setAlarmTime(initialValues.alarm_time ?? '')
    setStartDate(initialValues.start_date ?? '')
    setEndDate(initialValues.end_date ?? '')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name…"
        className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500 w-full"
      />
      <div className="flex gap-2">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="flex-1 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
        >
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="flex-1 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
        >
          {RECURRENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {recurrence === 'specific_days' && (
        <div className="flex gap-1">
          {DAY_LABELS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                days.includes(i) ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Alarm</label>
          <input
            type="time"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            className="w-full text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}
