import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Today from './pages/Today'
import Habits from './pages/Habits'
import Errands from './pages/Errands'
import Tasks from './pages/Tasks'
import { useStore } from './lib/store'

export default function App() {
  const { initialize, initialized } = useStore()

  useEffect(() => {
    initialize()
  }, [])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/errands" element={<Errands />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  )
}
