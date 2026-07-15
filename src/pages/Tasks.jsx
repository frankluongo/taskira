import { useState, useRef } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { getTodayString } from "@/lib/date";
import { DragContext, TaskItem, TaskForm, Layout } from "@/features";
import { useStore, INBOX_PROJECT_ID } from "@/lib/store";
import {
  Button,
  Float,
  IconCalendar,
  IconDrag,
  IconPlus,
  Input,
  List,
  Modal,
  Scroller,
} from "@/base";
import css from "./Tasks.module.css";

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
        <div className={css.actions}>
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
        <List>
          {topLevelTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              subtasks={tasks.filter((t) => t.parent_task_id === task.id)}
              dragMode={dragMode}
            />
          ))}
        </List>
      </DragContext>

      {topLevelTasks.length === 0 && (
        <p className={css.empty}>No tasks yet.</p>
      )}

      {/* Rename project modal */}
      <Modal
        open={!!renamingProject}
        onClose={() => setRenamingProject(null)}
        title="Rename Project"
      >
        <form onSubmit={handleRenameSubmit} className={css.renameForm}>
          <Input
            autoFocus
            id="project-rename"
            name="project-rename"
            label="Project name"
            showLabel={false}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Project name"
          />
          <Button type="submit" variant="primary">
            Save
          </Button>
        </form>
      </Modal>

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
