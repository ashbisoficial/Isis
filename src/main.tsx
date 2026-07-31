import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import './index.css'
import App from './App.tsx'
import { DataProvider } from './store/DataContext'
import { AuthProvider } from './store/AuthContext'
import { ThemeProvider } from './store/ThemeContext'

dayjs.locale('es')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
