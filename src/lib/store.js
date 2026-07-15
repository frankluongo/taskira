import { create } from 'zustand'
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns'
import { supabase } from './supabase'
import {
  scheduleChoreNotification, cancelChoreNotification,
  scheduleHabitNotification, cancelHabitNotification,
  scheduleTaskNotification, cancelTaskNotification,
} from './notifications'

export const INBOX_PROJECT_ID = '00000000-0000-0000-0000-000000000001'

const today = () => format(new Date(), 'yyyy-MM-dd')

function nextRecurrenceDate(chore) {
  const base = new Date(chore.due_date)
  switch (chore.recurrence) {
    case 'weekly':  return format(addWeeks(base, 1), 'yyyy-MM-dd')
    case 'monthly': return format(addMonths(base, 1), 'yyyy-MM-dd')
    case 'yearly':  return format(addYears(base, 1), 'yyyy-MM-dd')
    default: {
      if (chore.recurrence?.startsWith('custom:')) {
        const [, n, unit] = chore.recurrence.split(':')
        const count = parseInt(n, 10)
        if (unit === 'days')   return format(addDays(base, count), 'yyyy-MM-dd')
        if (unit === 'weeks')  return format(addWeeks(base, count), 'yyyy-MM-dd')
        if (unit === 'months') return format(addMonths(base, count), 'yyyy-MM-dd')
        if (unit === 'years')  return format(addYears(base, count), 'yyyy-MM-dd')
      }
      return null
    }
  }
}

