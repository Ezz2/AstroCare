/* eslint-disable react/prop-types */
import { INPUT_CLASS, LABEL_CLASS } from '../ui/fieldStyles'

export default function HealthMeasurementCard({ icon: Icon, label, unit, value, onChange, fields = [] }) {
  const inputs = fields.length ? fields : [{ id: 'value', label, value, onChange }]

  return (
    <div className="rounded-2xl border border-space-700 bg-space-850/70 p-4 transition hover:border-space-600">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-100">{label}</p>
          <p className="mt-0.5 text-xs text-ink-500">{unit}</p>
        </div>
      </div>

      <div className={fields.length > 1 ? 'grid grid-cols-2 gap-2' : ''}>
        {inputs.map((input) => (
          <div key={input.id}>
            {fields.length > 1 && <label htmlFor={`health-record-${input.id}`} className={LABEL_CLASS}>{input.label}</label>}
            <input
              id={`health-record-${input.id}`}
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={input.value}
              onChange={(event) => input.onChange(event.target.value)}
              className={`${INPUT_CLASS} ${input.value ? 'border-cyan-400/50 bg-space-950/80' : ''}`}
              placeholder="Enter value"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
