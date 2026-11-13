import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { STATUS_META } from '../../lib/health'
import { formatDateTime } from '../../lib/format'

export default function RecentAlerts({ alerts }) {
  return (
    <section className="flex flex-col rounded-2xl border border-space-700 bg-space-900/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Active alerts</h2>
        <Link to="/alerts" className="flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200">
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-teal-400/20 bg-teal-400/5 p-4 text-sm text-ink-300">
          <CheckCircle2 size={18} className="shrink-0 text-teal-400" />
          No active alerts. Recent readings are within their typical ranges.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-space-800">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_META[alert.severity].dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{formatDateTime(alert.time)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
