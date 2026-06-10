import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../lib/store'
import HabitForm from './HabitForm'

const RECURRENCE_LABELS = {
  daily: 'Daily',
  every_other_day: 'Every other day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  specific_days: 'Specific days',
}

export default function HabitItem({ habit }) {
  const { completeHabit, uncompleteHabit, isHabitDoneToday, updateHabit, deleteHabit } = useStore()
  const [showEditModal, setShowEditModal] = useState(false)
  const done = isHabitDoneToday(habit.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  function toggle() {
    if (done) uncompleteHabit(habit.id)
    else completeHabit(habit.id)
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-center gap-3 py-3">
        <button {...attributes} {...listeners} className="cursor-grab touch-none text-gray-300 dark:text-gray-700 hover:text-gray-400 shrink-0">
          <GripIcon />
        </button>

        <button
          onClick={toggle}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            done ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
          }`}
        >
          {done && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>}
        </button>

        <div className="flex-1 min-w-0">
          <span className={`text-sm block ${done ? 'line-through text-gray-400' : ''}`}>{habit.name}</span>
          <p className="text-xs text-gray-400 mt-0.5">{RECURRENCE_LABELS[habit.recurrence]}</p>
        </div>

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setShowEditModal(true)} className="text-gray-300 hover:text-indigo-500">
            <EditIcon />
          </button>
          <button onClick={() => deleteHabit(habit.id)} className="text-gray-300 hover:text-red-500">
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
              <h2 className="text-base font-semibold">Edit Habit</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <HabitForm
              initialValues={habit}
              onSubmit={(patch) => { updateHabit(habit.id, patch); setShowEditModal(false) }}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
