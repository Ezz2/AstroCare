import { useState } from 'react'
import { useHealthData } from '../../health/useHealthData'
import { SECONDARY_BUTTON_CLASS } from '../ui/fieldStyles'
import SettingsSection from './SettingsSection'
import useLanguage from '../../i18n/useLanguage'

export default function DataControls() {
  const { t } = useLanguage()
  const { readings, removeSimulatedReadings } = useHealthData()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const simulatedCount = readings.filter((r) => r.source === 'simulated').length

  const handleRemove = async () => {
    if (!window.confirm(t("Remove {count} demonstration reading{plural}? Your own entries are kept.", { count: simulatedCount, plural: simulatedCount === 1 ? "" : "s" }))) return
    setBusy(true)
    const ok = await removeSimulatedReadings()
    setBusy(false)
    setFeedback(ok ? { type: 'success', text: t('Demonstration readings removed.') } : { type: 'error', text: t('We could not remove them. Try again.') })
  }

  return (
    <SettingsSection title={t("Data")} description={t("Demonstration readings are generated for this prototype and are labeled wherever they appear.")}>
      <div className="flex flex-col gap-4 rounded-xl border border-space-700 bg-space-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-100">{t("Demonstration readings")}</p>
          <p className="text-xs text-ink-500">
            {t("{count} stored. These are simulated values, not medical records.", { count: simulatedCount })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy || simulatedCount === 0}
          className={`${SECONDARY_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {busy ? t('Removing...') : t('Remove demonstration data')}
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
