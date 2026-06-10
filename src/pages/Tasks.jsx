import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import Layout from '../components/layout/Layout'
import TaskItem from '../components/tasks/TaskItem'
import TaskForm from '../components/tasks/TaskForm'
import { useStore, INBOX_PROJECT_ID } from '../lib/store'

export default function Tasks() {
  const { tasks, projects, addTask, addProject, reorderTasks } = useStore()
  const [activeProject, setActiveProject] = useState('all')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const topLevelTasks = tasks
    .filter((t) => !t.parent_task_id)
    .filter((t) => activeProject === 'all' || t.project_id === activeProject)
    .sort((a, b) => b.priority - a.priority || a.sort_order - b.sort_order)

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = topLevelTasks.findIndex((t) => t.id === active.id)
    const newIdx = topLevelTasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(topLevelTasks, oldIdx, newIdx).map((t, i) => ({ ...t, sort_order: i }))
    reorderTasks(tasks.map((t) => reordered.find((r) => r.id === t.id) || t))
  }

  return (
    <Layout
      title="Tasks"
      action={
        <button
          onClick={() => { const name = prompt('Project name?'); if (name) addProject(name) }}
          className="text-sm text-indigo-600 dark:text-indigo-400"
        >
          + Project
        </button>
      }
    >
      {/* Project filter tabs */}
      <div className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4 scrollbar-none">
        <ProjectTab label="All" active={activeProject === 'all'} onClick={() => setActiveProject('all')} />
        {projects.map((p) => (
          <ProjectTab key={p.id} label={p.name} active={activeProject === p.id} onClick={() => setActiveProject(p.id)} />
        ))}
      </div>

      {/* Task list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={topLevelTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topLevelTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                subtasks={tasks.filter((t) => t.parent_task_id === task.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {topLevelTasks.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-12">No tasks. Add one below.</p>
      )}

      {/* Add task form */}
      <div className="mt-4">
        <AddTaskForm projects={projects} activeProject={activeProject} onAdd={addTask} />
      </div>
    </Layout>
  )
}

function ProjectTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      }`}
    >
      {label}
    </button>
  )
}

function AddTaskForm({ projects, activeProject, onAdd }) {
  const defaultProjectId = activeProject !== 'all' ? activeProject : INBOX_PROJECT_ID
  return (
    <TaskForm
      projects={projects}
      initialValues={{ priority: 3, project_id: defaultProjectId }}
      onSubmit={onAdd}
      submitLabel="Add Task"
    />
  )
}
