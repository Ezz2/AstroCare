import { useMemo, useState } from "react";
import { PERIODS, buildReport } from "../lib/analysis";
import { formatPercent } from "../lib/format";
import { formatValue } from "../lib/health";
import { useHealthData } from "../health/useHealthData";
import StatusBadge from "../components/ui/StatusBadge";
import SegmentedControl from "../components/ui/SegmentedControl";
import LoadingScreen from "../components/ui/LoadingScreen";
import {
  PANEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "../components/ui/fieldStyles";

const SOURCE_LABELS = {
  manual: "Your entries",
  simulated: "Demonstration data",
  research: "Research data",
};

export default function ReportsPage() {
  const { readings, dailyCheckIns, status, reload } = useHealthData();
  const [periodId, setPeriodId] = useState("7");
  const period = PERIODS.find((p) => p.id === periodId);
  const report = useMemo(
    () => buildReport(readings, period.days, Date.now(), dailyCheckIns),
    [readings, dailyCheckIns, period.days],
  );

  if (status === "loading") return <LoadingScreen />;
  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6">
        <p className="text-sm text-ink-100">
          We could not load your reports. Check your connection and try again.
        </p>
        <button type="button" onClick={reload} className={PRIMARY_BUTTON_CLASS}>
          Try again
        </button>
      </div>
    );
  }

  const hasData = report.counts.total > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-300">
          {hasData
            ? `${report.counts.total} reading${report.counts.total === 1 ? "" : "s"} in this period.`
            : "No readings in this period."}
        </p>
        <SegmentedControl
          options={PERIODS}
          value={periodId}
          onChange={setPeriodId}
          label="Report period"
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(SOURCE_LABELS).map(([key, label]) => (
          <span
            key={key}
            className="rounded-full border border-space-700 px-3 py-1 text-ink-300">
            {label}:{" "}
            <span className="font-semibold text-ink-100">
              {report.counts[key] ?? 0}
            </span>
          </span>
        ))}
      </div>

      <section className={`${PANEL_CLASS} overflow-x-auto`}>
        <h2 className="mb-4 font-display text-lg font-semibold">Summary</h2>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="pb-2 font-medium">Measurement</th>
              <th className="pb-2 font-medium">Average</th>
              <th className="pb-2 font-medium">Range</th>
              <th className="pb-2 font-medium">Change</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-800">
            {report.rows.map(({ vital, stats, change, status: rowStatus }) => (
              <tr key={vital.id}>
                <td className="py-3 text-ink-100">{vital.label}</td>
                <td className="py-3 text-ink-300">
                  {stats
                    ? `${formatValue(vital, stats.mean)} ${vital.unit}`
                    : "--"}
                </td>
                <td className="py-3 text-ink-300">
                  {stats
                    ? `${formatValue(vital, stats.min)} to ${formatValue(vital, stats.max)}`
                    : "--"}
                </td>
                <td className="py-3 text-ink-300">
                  {change !== null ? formatPercent(change) : "--"}
                </td>
                <td className="py-3">
                  {rowStatus ? (
                    <StatusBadge status={rowStatus} />
                  ) : (
                    <span className="text-ink-500">No data</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={PANEL_CLASS}>
          <h2 className="mb-3 font-display text-lg font-semibold">Notes</h2>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-300">
            {report.observations.map((text) => (
              <li key={text} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section className={PANEL_CLASS}>
          <h2 className="mb-3 font-display text-lg font-semibold">
            Recommendations
          </h2>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-300">
            {report.recommendations.map((text) => (
              <li key={text} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                {text}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* <section className={PANEL_CLASS}>
        <h2 className="mb-1 font-display text-lg font-semibold">
          Unusual readings
        </h2>
        <p className="mb-4 text-xs text-ink-500">
          The ten most recent readings that differ noticeably from your average
          in this period.
        </p>
        {report.unusual.length === 0 ? (
          <p className="text-sm text-ink-300">
            No unusual readings in this period.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-space-800">
            {report.unusual.map((item) => (
              <li
                key={item.reading.id}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                <p className="text-xs text-ink-500">
                  {formatDateTime(item.reading.time)}
                </p>
                <p className="text-sm text-ink-100">{item.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section> */}
    </div>
  );
}
