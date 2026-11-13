import { VITALS } from '../../data/vitalCatalog'
import SettingsSection from './SettingsSection'
import useLanguage from '../../i18n/useLanguage'

export default function MeasurementReference() {
  const { t } = useLanguage()
  return (
    <SettingsSection title={t("Measurements")} description={t("Units and typical ranges used to flag readings.")}>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-ink-500">
          <tr>
            <th className="pb-2 font-medium">{t("Measurement")}</th>
            <th className="pb-2 font-medium">{t("Unit")}</th>
            <th className="pb-2 font-medium">{t("Typical range")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-space-800">
          {VITALS.map((vital) => (
            <tr key={vital.id}>
              <td className="py-2.5 text-ink-100">{t(vital.label)}</td>
              <td className="py-2.5 text-ink-300">{vital.unit}</td>
              <td className="py-2.5 text-ink-300">{vital.min} {t("to")} {vital.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SettingsSection>
  )
}
