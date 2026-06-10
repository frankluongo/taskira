/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        priority: {
          1: '#9ca3af',
          2: '#3b82f6',
          3: '#eab308',
          4: '#f97316',
          5: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
