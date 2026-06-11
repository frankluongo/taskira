import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { format, addDays } from 'date-fns'
import Layout from '@/components/layout/Layout'
import ErrandItem from '@/components/errands/ErrandItem'
import ErrandForm from '@/components/errands/ErrandForm'
import { useStore } from '@/lib/store'

const fmt = (d) => format(d, 'yyyy-MM-dd')
const todayStr = () => fmt(new Date())
const tomorrowStr = () => fmt(addDays(new Date(), 1))

export default function Errands() {
  const { errands, errand_lists, addErrand, addErrandList, reorderErrands } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [filterToday, setFilterToday] = useState(false)
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterToday((x) => !x)}
            className={`text-sm ${filterToday ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}
          >
            Today
          </button>
          <button onClick={() => setShowForm((x) => !x)} className="text-sm text-indigo-600 dark:text-indigo-400">
            {showForm ? 'Cancel' : '+ Errand'}
          </button>
        </div>
      }
    >
      {showForm && (
        <div className="mt-4">
          <ErrandForm
            onSubmit={(e) => { addErrand(e); setShowForm(false) }}
            submitLabel="Add Errand"
            onAddList={addErrandList}
          />
        </div>
      )}

      <ErrandSection title="Today" items={todayErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(todayErrands, e)} />
      {!filterToday && <ErrandSection title="Tomorrow" items={tomorrowErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(tomorrowErrands, e)} />}
      {!filterToday && <ErrandSection title="Later" items={laterErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(laterErrands, e)} showDate />}
      {!filterToday && <ErrandSection title="Someday" items={somedayErrands} sensors={sensors} onDragEnd={(e) => handleDragEnd(somedayErrands, e)} />}
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
