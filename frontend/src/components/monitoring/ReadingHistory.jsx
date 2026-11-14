
import { useState } from 'react'
import { useHealthData } from '../../health/useHealthData'
import { VITALS, VITAL_BY_ID } from '../../data/vitalCatalog'
import { formatDateTime } from '../../lib/format'
import { formatValue, getStatus } from '../../lib/health'
import SourceBadge from '../ui/SourceBadge'
import StatusBadge from '../ui/StatusBadge'
import CustomSelect from '../ui/CustomSelect'
import useLanguage from '../../i18n/useLanguage'

const MAX_ROWS = 100

const FILTER_OPTIONS = [
  { value: 'all', label: 'All measurements' },
  ...VITALS.map((vital) => ({
    value: vital.id,
    label: vital.label,
  })),
]

export default function ReadingHistory({ readings }) {
  const { t, language } = useLanguage()
  const [vitalFilter, setVitalFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { removeReading } = useHealthData()

  const filtered = readings.filter(
    (reading) =>
      vitalFilter === 'all' || reading.vitalId === vitalFilter
  )

  const shown = filtered.slice(0, MAX_ROWS)

  const handleDelete = async (id) => {
    setDeleting(true)
    await removeReading(id)
    setDeleting(false)
    setConfirmId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-xs text-ink-500">
          {t("{count} {recordsLabel}", { count: filtered.length, recordsLabel: t(filtered.length === 1 ? 'record' : 'records') })}
        </p>

        <div className="min-w-0 flex-1">
          <CustomSelect
            id="reading-vital-filter"
            value={vitalFilter}
            onChange={setVitalFilter}
            ariaLabel={t("Filter by measurement")}
            options={FILTER_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-500">
          {t("No readings for this measurement yet.")}
        </p>
      ) : (
        <div className="max-h-[560px] overflow-auto rounded-xl border border-space-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="sticky top-0 bg-space-900 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("Recorded")}</th>
                <th className="px-4 py-3 font-medium">{t("Measurement")}</th>
                <th className="px-4 py-3 font-medium">{t("Status")}</th>
                <th className="px-4 py-3 font-medium">{t("Source")}</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">{t("Actions")}</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-space-800">
              {shown.map((reading) => {
                const vital = VITAL_BY_ID[reading.vitalId]

                return (
                  <tr
                    key={reading.id}
                    className="transition hover:bg-space-850/60"
                  >
                    <td className="px-4 py-3 text-ink-300">
                      {formatDateTime(reading.time, language)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-medium">
                        {formatValue(vital, reading.value)}
                      </span>{' '}
                      <span className="text-ink-500">{vital.unit}</span>{' '}
                      <span className="text-ink-300">{t(vital.label)}</span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={getStatus(vital, reading.value)} />
                    </td>

                    <td className="px-4 py-3">
                      <SourceBadge source={reading.source} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      {confirmId === reading.id ? (
                        <span className="flex justify-end gap-3 text-xs">
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => handleDelete(reading.id)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            {t("Delete")}
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="text-ink-300 hover:text-ink-100"
                          >
                            {t("Cancel")}
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(reading.id)}
                          className="text-xs text-ink-500 hover:text-rose-400"
                        >
                          {t("Remove")}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > MAX_ROWS && (
        <p className="text-xs text-ink-500">
          {t("Showing the latest {count} records.", { count: MAX_ROWS })}
        </p>
      )}
    </div>
  )
}
