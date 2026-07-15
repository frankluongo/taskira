import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Today from "@/pages/Today";
import Habits from "@/pages/Habits";
import Chores from "@/pages/Chores";
import KitchenSink from "@/pages/KitchenSink";
import Tasks from "@/pages/Tasks";
import Login from "@/pages/Login";
import { useStore } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/auth";
import {
  requestNotificationPermission,
  rescheduleAllChoreNotifications,
  rescheduleAllHabitNotifications,
  rescheduleAllTaskNotifications,
} from "@/lib/notifications";
import { Spinner } from "@/base";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (user === undefined) {
    return <Spinner />;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { initialize, initialized, chores, habits, tasks } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) initialize();
  }, [user]);

  useEffect(() => {
    if (!initialized) return;
    requestNotificationPermission().then(() => {
      rescheduleAllChoreNotifications(chores);
      rescheduleAllHabitNotifications(habits);
      rescheduleAllTaskNotifications(tasks);
    });
  }, [initialized]);

  if (user && !initialized) {
    return <Spinner />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Today />
          </ProtectedRoute>
        }
      />
      <Route
        path="/habits"
        element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chores"
        element={
          <ProtectedRoute>
            <Chores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kitchen-sink"
        element={
          <ProtectedRoute>
            <KitchenSink />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
