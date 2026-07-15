import { getTodayString } from "@/lib/date";
import { useStore } from "@/lib/store";
import { List, Section, ToggleButton } from "@/base";
import { Layout, PriorityBadge } from "@/features";
import css from "./Today.module.css";

export default function Today() {
  const {
    habitsDueToday,
    completeHabit,
    chores,
    completeChore,
    tasks,
    completeTask,
  } = useStore();

  const today = getTodayString();
  const habits = habitsDueToday();
  const todayChores = chores.filter((e) => e.due_date === today);
  const todayTasks = tasks
    .filter((t) => !t.parent_task_id && t.due_date === today)
    .sort((a, b) => b.priority - a.priority);

  const hasAnything =
    habits.length + todayChores.length + todayTasks.length > 0;

  return (
    <Layout title={getTodayString("EEEE, MMM d")}>
      {!hasAnything && (
        <div className={css.empty}>
          <span className={css.emptyIcon}>✓</span>
          <p className={css.emptyText}>
            You&apos;re all caught up for today.
          </p>
        </div>
      )}

      {habits.length > 0 && (
        <Section title="Habits">
          <List>
            {habits.map((h) => (
              <div key={h.id} className={css.row}>
                <ToggleButton onClick={() => completeHabit(h.id)} />
                <div>
                  <p className={css.name}>{h.name}</p>
                  <p className={css.meta}>{h.group_name}</p>
                </div>
              </div>
            ))}
          </List>
        </Section>
      )}

      {todayChores.length > 0 && (
        <Section title="Chores">
          <List>
            {todayChores.map((e) => (
              <div key={e.id} className={css.row}>
                <ToggleButton
                  variant="square"
                  onClick={() => completeChore(e.id)}
                />
                <p className={css.name}>{e.name}</p>
              </div>
            ))}
          </List>
        </Section>
      )}

      {todayTasks.length > 0 && (
        <Section title="Tasks">
          <List>
            {todayTasks.map((t) => (
              <div key={t.id} className={css.row}>
                <ToggleButton variant="md" onClick={() => completeTask(t.id)} />
                <div className={css.body}>
                  <p className={css.taskName}>{t.name}</p>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
          </List>
        </Section>
      )}
    </Layout>
  );
}
