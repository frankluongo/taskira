import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../lib/store'

const RECURRENCE_LABELS = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }

export default function ErrandItem({ errand }) {
  const { completeErrand, updateErrand, deleteErrand, errand_lists } = useStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(errand.name)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: errand.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const list = errand_lists.find((l) => l.id === errand.list_id)

  function saveName() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== errand.name) updateErrand(errand.id, { name: trimmed })
    setEditing(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-3 py-3">
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-gray-300 dark:text-gray-700 hover:text-gray-400 shrink-0">
        <GripIcon />
      </button>

      <button
        onClick={() => completeErrand(errand.id)}
        className="shrink-0 w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setName(errand.name); setEditing(false) } }}
            className="w-full bg-transparent text-sm outline-none border-b border-indigo-500 pb-0.5"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm text-left w-full truncate">{errand.name}</button>
        )}
        <div className="flex gap-2 mt-0.5 flex-wrap">
          {list && <span className="text-xs text-indigo-500 dark:text-indigo-400">{list.name}</span>}
          {errand.recurrence && <span className="text-xs text-gray-400">{RECURRENCE_LABELS[errand.recurrence]}</span>}
        </div>
      </div>

      <button onClick={() => deleteErrand(errand.id)} className="shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <TrashIcon />
      </button>
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
