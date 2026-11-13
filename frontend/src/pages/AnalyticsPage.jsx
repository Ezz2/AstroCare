import { useState } from "react";
import { useHealthInsights } from "../health/useHealthInsights";
import { VITALS, VITAL_BY_ID } from "../data/vitalCatalog";
import {
  PERIODS,
  filterByPeriod,
  findUnusual,
  percentChange,
  previousPeriod,
  statsFor,
  trendPoints,
} from "../lib/analysis";
import { formatDateTime, formatPercent } from "../lib/format";
import { formatValue } from "../lib/health";
import VitalTrendChart from "../components/VitalTrendChart";
import { PANEL_CLASS } from "../components/ui/fieldStyles";
import SegmentedControl from "../components/ui/SegmentedControl";
import useLanguage from "../i18n/useLanguage";

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const { groups } = useHealthInsights();
  const [vitalId, setVitalId] = useState("heartRate");
  const [periodId, setPeriodId] = useState("14");

  const vital = VITAL_BY_ID[vitalId];
  const period = PERIODS.find((p) => p.id === periodId);
  const current = filterByPeriod(groups[vitalId], period.days);
  const previous = previousPeriod(groups[vitalId], period.days);
  const stats = statsFor(current);
  const previousStats = statsFor(previous);
  const change =
    stats && previousStats
      ? percentChange(stats.mean, previousStats.mean)
      : null;
  const unusual = findUnusual(vital, current);
  const outOfRange = current.filter(
    (r) => r.value < vital.min || r.value > vital.max,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("Measurement")}>
          {VITALS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === vitalId}
              onClick={() => setVitalId(item.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                item.id === vitalId
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                  : "border-space-600 text-ink-300 hover:text-ink-100"
              }`}>
              {t(item.label)}
            </button>
          ))}
        </div>
        <SegmentedControl
          options={PERIODS}
          value={periodId}
          onChange={setPeriodId}
          label={t("Time period")}
        />
      </div>

      <section className={PANEL_CLASS}>
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat
            label={t("Average")}
            value={
              stats ? `${formatValue(vital, stats.mean)} ${vital.unit}` : "--"
            }
          />
          <Stat
            label={t("Lowest")}
            value={
              stats ? `${formatValue(vital, stats.min)} ${vital.unit}` : "--"
            }
          />
          <Stat
            label={t("Highest")}
            value={
              stats ? `${formatValue(vital, stats.max)} ${vital.unit}` : "--"
            }
          />
          <Stat
            label={t("Vs. previous period")}
            value={change !== null ? formatPercent(change) : "--"}
          />
          <Stat label={t("Readings")} value={stats ? String(stats.count) : "0"} />
        </div>
        {current.length > 1 ? (
          <VitalTrendChart
            key={`${vitalId}-${periodId}`}
            vital={vital}
            points={trendPoints(current)}
            height="h-80"
          />
        ) : (
          <p className="flex h-40 items-center justify-center text-sm text-ink-500">
            {t("Not enough readings in this period to draw a trend.")}
          </p>
        )}
      </section>

      {/* <div className="grid gap-5 lg:grid-cols-12"> */}
      <section className={`${PANEL_CLASS} lg:col-span-5`}>
        <h2 className="font-display text-lg font-semibold">{t("Unusual readings")}</h2>
        <p className="mb-4 mt-1 text-xs text-ink-500">
          {t("Readings more than two standard deviations from your average, or outside the typical range.")}
        </p>
        {unusual.length === 0 && outOfRange.length === 0 ? (
          <p className="text-sm text-ink-300">
            {t("Nothing unusual in this period.")}
          </p>
        ) : (
          <ul className="flex max-h-72 flex-col gap-3 overflow-auto">
            {[
              ...outOfRange.map((r) => ({
                id: r.id,
                time: r.time,
                text: t("{value} {unit}, outside the typical range", { value: `${formatValue(vital, r.value)}`, unit: vital.unit }),
              })),
              ...unusual.map((u) => ({
                id: u.reading.id,
                time: u.reading.time,
                text: t(u.reason),
              })),
            ]
              .sort((a, b) => b.time - a.time)
              .map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-space-700 p-3 text-sm">
                  <p className="text-xs text-ink-500">
                    {formatDateTime(item.time)}
                  </p>
                  <p className="mt-1 text-ink-100">{item.text}</p>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
    // </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
