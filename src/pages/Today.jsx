import { getTodayString } from "@/lib/date";
import Layout from "@/components/layout/Layout";
import { useStore, PRIORITY_LABELS } from "@/lib/store";

export default function Today() {
  const {
    habitsDueToday,
    completeHabit,
    errands,
    completeErrand,
    tasks,
    completeTask,
  } = useStore();

  const today = getTodayString();
  const habits = habitsDueToday();
  const todayErrands = errands.filter((e) => e.due_date === today);
  const todayTasks = tasks
    .filter((t) => !t.parent_task_id && t.due_date === today)
    .sort((a, b) => b.priority - a.priority);

  const hasAnything =
    habits.length + todayErrands.length + todayTasks.length > 0;

  return (
    <Layout title={getTodayString("EEEE, MMM d")}>
      {!hasAnything && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <span className="text-4xl">✓</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You&apos;re all caught up for today.
          </p>
        </div>
      )}

      {habits.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Habits
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {habits.map((h) => (
              <div key={h.id} className="flex items-center gap-3 py-3">
                <button
                  onClick={() => completeHabit(h.id)}
                  className="shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors"
                />
                <div>
                  <p className="text-sm">{h.name}</p>
                  <p className="text-xs text-gray-400">{h.group_name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {todayErrands.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Errands
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {todayErrands.map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-3">
                <button
                  onClick={() => completeErrand(e.id)}
                  className="shrink-0 w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors"
                />
                <p className="text-sm">{e.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {todayTasks.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Tasks
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {todayTasks.map((t) => {
              const p = PRIORITY_LABELS[t.priority] || PRIORITY_LABELS[1];
              return (
                <div key={t.id} className="flex items-center gap-3 py-3">
                  <button
                    onClick={() => completeTask(t.id)}
                    className="shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{t.name}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${p.color} ${p.bg}`}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </Layout>
  );
}
