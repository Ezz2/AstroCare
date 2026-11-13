import { STATUS_META } from '../../lib/health'
import useLanguage from '../../i18n/useLanguage'

export default function StatusBadge({ status, className = '' }) {
  const { t } = useLanguage()
  if (!status) return null
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-current/25 px-2.5 py-0.5 text-xs font-medium ${meta.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {t(meta.label)}
    </span>
  )
}
