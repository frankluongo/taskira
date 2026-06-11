import { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { getTodayString } from "@/lib/date";
import Layout from "@/components/layout/Layout";
import TaskItem from "@/components/tasks/TaskItem";
import TaskForm from "@/components/tasks/TaskForm";
import { useStore, INBOX_PROJECT_ID } from "@/lib/store";

export default function Tasks() {
  const { tasks, projects, addTask, reorderTasks, updateProject } = useStore();
  const [activeProject, setActiveProject] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterToday, setFilterToday] = useState(false);
  const [renamingProject, setRenamingProject] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const topLevelTasks = tasks
    .filter((t) => !t.parent_task_id)
    .filter((t) =>
      filterToday
        ? t.due_date === getTodayString()
        : activeProject === "all" || t.project_id === activeProject,
    )
    .sort((a, b) => b.priority - a.priority || a.sort_order - b.sort_order);

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIdx = topLevelTasks.findIndex((t) => t.id === active.id);
    const newIdx = topLevelTasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(topLevelTasks, oldIdx, newIdx).map((t, i) => ({
      ...t,
      sort_order: i,
    }));
    reorderTasks(tasks.map((t) => reordered.find((r) => r.id === t.id) || t));
  }

  function handleAddTask(task) {
    addTask(task);
    setShowAddModal(false);
  }

  function openRename(project) {
    setRenamingProject(project);
    setRenameValue(project.name);
  }

  function handleRenameSubmit(e) {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== renamingProject.name) {
      updateProject(renamingProject.id, { name: trimmed });
    }
    setRenamingProject(null);
  }

  return (
    <Layout
      title="Tasks"
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterToday((x) => !x)}
            className={`text-sm ${filterToday ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}
          >
            Today
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-indigo-600 dark:text-indigo-400"
          >
            + Task
          </button>
        </div>
      }
    >
      {/* Project filter tabs — hidden when Today filter is active */}
      {!filterToday && (
        <div className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4 scrollbar-none">
          <ProjectTab
            label="All"
            active={activeProject === "all"}
            onClick={() => setActiveProject("all")}
          />
          {projects.map((p) => (
            <ProjectTab
              key={p.id}
              label={p.name}
              active={activeProject === p.id}
              onClick={() => setActiveProject(p.id)}
              onLongPress={() => openRename(p)}
            />
          ))}
        </div>
      )}

      {/* Task list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topLevelTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
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
        <p className="text-center text-gray-400 text-sm mt-12">No tasks yet.</p>
      )}

      {/* Rename project modal */}
      {renamingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setRenamingProject(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm mx-4 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-semibold">Rename Project</h2>
              <button
                onClick={() => setRenamingProject(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleRenameSubmit}
              className="px-4 pb-4 flex flex-col gap-3"
            >
              <input
                autoFocus
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Project name"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add task modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md mx-4 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-semibold">New Task</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <TaskForm
              projects={projects}
              initialValues={{
                priority: 3,
                project_id:
                  activeProject !== "all" ? activeProject : INBOX_PROJECT_ID,
              }}
              onSubmit={handleAddTask}
              submitLabel="Add Task"
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

function ProjectTab({ label, active, onClick, onLongPress }) {
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);

  function handlePointerDown() {
    if (!onLongPress) return;
    longPressFired.current = false;
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onLongPress();
    }, 500);
  }

  function handlePointerUp() {
    clearTimeout(pressTimer.current);
    pressTimer.current = null;
  }

  function handleClick() {
    if (!longPressFired.current) onClick();
    longPressFired.current = false;
  }

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors select-none ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
      }`}
    >
      {label}
    </button>
  );
}
