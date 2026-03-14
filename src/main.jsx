import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Глобальное подавление логов для чистоты консоли
if (import.meta.env.PROD || true) { // Включаем "true" если пользователь хочет скрыть их везде
  console.log = () => { };
  console.info = () => { };
  console.warn = () => { };
  // Оставляем console.error только для критических системных сбоев, либо тоже скрываем
  // console.error = () => {}; 
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
