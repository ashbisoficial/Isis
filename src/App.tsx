import { Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import Widget from './routes/Widget'
import Settings from './routes/Settings'
import Login from './routes/Login'
import Educacion from './modules/Educacion'
import Entrenamiento from './modules/Entrenamiento'
import Alimentacion from './modules/Alimentacion'
import Hobbies from './modules/Hobbies'
import Deberes from './modules/Deberes'
import Viajes from './modules/Viajes'
import { useNotificationEngine } from './store/useNotificationEngine'
import { useAuth, firebaseConfigured } from './store/AuthContext'

function App() {
  const { user, loading } = useAuth()

  if (firebaseConfigured && loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-white/40">Cargando...</p>
      </div>
    )
  }

  if (firebaseConfigured && !user) {
    return <Login />
  }

  return <AppRoutes />
}

function AppRoutes() {
  useNotificationEngine()

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/widget" element={<Widget />} />
      <Route path="/ajustes" element={<Settings />} />
      <Route path="/educacion" element={<Educacion />} />
      <Route path="/entrenamiento" element={<Entrenamiento />} />
      <Route path="/alimentacion" element={<Alimentacion />} />
      <Route path="/hobbies" element={<Hobbies />} />
      <Route path="/deberes" element={<Deberes />} />
      <Route path="/viajes" element={<Viajes />} />
    </Routes>
  )
}

export default App
