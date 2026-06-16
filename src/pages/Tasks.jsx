import { useState, useRef } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { getTodayString } from "@/lib/date";
import Layout from "@/components/layout/Layout";
import { DragContext, TaskItem, TaskForm } from "@/features";
import { useStore, INBOX_PROJECT_ID } from "@/lib/store";
import { Button, Float, IconCalendar, IconDrag, IconPlus, Modal, Scroller } from "@/base";

export default function Tasks() {
  const { tasks, projects, addTask, reorderTasks, updateProject } = useStore();
  const [activeProject, setActiveProject] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterToday, setFilterToday] = useState(false);
  const [renamingProject, setRenamingProject] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [dragMode, setDragMode] = useState(false);

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
          <Button
            aria-label="Toggle filter today"
            aria-pressed={filterToday}
            onClick={() => setFilterToday((x) => !x)}
            variant="icon slim secondary"
            title="Toggle today filter"
          >
            <IconCalendar />
          </Button>
          <Button
            aria-label="Toggle drag mode"
            aria-pressed={dragMode}
            onClick={() => setDragMode((x) => !x)}
            variant="icon slim secondary"
            title="Toggle drag mode"
          >
            <IconDrag />
          </Button>
        </div>
      }
    >
      {/* Project filter tabs — hidden when Today filter is active */}
      {!filterToday && (
        <Scroller style={{ flex: "0 0 auto" }}>
          <li>
            <ProjectTab
              label="All"
              active={activeProject === "all"}
              onClick={() => setActiveProject("all")}
            />
          </li>
          {projects.map((p) => (
            <li key={p.id}>
              <ProjectTab
                label={p.name}
                active={activeProject === p.id}
                onClick={() => setActiveProject(p.id)}
                onLongPress={() => openRename(p)}
              />
            </li>
          ))}
        </Scroller>
      )}

      {/* Task list */}
      <DragContext items={topLevelTasks} onDragEnd={handleDragEnd}>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {topLevelTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              subtasks={tasks.filter((t) => t.parent_task_id === task.id)}
              dragMode={dragMode}
            />
          ))}
        </div>
      </DragContext>

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
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Task"
      >
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
      </Modal>
      <Float>
        <Button
          variant="icon"
          aria-expanded={showAddModal}
          aria-label="Add Task"
          onClick={() => setShowAddModal((x) => !x)}
        >
          <IconPlus />
        </Button>
      </Float>
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
    <Button
      variant="pill"
      aria-pressed={active}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
