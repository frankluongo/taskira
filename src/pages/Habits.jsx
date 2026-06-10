import { useState } from "react";
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
import Layout from "../components/layout/Layout";
import HabitItem from "../components/habits/HabitItem";
import HabitForm from "../components/habits/HabitForm";
import { useStore } from "../lib/store";

const GROUPS = ["AM", "Misc", "PM"];

export default function Habits() {
  const { habits, addHabit, reorderHabits, isHabitDoneToday } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(group, { active, over }) {
    if (!over || active.id === over.id) return;
    const groupHabits = habits.filter((h) => h.group_name === group);
    const oldIdx = groupHabits.findIndex((h) => h.id === active.id);
    const newIdx = groupHabits.findIndex((h) => h.id === over.id);
    const reordered = arrayMove(groupHabits, oldIdx, newIdx).map((h, i) => ({
      ...h,
      sort_order: i,
    }));
    reorderHabits(habits.map((h) => reordered.find((r) => r.id === h.id) || h));
  }

  return (
    <Layout
      title="Habits"
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCompleted((x) => !x)}
            className="text-sm text-gray-400 dark:text-gray-500"
          >
            {showCompleted ? "Hide done" : "Show done"}
          </button>
          <button
            onClick={() => setShowForm((x) => !x)}
            className="text-sm text-indigo-600 dark:text-indigo-400"
          >
            {showForm ? "Cancel" : "+ Habit"}
          </button>
        </div>
      }
    >
      {showForm && (
        <AddHabitForm
          onAdd={(habit) => {
            addHabit(habit);
            setShowForm(false);
          }}
        />
      )}

      {GROUPS.map((group) => {
        const allGroupHabits = habits
          .filter((h) => h.group_name === group)
          .sort((a, b) => a.sort_order - b.sort_order);
        if (allGroupHabits.length === 0 && !showForm) return null;
        const visibleHabits = showCompleted
          ? allGroupHabits
          : allGroupHabits.filter((h) => !isHabitDoneToday(h.id));
        const isCollapsed = collapsed[group];
        return (
          <section key={group} className="mt-6">
            <button
              onClick={() => setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }))}
              className="flex items-center gap-1 w-full text-left mb-2"
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group}
              </h2>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`w-3 h-3 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {!isCollapsed && (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(group, e)}
                >
                  <SortableContext
                    items={visibleHabits.map((h) => h.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {visibleHabits.map((habit) => (
                        <HabitItem key={habit.id} habit={habit} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {visibleHabits.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    All {group} habits done!
                  </p>
                )}
              </>
            )}
          </section>
        );
      })}
    </Layout>
  );
}

function AddHabitForm({ onAdd }) {
  return (
    <div className="mt-4">
      <HabitForm onSubmit={onAdd} submitLabel="Add Habit" />
    </div>
  )
}
