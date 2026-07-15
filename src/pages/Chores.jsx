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
import { ChoreForm, ChoreItem, Layout } from "@/features";
import { useStore } from "@/lib/store";
import { Button, Float, IconPlus, List, Modal, Section } from "@/base";
import css from "./Chores.module.css";

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

  const overdueChores = chores
    .filter((e) => e.due_date && e.due_date < today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
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
        <div className={css.actions}>
          <button
            onClick={() => setFilterToday((x) => !x)}
            className={`${css.filterToggle} ${filterToday ? css.active : ""}`}
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
        title="Overdue"
        items={overdueChores}
        sensors={sensors}
        onDragEnd={(e) => handleDragEnd(overdueChores, e)}
        showDate
      />
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
    <Section title={title}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <List>
            {items.map((chore) => (
              <div key={chore.id}>
                {showDate && <p className={css.date}>{chore.due_date}</p>}
                <ChoreItem chore={chore} />
              </div>
            ))}
          </List>
        </SortableContext>
      </DndContext>
    </Section>
  );
}
