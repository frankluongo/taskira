import BottomNav from './BottomNav'
import { supabase } from '../../lib/supabase'

export default function Layout({ title, action, children }) {
  function handleLogout() {
    supabase.auth.signOut()
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pt-safe pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-3">
          {action && <div>{action}</div>}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-20 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
