import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[#0f0f16]/95 px-4 py-3 backdrop-blur">
      <button
        onClick={() => navigate('/')}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg text-white/70 active:bg-white/10"
        aria-label="Volver al inicio"
      >
        ←
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="truncate text-xs text-white/50">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className}`}>{children}</div>
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-violet-600 text-white active:bg-violet-700',
  secondary: 'bg-white/10 text-white active:bg-white/20',
  ghost: 'bg-transparent text-white/70 active:bg-white/5',
  danger: 'bg-red-600/20 text-red-300 active:bg-red-600/30',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-40 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function IconTile({ to, emoji, label, color }: { to: string; emoji: string; label: string; color: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 p-4 text-center active:scale-95 transition"
      style={{ background: color }}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-medium text-white">{label}</span>
    </Link>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-white/60">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-400'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function Checkbox({ checked, onChange, label, strike = true }: { checked: boolean; onChange: () => void; label: string; strike?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 shrink-0 rounded border-white/20 bg-white/5 accent-violet-600"
      />
      <span className={`text-sm text-white ${checked && strike ? 'text-white/40 line-through' : ''}`}>{label}</span>
    </label>
  )
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">{text}</p>
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'urgent' | 'ok' }) {
  const tones = {
    default: 'bg-white/10 text-white/70',
    urgent: 'bg-red-500/20 text-red-300',
    ok: 'bg-emerald-500/20 text-emerald-300',
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
