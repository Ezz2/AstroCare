import { STATUS_META, formatValue } from '../../lib/health'
import Sparkline from '../ui/Sparkline'
import StatusBadge from '../ui/StatusBadge'
import useLanguage from '../../i18n/useLanguage'

export default function VitalTile({ vital, latest, status, values, selected, onSelect }) {
  const { t } = useLanguage()
  const stroke = status ? STATUS_META[status].glow : '#67e8f9'

  return (
    <button
      type="button"
      onClick={() => onSelect(vital.id)}
      aria-pressed={selected}
      className={`group flex flex-col gap-3 rounded-2xl border bg-space-900/70 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/50 ${
        selected ? 'border-cyan-400/70 shadow-lg shadow-cyan-400/10' : 'border-space-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-ink-300">{t(vital.label)}</span>
        <StatusBadge status={status} className="shrink-0 px-2 text-[10px]" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="font-display text-2xl font-semibold leading-none">
          {latest ? formatValue(vital, latest.value) : '--'}
          <span className="ml-1 font-sans text-xs font-normal text-ink-500">{vital.unit}</span>
        </p>
        <Sparkline values={values} stroke={stroke} width={80} height={28} />
      </div>
      <p className="text-[11px] text-ink-500">
        {t("Typical {min} to {max} {unit}", { min: vital.min, max: vital.max, unit: vital.unit })}
      </p>
    </button>
  )
}
