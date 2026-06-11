import { useState } from 'react'
import { useStore } from '@/lib/store'

function parseRecurrence(value) {
  if (!value) return { recurrence: '', customInterval: '3', customUnit: 'months' }
  if (value.startsWith('custom:')) {
    const [, n, unit] = value.split(':')
    return { recurrence: 'custom', customInterval: n, customUnit: unit }
  }
  return { recurrence: value, customInterval: '3', customUnit: 'months' }
}

export default function ErrandForm({ initialValues = {}, onSubmit, submitLabel = 'Save', onAddList }) {
  const { errand_lists } = useStore()
  const parsed = parseRecurrence(initialValues.recurrence)

  const [name, setName] = useState(initialValues.name ?? '')
  const [listId, setListId] = useState(initialValues.list_id ?? '')
  const [dueDate, setDueDate] = useState(initialValues.due_date ?? '')
  const [recurrence, setRecurrence] = useState(parsed.recurrence)
  const [customInterval, setCustomInterval] = useState(parsed.customInterval)
  const [customUnit, setCustomUnit] = useState(parsed.customUnit)
  const [alarmTime, setAlarmTime] = useState(initialValues.alarm_time ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    let recurrenceValue = recurrence || null
    if (recurrence === 'custom') {
      const n = parseInt(customInterval, 10)
      recurrenceValue = n > 0 ? `custom:${n}:${customUnit}` : null
    }
    onSubmit({
      name: trimmed,
      list_id: listId || null,
      due_date: dueDate || null,
      recurrence: recurrenceValue,
      recurrence_day: null,
      alarm_time: alarmTime || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Errand name…"
        className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
      />
      <div className="flex gap-2 flex-wrap">
        <select value={listId} onChange={(e) => setListId(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2">
          <option value="">No list</option>
          {errand_lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2">
          <option value="">No recurrence</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom…</option>
        </select>
      </div>
      {recurrence === 'custom' && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">Every</span>
          <input
            type="number"
            min="1"
            value={customInterval}
            onChange={(e) => setCustomInterval(e.target.value)}
            className="w-20 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
          />
          <select value={customUnit} onChange={(e) => setCustomUnit(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2">
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      )}
      <div className="flex gap-2">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2" />
        <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          {submitLabel}
        </button>
        {onAddList && (
          <button
            type="button"
            onClick={() => { const n = prompt('List name?'); if (n) onAddList(n) }}
            className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          >
            + List
          </button>
        )}
      </div>
    </form>
  )
}
