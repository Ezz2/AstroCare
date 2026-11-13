import { VITALS } from '../../data/vitalCatalog'
import SettingsSection from './SettingsSection'

export default function MeasurementReference() {
  return (
    <SettingsSection title="Measurements" description="Units and typical ranges used to flag readings.">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-ink-500">
          <tr>
            <th className="pb-2 font-medium">Measurement</th>
            <th className="pb-2 font-medium">Unit</th>
            <th className="pb-2 font-medium">Typical range</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-space-800">
          {VITALS.map((vital) => (
            <tr key={vital.id}>
              <td className="py-2.5 text-ink-100">{vital.label}</td>
              <td className="py-2.5 text-ink-300">{vital.unit}</td>
              <td className="py-2.5 text-ink-300">{vital.min} to {vital.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SettingsSection>
  )
}
