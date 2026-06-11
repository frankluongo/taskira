import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Today from '@/pages/Today'
import Habits from '@/pages/Habits'
import Errands from '@/pages/Errands'
import Tasks from '@/pages/Tasks'
import Login from '@/pages/Login'
import { useStore } from '@/lib/store'
import { AuthProvider, useAuth } from '@/lib/auth'
import {
  requestNotificationPermission,
  rescheduleAllErrandNotifications,
  rescheduleAllHabitNotifications,
  rescheduleAllTaskNotifications,
} from '@/lib/notifications'

function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user === null) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  const { initialize, initialized, errands, habits, tasks } = useStore()
  const { user } = useAuth()

  useEffect(() => {
    if (user) initialize()
  }, [user])

  useEffect(() => {
    if (!initialized) return
    requestNotificationPermission().then(() => {
      rescheduleAllErrandNotifications(errands)
      rescheduleAllHabitNotifications(habits)
      rescheduleAllTaskNotifications(tasks)
    })
  }, [initialized])

  if (user && !initialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Today /></ProtectedRoute>} />
      <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
      <Route path="/errands" element={<ProtectedRoute><Errands /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
