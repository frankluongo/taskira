import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { isTauri } from '@tauri-apps/api/core'
import './index.css'
import App from './App'

if (isTauri()) {
  document.documentElement.classList.add('desktop-app')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
