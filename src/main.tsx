import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import './index.css'
import App from './App.tsx'
import { DataProvider } from './store/DataContext'

dayjs.locale('es')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
)
