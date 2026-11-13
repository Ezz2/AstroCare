import { useState } from 'react'
import { useHealthData } from '../../health/useHealthData'
import { SECONDARY_BUTTON_CLASS } from '../ui/fieldStyles'
import SettingsSection from './SettingsSection'

export default function DataControls() {
  const { readings, removeSimulatedReadings } = useHealthData()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const simulatedCount = readings.filter((r) => r.source === 'simulated').length

  const handleRemove = async () => {
    if (!window.confirm(`Remove ${simulatedCount} demonstration reading${simulatedCount === 1 ? '' : 's'}? Your own entries are kept.`)) return
    setBusy(true)
    const ok = await removeSimulatedReadings()
    setBusy(false)
    setFeedback(ok ? { type: 'success', text: 'Demonstration readings removed.' } : { type: 'error', text: 'We could not remove them. Try again.' })
  }

  return (
    <SettingsSection title="Data" description="Demonstration readings are generated for this prototype and are labeled wherever they appear.">
      <div className="flex flex-col gap-4 rounded-xl border border-space-700 bg-space-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-100">Demonstration readings</p>
          <p className="text-xs text-ink-500">
            {simulatedCount} stored. These are simulated values, not medical records.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy || simulatedCount === 0}
          className={`${SECONDARY_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {busy ? 'Removing...' : 'Remove demonstration data'}
        </button>
      </div>
      {feedback && (
        <p role="status" className={`mt-3 text-sm ${feedback.type === 'success' ? 'text-teal-400' : 'text-rose-400'}`}>
          {feedback.text}
        </p>
      )}
    </SettingsSection>
  )
}
