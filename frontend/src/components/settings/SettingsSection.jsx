import { PANEL_CLASS } from '../ui/fieldStyles'

export default function SettingsSection({ title, description, children }) {
  return (
    <section className={`${PANEL_CLASS} grid gap-5 lg:grid-cols-12`}>
      <div className="lg:col-span-8">{children}</div>
    </section>
  )
}
