import { PANEL_CLASS } from '../ui/fieldStyles'

export default function SettingsSection({ title, description, children }) {
  return (
    <section className={`${PANEL_CLASS} grid gap-5 lg:grid-cols-12`}>
      <div className="lg:col-span-4">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>
      <div className="lg:col-span-8">{children}</div>
    </section>
  )
}
