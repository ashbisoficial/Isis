import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--border-10)] bg-[var(--bg-95)] px-4 py-3 backdrop-blur">
      <button
        onClick={() => navigate('/')}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-5)] text-lg text-[var(--text-70)] active:bg-[var(--surface-10)]"
        aria-label="Volver al inicio"
      >
        ←
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-[var(--text-100)]">{title}</h1>
        {subtitle && <p className="truncate text-xs text-[var(--text-50)]">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-[var(--border-10)] bg-[var(--surface-3)] p-4 ${className}`}>{children}</div>
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-50)]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-violet-600 text-[var(--text-100)] active:bg-violet-700',
  secondary: 'bg-[var(--surface-10)] text-[var(--text-100)] active:bg-[var(--surface-20)]',
  ghost: 'bg-transparent text-[var(--text-70)] active:bg-[var(--surface-5)]',
  danger: 'bg-red-600/20 text-[var(--danger-text)] active:bg-red-600/30',
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
      className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border-10)] p-4 text-center active:scale-95 transition"
      style={{ background: color }}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-medium text-[var(--text-100)]">{label}</span>
    </Link>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[var(--text-60)]">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-[var(--border-10)] bg-[var(--surface-5)] px-3 py-2 text-sm text-[var(--text-100)] placeholder:text-[var(--text-30)] outline-none focus:border-violet-400'

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
        className="h-5 w-5 shrink-0 rounded border-[var(--border-20)] bg-[var(--surface-5)] accent-violet-600"
      />
      <span className={`text-sm text-[var(--text-100)] ${checked && strike ? 'text-[var(--text-40)] line-through' : ''}`}>{label}</span>
    </label>
  )
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-10)]">
      <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-[var(--border-10)] p-6 text-center text-sm text-[var(--text-40)]">{text}</p>
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'urgent' | 'ok' }) {
  const tones = {
    default: 'bg-[var(--surface-10)] text-[var(--text-70)]',
    urgent: 'bg-red-500/20 text-[var(--danger-text)]',
    ok: 'bg-emerald-500/20 text-[var(--ok-text)]',
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
