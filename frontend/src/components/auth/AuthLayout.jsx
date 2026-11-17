import { Activity } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute end-4 top-4 z-50 max-w-[calc(100vw-2rem)]">
        <LanguageSwitcher menuPosition="bottom" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center">
            <img src="/favicon.png" alt="AstroCare" className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.65)]" />
          </div>
          <p className="font-display text-sm uppercase tracking-[0.25em] text-cyan-300">AstroCare</p>
        </div>

        <div className="animate-fade-up rounded-3xl border border-space-700 bg-space-900/80 p-8 shadow-2xl shadow-black/40">
          <h1 className="font-display text-2xl font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-300">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-ink-300">{footer}</div>}
      </div>
    </div>
  )
}
