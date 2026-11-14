import { useMemo, useState } from "react";
import { PERIODS, buildReport } from "../lib/analysis";
import { formatPercent } from "../lib/format";
import { formatValue } from "../lib/health";
import { useHealthData } from "../health/useHealthData";
import { useHealthInsights } from "../health/useHealthInsights";
import StatusBadge from "../components/ui/StatusBadge";
import SegmentedControl from "../components/ui/SegmentedControl";
import LoadingScreen from "../components/ui/LoadingScreen";
import {
  PANEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "../components/ui/fieldStyles";
import RecommendationsPanel from "../components/reports/RecommendationsPanel";
import HealthStatusPanel from "../components/health/HealthStatusPanel";
import useLanguage from "../i18n/useLanguage";

const SOURCE_LABELS = {
  manual: "Your entries",
  simulated: "Demonstration data",
  research: "Research data",
};

export default function ReportsPage() {
  const { t } = useLanguage();
  const { readings, dailyCheckIns, status, reload } = useHealthData();
  const { assessment } = useHealthInsights();
  const [periodId, setPeriodId] = useState("7");
  const period = PERIODS.find((p) => p.id === periodId);
  const report = useMemo(
    () => buildReport(readings, period.days, Date.now(), dailyCheckIns, t),
    [readings, dailyCheckIns, period.days, t],
  );

  if (status === "loading") return <LoadingScreen />;
  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6">
        <p className="text-sm text-ink-100">
          {t(
            "We could not load your reports. Check your connection and try again.",
          )}
        </p>
        <button type="button" onClick={reload} className={PRIMARY_BUTTON_CLASS}>
          {t("Try again")}
        </button>
      </div>
    );
  }

  const hasData = report.counts.total > 0;

  return (
    <div className="flex flex-col gap-5">
      <HealthStatusPanel assessment={assessment} detailed />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-300">
          {hasData
            ? t("{count} readings in this period.", {
                count: report.counts.total,
              })
            : t("No readings in this period.")}
        </p>
        <SegmentedControl
          options={PERIODS}
          value={periodId}
          onChange={setPeriodId}
          label={t("Report period")}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(SOURCE_LABELS).map(([key, label]) => (
          <span
            key={key}
            className="rounded-full border border-space-700 px-3 py-1 text-ink-300">
            {t(label)}:{" "}
            <span className="font-semibold text-ink-100">
              {report.counts[key] ?? 0}
            </span>
          </span>
        ))}
      </div>

      <section className={`${PANEL_CLASS} overflow-x-auto`}>
        <h2 className="mb-4 font-display text-lg font-semibold">
          {t("Summary")}
        </h2>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="pb-2 font-medium">{t("Measurement")}</th>
              <th className="pb-2 font-medium">{t("Average")}</th>
              <th className="pb-2 font-medium">{t("Range")}</th>
              <th className="pb-2 font-medium">{t("Change")}</th>
              <th className="pb-2 font-medium">{t("Status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-800">
            {report.rows.map(({ vital, stats, change, status: rowStatus }) => (
              <tr key={vital.id}>
                <td className="py-3 text-ink-100">{t(vital.label)}</td>
                <td className="py-3 text-ink-300">
                  {stats
                    ? `${formatValue(vital, stats.mean)} ${vital.unit}`
                    : "--"}
                </td>
                <td className="py-3 text-ink-300">
                  {stats
                    ? `${formatValue(vital, stats.min)} ${t("to")} ${formatValue(vital, stats.max)}`
                    : "--"}
                </td>
                <td className="py-3 text-ink-300">
                  {change !== null ? formatPercent(change) : "--"}
                </td>
                <td className="py-3">
                  {rowStatus ? (
                    <StatusBadge status={rowStatus} />
                  ) : (
                    <span className="text-ink-500">{t("No data")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <RecommendationsPanel assessment={assessment} />
    </div>
  );
}
