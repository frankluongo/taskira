import { useState } from 'react'
import { INBOX_PROJECT_ID } from '../../lib/store'

export default function TaskForm({ projects, initialValues = {}, onSubmit, submitLabel = 'Save' }) {
  const [name, setName] = useState(initialValues.name ?? '')
  const [priority, setPriority] = useState(initialValues.priority ?? 3)
  const [projectId, setProjectId] = useState(initialValues.project_id ?? INBOX_PROJECT_ID)
  const [dueDate, setDueDate] = useState(initialValues.due_date ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit({ name: trimmed, priority, project_id: projectId, due_date: dueDate || null })
    setName(initialValues.name ?? '')
    setPriority(initialValues.priority ?? 3)
    setProjectId(initialValues.project_id ?? INBOX_PROJECT_ID)
    setDueDate(initialValues.due_date ?? '')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Task name…"
        className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
      />
      <div className="flex gap-2 flex-wrap">
        <select
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
        >
          {[5, 4, 3, 2, 1].map((p) => (
            <option key={p} value={p}>{['', 'Someday', 'Low', 'Medium', 'High', 'Critical'][p]}</option>
          ))}
        </select>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2"
        />
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
