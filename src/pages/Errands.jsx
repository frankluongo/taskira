import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { format, addDays } from 'date-fns'
import Layout from '../components/layout/Layout'
import ErrandItem from '../components/errands/ErrandItem'
import { useStore } from '../lib/store'

const fmt = (d) => format(d, 'yyyy-MM-dd')
const todayStr = () => fmt(new Date())
const tomorrowStr = () => fmt(addDays(new Date(), 1))

export default function Errands() {
  const { errands, errand_lists, addErrand, addErrandList, reorderErrands } = useStore()
  const [showForm, setShowForm] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const today = todayStr()
  const tomorrow = tomorrowStr()

  const todayErrands = errands.filter((e) => e.due_date === today).sort((a, b) => a.sort_order - b.sort_order)
  const tomorrowErrands = errands.filter((e) => e.due_date === tomorrow).sort((a, b) => a.sort_order - b.sort_order)
  const laterErrands = errands
    .filter((e) => e.due_date && e.due_date > tomorrow)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5)
  const somedayErrands = errands.filter((e) => !e.due_date).sort((a, b) => a.created_at > b.created_at ? 1 : -1)

  function handleDragEnd(subset, { active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = subset.findIndex((e) => e.id === active.id)
    const newIdx = subset.findIndex((e) => e.id === over.id)
    const reordered = arrayMove(subset, oldIdx, newIdx).map((e, i) => ({ ...e, sort_order: i }))
    reorderErrands(errands.map((e) => reordered.find((r) => r.id === e.id) || e))
  }

  return (
    <Layout
      title="Errands"
      action={
        <button onClick={() => setShowForm((x) => !x)} className="text-sm text-indigo-600 dark:text-indigo-400">
          {showForm ? 'Cancel' : '+ Errand'}
        </button>
      }
    >
      {showForm && (
        <AddErrandForm
          lists={errand_lists}
          onAdd={(e) => { addErrand(e); setShowForm(false) }}
          onAddList={addErrandList}
        />
      )}

      <ErrandSection title="Today" items={todayErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(todayErrands, e)} />
      <ErrandSection title="Tomorrow" items={tomorrowErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(tomorrowErrands, e)} />
      <ErrandSection title="Later" items={laterErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(laterErrands, e)} showDate />
      <ErrandSection title="Someday" items={somedayErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(somedayErrands, e)} />
    </Layout>
  )
}

function ErrandSection({ title, items, sensors, onDragEnd, showDate }) {
  if (items.length === 0) return null
  return (
    <section className="mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((errand) => (
              <div key={errand.id}>
                {showDate && <p className="text-xs text-gray-400 pt-2">{errand.due_date}</p>}
                <ErrandItem errand={errand} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}

function AddErrandForm({ lists, onAdd, onAddList }) {
  const [name, setName] = useState('')
  const [listId, setListId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState('')
  const [alarmTime, setAlarmTime] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({
      name: trimmed,
      list_id: listId || null,
      due_date: dueDate || null,
      recurrence: recurrence || null,
      recurrence_day: null,
      alarm_time: alarmTime || null,
    })
    setName('')
    setDueDate('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3 mt-4">
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
          {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2">
          <option value="">No recurrence</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2" />
        <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          Add Errand
        </button>
        <button
          type="button"
          onClick={() => { const n = prompt('List name?'); if (n) onAddList(n) }}
          className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          + List
        </button>
      </div>
    </form>
  )
}
