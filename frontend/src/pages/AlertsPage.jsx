/* eslint-disable react/prop-types */
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { useHealthInsights } from '../health/useHealthInsights'
import { formatDateTime } from '../lib/format'
import { STATUS_META } from '../lib/health'
import StatusBadge from '../components/ui/StatusBadge'
import { PANEL_CLASS } from '../components/ui/fieldStyles'

const KIND_LABELS = { range: 'Outside typical range', unusual: 'Unusual change' }

export default function AlertsPage() {
  const { alerts, assessment } = useHealthInsights()
  const criticalAlerts = assessment.criticalAlerts ?? []
  const urgentWarnings = assessment.urgentWarnings ?? []

  const urgentWarningSection = urgentWarnings.length > 0 && (
    <section className="rounded-2xl border border-rose-400/50 bg-rose-400/10 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-rose-200">
        <CircleAlert size={19} /> Urgent Health Warning
      </h2>
      <p className="mt-2 text-sm text-rose-100">
        Multiple health indicator groups need prompt review. This warning is
        not a diagnosis or emergency classification.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {urgentWarnings.map((warning) => (
          <li key={warning.id} className="rounded-xl border border-rose-300/30 p-3 text-sm text-rose-100">
            <p className="font-medium">{warning.what}</p>
            <p className="mt-1">{warning.action}</p>
          </li>
        ))}
      </ul>
    </section>
  )

  if (criticalAlerts.length > 0) {
    return (
      <div className="flex flex-col gap-5">
        {urgentWarningSection}
        <section className="rounded-2xl border border-rose-400/50 bg-rose-400/10 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-rose-200">
            <CircleAlert size={19} /> Critical Health Alert
          </h2>
          <p className="mt-2 text-sm text-rose-100">
            Your recent health readings meet validated criteria that require
            immediate attention. Follow the applicable onboard medical
            protocol and contact medical support.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {criticalAlerts.map((alert) => (
              <li key={alert.id} className="rounded-xl border border-rose-300/30 p-3 text-sm text-rose-100">
                <p className="font-medium">{alert.what}</p>
                <p className="mt-1">{alert.action}</p>
              </li>
            ))}
          </ul>
        </section>
        {alerts.length > 0 && <AlertList alerts={alerts} />}
      </div>
    )
  }

  if (alerts.length === 0 && !urgentWarningSection) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-teal-400/20 bg-teal-400/5 p-5 text-sm text-ink-300">
        <CheckCircle2 size={18} className="shrink-0 text-teal-400" />
        No active alerts. Your recent readings are within their typical ranges.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {urgentWarningSection}
      {alerts.length > 0 && <AlertList alerts={alerts} />}
    </div>
  )
}

function AlertList({ alerts }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-300">
        {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}, sorted by severity. Alerts are guidance to review, not a diagnosis.
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => (
          <li key={alert.id} className={`${PANEL_CLASS} flex flex-col gap-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={alert.severity} />
              <span className="text-xs text-ink-500">{formatDateTime(alert.time)}</span>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold leading-snug">{alert.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-500">{KIND_LABELS[alert.kind]}</p>
            </div>
            <p className="text-sm text-ink-300">{alert.explanation}</p>
            <div className="rounded-xl border border-space-700 bg-space-950/60 p-3 text-sm text-ink-100">
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${STATUS_META[alert.severity].dot}`} />
              {alert.action}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
