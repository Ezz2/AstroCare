/* eslint-disable react/prop-types */
import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { INPUT_CLASS, LABEL_CLASS } from '../ui/fieldStyles'
import MeasurementInstructionsModal from './MeasurementInstructionsModal'
import useLanguage from '../../i18n/useLanguage'

export default function HealthMeasurementCard({ icon: Icon, label, unit, value, onChange, fields = [], instructionId }) {
  const { t } = useLanguage()
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
  const inputs = fields.length ? fields : [{ id: 'value', label, value, onChange }]

  return (
    <div className="rounded-2xl border border-space-700 bg-space-850/70 p-4 transition hover:border-space-600">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-100">{t(label)}</p>
          <p className="mt-0.5 text-xs text-ink-500">{t(unit)}</p>
        </div>
      </div>

      <div className={fields.length > 1 ? 'grid grid-cols-2 gap-2' : ''}>
        {inputs.map((input) => (
          <div key={input.id}>
            {fields.length > 1 && <label htmlFor={`health-record-${input.id}`} className={LABEL_CLASS}>{t(input.label)}</label>}
            <input
              id={`health-record-${input.id}`}
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={input.value}
              onChange={(event) => input.onChange(event.target.value)}
              className={`${INPUT_CLASS} ${input.value ? 'border-cyan-400/50 bg-space-950/80' : ''}`}
              placeholder={t("Enter value")}
            />
          </div>
        ))}
      </div>
      {instructionId && (
        <>
          <button
            type="button"
            onClick={() => setIsInstructionsOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 transition hover:text-cyan-200">
            <BookOpen size={14} />
            {t("How to Measure?")}
          </button>
          {isInstructionsOpen && (
            <MeasurementInstructionsModal
              instructionId={instructionId}
              onClose={() => setIsInstructionsOpen(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
