// main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './style.css'
import App from './App.tsx'

// ✅ Session active flag — refresh detect karne ke liye
sessionStorage.setItem("sv_active", "true"); // "pv_active" → "sv_active" fix

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/servicevendor">
      <App />
    </BrowserRouter>
  </StrictMode>,
)