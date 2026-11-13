import { useState } from 'react'
import { useHealthData } from '../../health/useHealthData'
import SettingsSection from './SettingsSection'

const TOGGLES = [
  { key: 'notify_alerts', label: 'Alert notifications', hint: 'Show a notice when a reading falls outside its typical range.' },
  { key: 'notify_reminders', label: 'Measurement reminders', hint: 'Remind me to record my readings regularly.' },
]

export default function NotificationToggles() {
  const { profile, saveProfile } = useHealthData()
  const [error, setError] = useState(null)

  const toggle = async (key) => {
    setError(null)
    const ok = await saveProfile({ [key]: !profile[key] })
    if (!ok) setError('We could not update that preference. Try again.')
  }

  return (
    <SettingsSection title="Notifications" description="Choose which alerts and reminders you receive.">
      <ul className="flex flex-col divide-y divide-space-800">
        {TOGGLES.map(({ key, label, hint }) => (
          <li key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-ink-100">{label}</p>
              <p className="text-xs text-ink-500">{hint}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(profile?.[key])}
              aria-label={label}
              onClick={() => toggle(key)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${profile?.[key] ? 'bg-cyan-400' : 'bg-space-700'}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 left-0 rounded-full bg-white shadow transition-transform ${
                  profile?.[key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="mt-3 text-sm text-rose-400">{error}</p>}
    </SettingsSection>
  )
}