export const useStore = create((set, get) => ({
  habits: [],
  habit_completions: [],
  chore_lists: [],
  chores: [],
  projects: [],
  tasks: [],
  initialized: false,

  initialize: async () => {
    const [
      { data: habits },
      { data: habit_completions },
      { data: chore_lists },
      { data: chores },
      { data: projects },
      { data: tasks },
    ] = await Promise.all([
      supabase.from('habits').select('*').order('sort_order'),
      supabase.from('habit_completions').select('*').eq('completed_on', today()),
      supabase.from('chore_lists').select('*').order('sort_order'),
      supabase.from('chores').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('tasks').select('*').order('sort_order'),
    ])
    set({
      habits: habits || [],
      habit_completions: habit_completions || [],
      chore_lists: chore_lists || [],
      chores: chores || [],
      projects: projects || [],
      tasks: tasks || [],
      initialized: true,
    })
  },

  // ── Habits ──────────────────────────────────────────────────────────
  addHabit: async (habit) => {
    const row = { id: crypto.randomUUID(), sort_order: get().habits.length, ...habit }
    set((s) => ({ habits: [...s.habits, row] }))
    await supabase.from('habits').insert(row)
    scheduleHabitNotification(row)
  },

  updateHabit: async (id, patch) => {
    set((s) => ({ habits: s.habits.map((h) => h.id === id ? { ...h, ...patch } : h) }))
    await supabase.from('habits').update(patch).eq('id', id)
    const updated = get().habits.find((h) => h.id === id)
    if (updated) {
      await cancelHabitNotification(id)
      scheduleHabitNotification(updated)
    }
  },

  deleteHabit: async (id) => {
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      habit_completions: s.habit_completions.filter((c) => c.habit_id !== id),
    }))
    await supabase.from('habits').delete().eq('id', id)
    cancelHabitNotification(id)
  },

  reorderHabits: async (ordered) => {
    set({ habits: ordered })
    await Promise.all(ordered.map((h) => supabase.from('habits').update({ sort_order: h.sort_order }).eq('id', h.id)))
  },

  completeHabit: async (habit_id) => {
    const date = today()
    if (get().habit_completions.some((c) => c.habit_id === habit_id && c.completed_on === date)) return
    const row = { id: crypto.randomUUID(), habit_id, completed_on: date }
    set((s) => ({ habit_completions: [...s.habit_completions, row] }))
    await supabase.from('habit_completions').insert(row)
  },

  uncompleteHabit: async (habit_id) => {
    const date = today()
    set((s) => ({ habit_completions: s.habit_completions.filter((c) => !(c.habit_id === habit_id && c.completed_on === date)) }))
    await supabase.from('habit_completions').delete().eq('habit_id', habit_id).eq('completed_on', date)
  },

  isHabitDoneToday: (habit_id) =>
    get().habit_completions.some((c) => c.habit_id === habit_id && c.completed_on === today()),

  habitsDueToday: () => {
    const { habits, habit_completions } = get()
    const d = today()
    const dow = new Date().getDay()
    return habits.filter((h) => {
      if (habit_completions.some((c) => c.habit_id === h.id && c.completed_on === d)) return false
      if (h.start_date && h.start_date > d) return false
      if (h.end_date && h.end_date < d) return false
      if (h.recurrence === 'daily') return true
      if (h.recurrence === 'weekdays') return dow >= 1 && dow <= 5
      if (h.recurrence === 'weekends') return dow === 0 || dow === 6
      if (h.recurrence === 'every_other_day') return true
      if (h.recurrence === 'specific_days') return h.recurrence_days?.includes(dow)
      return true
    })
  },

  // ── Chore Lists ─────────────────────────────────────────────────────
  addChoreList: async (name) => {
    const row = { id: crypto.randomUUID(), name, sort_order: get().chore_lists.length }
    set((s) => ({ chore_lists: [...s.chore_lists, row] }))
    await supabase.from('chore_lists').insert(row)
  },

  deleteChoreList: async (id) => {
    set((s) => ({ chore_lists: s.chore_lists.filter((l) => l.id !== id) }))
    await supabase.from('chore_lists').delete().eq('id', id)
  },

  // ── Chores ───────────────────────────────────────────────────────────
  addChore: async (chore) => {
    const row = { id: crypto.randomUUID(), sort_order: get().chores.length, created_at: new Date().toISOString(), ...chore }
    set((s) => ({ chores: [...s.chores, row] }))
    await supabase.from('chores').insert(row)
    scheduleChoreNotification(row)
  },

  updateChore: async (id, patch) => {
    set((s) => ({ chores: s.chores.map((e) => e.id === id ? { ...e, ...patch } : e) }))
    await supabase.from('chores').update(patch).eq('id', id)
    const updated = get().chores.find((e) => e.id === id)
    if (updated) {
      await cancelChoreNotification(id)
      scheduleChoreNotification(updated)
    }
  },

  deleteChore: async (id) => {
    set((s) => ({ chores: s.chores.filter((e) => e.id !== id) }))
    await supabase.from('chores').delete().eq('id', id)
    cancelChoreNotification(id)
  },

  reorderChores: async (ordered) => {
    set({ chores: ordered })
    await Promise.all(ordered.map((e) => supabase.from('chores').update({ sort_order: e.sort_order }).eq('id', e.id)))
  },

  completeChore: async (id) => {
    const chore = get().chores.find((e) => e.id === id)
    if (!chore) return
    if (chore.recurrence && chore.due_date) {
      const nextDate = nextRecurrenceDate(chore)
      set((s) => ({ chores: s.chores.map((e) => e.id === id ? { ...e, due_date: nextDate } : e) }))
      await supabase.from('chores').update({ due_date: nextDate }).eq('id', id)
      await cancelChoreNotification(id)
      const updated = get().chores.find((e) => e.id === id)
      if (updated) scheduleChoreNotification(updated)
    } else {
      set((s) => ({ chores: s.chores.filter((e) => e.id !== id) }))
      await supabase.from('chores').delete().eq('id', id)
      cancelChoreNotification(id)
    }
  },

  // ── Projects ──────────────────────────────────────────────────────────
  addProject: async (name) => {
    const row = { id: crypto.randomUUID(), name, sort_order: get().projects.length }
    set((s) => ({ projects: [...s.projects, row] }))
    await supabase.from('projects').insert(row)
  },

  updateProject: async (id, patch) => {
    set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...patch } : p) }))
    await supabase.from('projects').update(patch).eq('id', id)
  },

  deleteProject: async (id) => {
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.map((t) => t.project_id === id ? { ...t, project_id: INBOX_PROJECT_ID } : t),
    }))
    await supabase.from('projects').delete().eq('id', id)
  },

  // ── Tasks ─────────────────────────────────────────────────────────────
  addTask: async (task) => {
    const row = { id: crypto.randomUUID(), sort_order: get().tasks.length, parent_task_id: null, ...task }
    set((s) => ({ tasks: [...s.tasks, row] }))
    await supabase.from('tasks').insert(row)
    scheduleTaskNotification(row)
  },

  updateTask: async (id, patch) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) }))
    await supabase.from('tasks').update(patch).eq('id', id)
    const updated = get().tasks.find((t) => t.id === id)
    if (updated) {
      await cancelTaskNotification(id)
      scheduleTaskNotification(updated)
    }
  },

  deleteTask: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id && t.parent_task_id !== id) }))
    await supabase.from('tasks').delete().eq('id', id)
    cancelTaskNotification(id)
  },

  reorderTasks: async (ordered) => {
    set({ tasks: ordered })
    await Promise.all(ordered.map((t) => supabase.from('tasks').update({ sort_order: t.sort_order }).eq('id', t.id)))
  },

  completeTask: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id && t.parent_task_id !== id) }))
    await supabase.from('tasks').delete().eq('id', id)
    cancelTaskNotification(id)
  },
}))

export const PRIORITY_LABELS = {
  5: { label: 'Critical' },
  4: { label: 'High' },
  3: { label: 'Medium' },
  2: { label: 'Low' },
  1: { label: 'Someday' },
}
