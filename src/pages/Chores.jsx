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
import { format, addDays } from "date-fns";
import Layout from "@/components/layout/Layout";
import { ChoreForm, ChoreItem } from "@/features";
import { useStore } from "@/lib/store";
import { Button, Float, IconPlus, Modal } from "@/base";

const fmt = (d) => format(d, "yyyy-MM-dd");
const todayStr = () => fmt(new Date());
const tomorrowStr = () => fmt(addDays(new Date(), 1));

export default function Chores() {
  const { chores, chore_lists, addChore, addChoreList, reorderChores } =
    useStore();
  const [showForm, setShowForm] = useState(false);
  const [filterToday, setFilterToday] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const today = todayStr();
  const tomorrow = tomorrowStr();

  const todayChores = chores
    .filter((e) => e.due_date === today)
    .sort((a, b) => a.sort_order - b.sort_order);
  const tomorrowChores = chores
    .filter((e) => e.due_date === tomorrow)
    .sort((a, b) => a.sort_order - b.sort_order);
  const laterChores = chores
    .filter((e) => e.due_date && e.due_date > tomorrow)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);
  const somedayChores = chores
    .filter((e) => !e.due_date)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

  function handleDragEnd(subset, { active, over }) {
    if (!over || active.id === over.id) return;
    const oldIdx = subset.findIndex((e) => e.id === active.id);
    const newIdx = subset.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(subset, oldIdx, newIdx).map((e, i) => ({
      ...e,
      sort_order: i,
    }));
    reorderChores(
      chores.map((e) => reordered.find((r) => r.id === e.id) || e),
    );
  }

  return (
    <Layout
      title="Chores"
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterToday((x) => !x)}
            className={`text-sm ${filterToday ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}
          >
            Today
          </button>
        </div>
      }
    >
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Chore"
      >
        <ChoreForm
          onSubmit={(e) => {
            addChore(e);
            setShowForm(false);
          }}
          submitLabel="Add Chore"
          onAddList={addChoreList}
        />
      </Modal>

      <ChoreSection
        title="Today"
        items={todayChores}
        sensors={sensors}
        onDragEnd={(e) => handleDragEnd(todayChores, e)}
      />
      {!filterToday && (
        <ChoreSection
          title="Tomorrow"
          items={tomorrowChores}
          sensors={sensors}
          onDragEnd={(e) => handleDragEnd(tomorrowChores, e)}
        />
      )}
      {!filterToday && (
        <ChoreSection
          title="Later"
          items={laterChores}
          sensors={sensors}
          onDragEnd={(e) => handleDragEnd(laterChores, e)}
          showDate
        />
      )}
      {!filterToday && (
        <ChoreSection
          title="Someday"
          items={somedayChores}
          sensors={sensors}
          onDragEnd={(e) => handleDragEnd(somedayChores, e)}
        />
      )}
      <Float>
        <Button variant="icon" onClick={() => setShowForm((x) => !x)}>
          <IconPlus />
        </Button>
      </Float>
    </Layout>
  );
}

function ChoreSection({ title, items, sensors, onDragEnd, showDate }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {title}
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((chore) => (
              <div key={chore.id}>
                {showDate && (
                  <p className="text-xs text-gray-400 pt-2">
                    {chore.due_date}
                  </p>
                )}
                <ChoreItem chore={chore} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
