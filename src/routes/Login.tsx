import { useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { Button, Card, Field, Input } from '../components/ui'

const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Prueba de nuevo en un rato.',
}

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password, name)
      } else {
        await signIn(email.trim(), password)
      }
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ''
      setError(ERROR_MESSAGES[code] ?? 'Algo salió mal. Prueba de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Isis</h1>
        <p className="text-sm text-white/50">Tu plan personal, en todos tus dispositivos</p>
      </div>

      <Card className="w-full max-w-sm">
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <Field label="Nombre">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
            </Field>
          )}
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
          </Field>
          <Field label="Contraseña">
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </Field>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? 'Un momento...' : mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}
          </Button>
        </form>
      </Card>

      <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }} className="text-sm text-violet-300">
        {mode === 'signin' ? '¿No tienes cuenta? Crea una' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  )
}
