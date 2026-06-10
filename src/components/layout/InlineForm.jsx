import { useState } from 'react'

export default function InlineForm({ placeholder = 'Add item…', onSubmit, className = '' }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors">
        Add
      </button>
    </form>
  )
}
