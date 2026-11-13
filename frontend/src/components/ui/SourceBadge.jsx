import { SOURCE_META } from '../../data/vitalCatalog'
import useLanguage from '../../i18n/useLanguage'

export default function SourceBadge({ source }) {
  const meta = SOURCE_META[source] ?? SOURCE_META.manual
  const { t } = useLanguage()
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
      {t(meta.label)}
    </span>
  )
}
