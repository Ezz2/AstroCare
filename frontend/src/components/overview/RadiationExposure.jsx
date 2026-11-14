/* eslint-disable react/prop-types */
import { formatPercent, missionDayFor } from "../../lib/format";
import useLanguage from "../../i18n/useLanguage";

const LIFETIME_REFERENCE_MSV = 600;
const MIN_DAILY_DOSE_MSV = 0.5;
const MAX_DAILY_DOSE_MSV = 1;

const RISK_STYLES = {
  green: {
    text: "text-emerald-300",
    track: "bg-emerald-400/15",
    fill: "bg-emerald-400",
  },
  yellow: {
    text: "text-amber-300",
    track: "bg-amber-400/15",
    fill: "bg-amber-400",
  },
  red: {
    text: "text-rose-300",
    track: "bg-rose-400/15",
    fill: "bg-rose-400",
  },
};

export default function RadiationExposure({ missionStartDate, className = "" }) {
  const { t } = useLanguage();
  const missionDays = missionDayFor(missionStartDate);
  const hasMissionDuration = Number.isFinite(missionDays);
  const estimatedDose = hasMissionDuration
    ? missionDays * ((MIN_DAILY_DOSE_MSV + MAX_DAILY_DOSE_MSV) / 2)
    : null;
  const percent =
    estimatedDose === null
      ? null
      : Math.min(100, (estimatedDose / LIFETIME_REFERENCE_MSV) * 100);
  const risk =
    percent === null ? "green" : percent >= 90 ? "red" : percent > 70 ? "yellow" : "green";
  const styles = RISK_STYLES[risk];

  return (
    <section
      className={`rounded-2xl border border-space-700 bg-space-900/70 p-5 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {t("Radiation effect")}
          </h2>
        </div>
        <p className={`font-display text-xl font-semibold ${styles.text}`}>
          {percent === null ? "--%" : formatPercent(percent)}
        </p>
      </div>

      <div className="mt-4">
        <div
          role="progressbar"
          aria-label={t("Radiation effect")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent === null ? undefined : Number(percent.toFixed(1))}
          className="flex gap-2"
        >
          {[0, 1, 2].map((segment) => {
            const segmentPercent = Math.min(
              100,
              Math.max(0, ((percent ?? 0) - segment * (100 / 3)) * 3),
            );

            return (
              <div
                key={segment}
                className={`h-3 flex-1 overflow-hidden rounded-full ${styles.track}`}
              >
                <div
                  className={`h-full rounded-full ${styles.fill}`}
                  style={{ width: `${segmentPercent}%` }}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-ink-500">
          {t("0.5–1 mSv per mission day · 600 mSv lifetime maximum")}
        </p>
      </div>
    </section>
  );
}
