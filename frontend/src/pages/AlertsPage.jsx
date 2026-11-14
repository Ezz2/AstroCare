/* eslint-disable react/prop-types */
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { useHealthInsights } from '../health/useHealthInsights'
import { formatDateTime } from '../lib/format'
import { STATUS_META } from '../lib/health'
import StatusBadge from '../components/ui/StatusBadge'
import { PANEL_CLASS } from '../components/ui/fieldStyles'
import useLanguage from '../i18n/useLanguage'

const KIND_LABELS = {
  range: 'Outside typical range',
  unusual: 'Unusual change',
  invalid: 'Cannot interpret this result',
}

export default function AlertsPage() {
  const { t } = useLanguage()
  const { alerts, assessment } = useHealthInsights()
  const criticalAlerts = assessment.criticalAlerts ?? []
  const urgentWarnings = assessment.urgentWarnings ?? []

  const urgentWarningSection = urgentWarnings.length > 0 && (
    <section className="rounded-2xl border border-rose-400/50 bg-rose-400/10 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-rose-200">
        <CircleAlert size={19} /> {t("Urgent Health Warning")}
      </h2>
      <p className="mt-2 text-sm text-rose-100">
        {t("Several health indicator groups need prompt review. This warning is not a diagnosis or emergency classification.")}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {urgentWarnings.map((warning) => (
          <li key={warning.id} className="rounded-xl border border-rose-300/30 p-3 text-sm text-rose-100">
            <p className="font-medium">{t(warning.what)}</p>
            <p className="mt-1">{t(warning.why)}</p>
            <p className="mt-1">{t(warning.action)}</p>
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
            <CircleAlert size={19} /> {t("Critical Health Alert")}
          </h2>
          <p className="mt-2 text-sm text-rose-100">
            {t("Your recent health readings meet validated criteria that require immediate attention. Follow the applicable onboard medical protocol and contact medical support.")}
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {criticalAlerts.map((alert) => (
              <li key={alert.id} className="rounded-xl border border-rose-300/30 p-3 text-sm text-rose-100">
                <p className="font-medium">{t(alert.what)}</p>
                <p className="mt-1">{t(alert.action)}</p>
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
        {t("No active alerts. Your recent readings are within their typical ranges.")}
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
  const { t } = useLanguage()
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-300">
        {t("{count} active alerts, sorted by severity. Alerts are guidance to review, not a diagnosis.", { count: alerts.length })}
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => (
          <li key={alert.id} className={`${PANEL_CLASS} flex flex-col gap-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={alert.severity} />
              <span className="text-xs text-ink-500">{formatDateTime(alert.time)}</span>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold leading-snug">{t(alert.title)}</h2>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-500">{t(KIND_LABELS[alert.kind])}</p>
            </div>
            <p className="text-sm text-ink-300">{t(alert.explanation)}</p>
            {alert.meaning && (
              <p className="text-sm text-ink-300">
                <span className="font-medium text-ink-100">{t("What it means")}: </span>
                {t(alert.meaning)}
              </p>
            )}
            {alert.why && (
              <p className="text-sm text-ink-300">
                <span className="font-medium text-ink-100">{t("Why it matters")}: </span>
                {t(alert.why)}
              </p>
            )}
            <div className="rounded-xl border border-space-700 bg-space-950/60 p-3 text-sm text-ink-100">
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${STATUS_META[alert.severity].dot}`} />
              <span className="font-medium">{t("What to do")}: </span>
              {t(alert.action)}
            </div>
            {alert.education && (
              <details className="text-xs text-ink-400">
                <summary className="cursor-pointer text-ink-300">{t("Learn about this measurement")}</summary>
                <div className="mt-2 space-y-1 leading-relaxed">
                  <p>{t(alert.education.what)}</p>
                  <p>{t(alert.education.unit)}</p>
                  <p>{t(alert.education.measuredBy)}</p>
                  <p>{t(alert.education.factors)}</p>
                </div>
              </details>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
