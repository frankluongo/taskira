# Suggested Path Forward

Based on your answers, here is the recommended architecture, tech stack, and database schema.

---

## Summary of Key Constraints

- Personal app (no auth, no multi-user)
- Targets: browser, Mac desktop, iOS
- Needs real device push notifications (rules out browser-only)
- Needs cross-device sync (Mac ↔ iPhone)
- Preferred: web technologies

---

## Recommended Tech Stack

### Frontend: React (Vite)

Web technologies you already know, fast dev experience, massive ecosystem. No framework lock-in.

### Cross-Platform Wrapper: Capacitor

Capacitor takes your React web app and packages it as a real native iOS app and a Mac app — no rewrite, no separate codebase. This is the key piece that unlocks real push notifications on iOS (via APNs) and a proper Mac desktop app, while keeping everything in HTML/JS/CSS.

> **One catch:** publishing a native iOS app (even for personal use) requires an Apple Developer account ($99/yr). Without it, you can sideload onto your own iPhone via Xcode for free, which is perfectly fine for a personal app.

### Backend & Sync: Supabase

Supabase gives you a hosted Postgres database, a real-time sync layer, a REST API, and a JavaScript SDK — all free on the hobby tier. It is the fastest path to cross-device sync with no custom server to maintain.

### Push Notifications: Capacitor Push Notifications + Supabase Edge Functions

The Capacitor Push Notifications plugin handles registering with APNs on iOS and Mac. A small Supabase Edge Function (serverless, runs in the cloud) fires the notification at the scheduled alarm time.

### Summary Table

| Concern            | Choice                                       | Why                                  |
| ------------------ | -------------------------------------------- | ------------------------------------ |
| UI                 | React + Vite                                 | Web tech you know                    |
| iOS + Mac app      | Capacitor                                    | One codebase, real native shell      |
| Data sync          | Supabase (Postgres)                          | Free, real-time, no server to run    |
| Push notifications | Capacitor + APNs via Supabase Edge Functions | Required for iOS                     |
| Styling            | Tailwind CSS                                 | Utility-first, pairs well with React |

---

## Alternative Stack (simpler, no native app)

If you want to skip the Apple Developer account and Capacitor build step entirely, a PWA (Progressive Web App) works in the browser and on Mac — but iOS push notifications on PWAs require iOS 16.4+ and Safari, and the support is still inconsistent. Only go this route if push notifications on iPhone are not critical.

---

## Database Schema

Designed for Postgres (Supabase). All tables use UUIDs and `created_at` timestamps.

### Habits

```sql
CREATE TABLE habits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  group_name      TEXT NOT NULL CHECK (group_name IN ('AM', 'PM', 'Misc')) DEFAULT 'Misc',
  recurrence      TEXT NOT NULL CHECK (recurrence IN (
                    'daily', 'every_other_day', 'weekdays', 'weekends', 'specific_days'
                  )),
  recurrence_days INT[],         -- [0..6] day-of-week array, used when recurrence = 'specific_days'
  alarm_time      TIME,
  start_date      DATE,
  end_date        DATE,
  sort_order      INT,           -- drag-and-drop position within group
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- One row per habit per day it was completed. Reset logic is "no row today = not done."
CREATE TABLE habit_completions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_on DATE NOT NULL,
  UNIQUE (habit_id, completed_on)
);
```

### Errands

```sql
CREATE TABLE errand_lists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE errands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  list_id         UUID REFERENCES errand_lists(id) ON DELETE SET NULL,
  alarm_time      TIME,
  due_date        DATE,          -- NULL = "Someday"
  recurrence      TEXT CHECK (recurrence IN ('weekly', 'monthly', 'yearly')),
  recurrence_day  INT,           -- day-of-week (0–6) for weekly; day-of-month (1–31) for monthly; ignored for yearly
  sort_order      INT,           -- drag-and-drop within section
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

When a recurring errand is checked off, the app deletes the current row and inserts a new one with `due_date` advanced by the recurrence interval.

### Tasks

```sql
CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: INSERT INTO projects (name) VALUES ('Inbox');

CREATE TABLE tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- NULL = top-level task
  priority       INT NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  due_date       DATE,
  alarm_time     TIME,
  sort_order     INT,            -- drag-and-drop position
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

---

## Priority Labels

| Value | Label    | Display |
| ----- | -------- | ------- |
| 5     | Critical | Red     |
| 4     | High     | Orange  |
| 3     | Medium   | Yellow  |
| 2     | Low      | Blue    |
| 1     | Someday  | Grey    |

---

## App Structure (Pages / Routes)

```
/ (Today Dashboard)
  ├── Today's habits not yet completed
  ├── Errands due today
  └── Tasks due today (sorted by priority)

/habits
  ├── AM group
  ├── PM group
  └── Misc group

/errands
  ├── Today
  ├── Tomorrow
  ├── Later (next 5 upcoming)
  └── Someday (no date, sorted by created_at ASC)

/tasks
  ├── Filter: All Projects | [Project Name]
  └── Sorted by priority DESC, then created_at ASC
```

Bottom tab bar: **Today | Habits | Errands | Tasks**

---

## Midnight Reset (Habits)

A Supabase Edge Function runs on a cron schedule at 00:00 local time. Because habits reset via "no completion row for today," no deletion is needed — the UI simply queries `habit_completions` for `completed_on = today` and hides anything that has a row. At midnight, `today` rolls over and all habits reappear automatically.

---

## Recommended Build Order

1. **Supabase project setup** — create tables, seed Inbox project
2. **React app scaffold** — Vite + React + Tailwind + Supabase JS client
3. **Tasks page** — simplest data model, good proof-of-concept
4. **Habits page** — add completion logic and midnight reset
5. **Errands page** — add recurrence + auto-generate next occurrence
6. **Today dashboard** — aggregate view, pull from all three tables
7. **Capacitor integration** — wrap for iOS + Mac
8. **Push notifications** — Supabase Edge Function scheduler + APNs

---

## Open Questions

_Do you want a dedicated management screen for editing/deleting habits, errands, and tasks (separate from the main views), or should editing happen inline / via a modal?_

Editing can happen inline

_For the Today dashboard, when a habit/errand/task is checked off there, should it also disappear from its dedicated page immediately?_

Yes
