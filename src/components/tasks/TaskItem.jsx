import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore, PRIORITY_LABELS } from '@/lib/store'
import TaskForm from './TaskForm'

export default function TaskItem({ task, subtasks = [] }) {
  const { completeTask, updateTask, deleteTask, addTask, projects } = useStore()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [subtaskName, setSubtaskName] = useState('')
  const [expanded, setExpanded] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const priority = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[1]

  function addSubtask(e) {
    e.preventDefault()
    const trimmed = subtaskName.trim()
    if (!trimmed) return
    addTask({ name: trimmed, project_id: task.project_id, parent_task_id: task.id, priority: 1 })
    setSubtaskName('')
    setShowSubtaskForm(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-start gap-3 py-2">
        {/* drag handle */}
        <button {...attributes} {...listeners} className="mt-1 cursor-grab touch-none text-gray-300 dark:text-gray-700 hover:text-gray-400 shrink-0">
          <GripIcon />
        </button>

        {/* checkbox */}
        <button onClick={() => completeTask(task.id)} className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors" />

        {/* name */}
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{task.name}</span>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${priority.color} ${priority.bg}`}>
              {priority.label}
            </span>
            {task.due_date && (
              <span className="text-xs text-gray-400">{task.due_date}</span>
            )}
            {task.alarm_time && (
              <span className="text-xs text-gray-400 inline-flex items-center gap-0.5">
                <BellIcon />
                {formatTime(task.alarm_time)}
              </span>
            )}
            {subtasks.length > 0 && (
              <button onClick={() => setExpanded((x) => !x)} className="text-xs text-gray-400 hover:text-gray-600">
                {expanded ? '▾' : '▸'} {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <PrioritySelect value={task.priority} onChange={(p) => updateTask(task.id, { priority: p })} />
          <button onClick={() => setShowSubtaskForm((x) => !x)} className="text-gray-400 hover:text-indigo-500 text-xs px-1">+sub</button>
          <button onClick={() => setShowEditModal(true)} className="text-gray-400 hover:text-indigo-500">
            <EditIcon />
          </button>
          <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500">
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* subtask inline form */}
      {showSubtaskForm && (
        <form onSubmit={addSubtask} className="ml-8 flex gap-2 mb-2">
          <input
            autoFocus
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)}
            placeholder="Subtask name…"
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-sm outline-none"
          />
          <button type="submit" className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">Add</button>
          <button type="button" onClick={() => setShowSubtaskForm(false)} className="text-xs px-2 py-1 text-gray-400">Cancel</button>
        </form>
      )}

      {/* subtasks */}
      {expanded && subtasks.map((sub) => (
        <div key={sub.id} className="ml-8 flex items-center gap-3 py-1.5">
          <button onClick={() => completeTask(sub.id)} className="shrink-0 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors" />
          <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{sub.name}</span>
          <button onClick={() => deleteTask(sub.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
            <TrashIcon size={14} />
          </button>
        </div>
      ))}

      {/* edit modal */}
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
              <h2 className="text-base font-semibold">Edit Task</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <TaskForm
              projects={projects}
              initialValues={task}
              onSubmit={(patch) => { updateTask(task.id, patch); setShowEditModal(false) }}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(time) {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 inline">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function PrioritySelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5"
    >
      {[5, 4, 3, 2, 1].map((p) => (
        <option key={p} value={p}>{PRIORITY_LABELS[p].label}</option>
      ))}
    </select>
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

function TrashIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: size, height: size }}>
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function EditIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: size, height: size }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
