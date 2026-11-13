import { useState } from 'react'
import { PANEL_CLASS, PRIMARY_BUTTON_CLASS } from '../components/ui/fieldStyles'
import ReadingHistory from '../components/monitoring/ReadingHistory'
import { useHealthData } from '../health/useHealthData'
import LoadingScreen from '../components/ui/LoadingScreen'
import AddHealthRecordModal from '../components/health/AddHealthRecordModal'

export default function MonitoringPage() {
  const { readings, status, reload, addReadings } = useHealthData()
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [toast, setToast] = useState(null)

  if (status === 'loading') return <LoadingScreen />
  if (status === 'error') {
    return (
      <div className={`${PANEL_CLASS} flex flex-col items-start gap-4`}>
        <p className="text-sm">We could not load your readings. Check your connection and try again.</p>
        <button type="button" onClick={reload} className={PRIMARY_BUTTON_CLASS}>Try again</button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col gap-5">
      {toast && <p role="status" className="fixed right-5 top-20 z-40 rounded-xl border border-teal-400/30 bg-space-900 px-4 py-3 text-sm text-teal-300 shadow-xl">{toast}</p>}
      <section className={`${PANEL_CLASS} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="font-display text-lg font-semibold">Health records</h2>
          <p className="mt-1 text-xs text-ink-500">Browse and manage your recorded measurements.</p>
        </div>
        <button type="button" onClick={() => setIsAddRecordOpen(true)} className={`${PRIMARY_BUTTON_CLASS} shrink-0`}>+ Add Health Record</button>
      </section>

      <section className={PANEL_CLASS}>
        <h2 className="mb-4 font-display text-lg font-semibold">History</h2>
        <ReadingHistory readings={readings} />
      </section>
      <AddHealthRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        onSave={async (rows) => {
          const saved = await addReadings(rows)
          if (!saved) return false
          setToast('Health record saved successfully!')
          window.setTimeout(() => setToast(null), 3500)
          return true
        }}
      />
    </div>
  )
}
