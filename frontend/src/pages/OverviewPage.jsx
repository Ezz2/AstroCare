import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { useHealthData } from "../health/useHealthData";
import { useHealthInsights } from "../health/useHealthInsights";
import { VITAL_BY_ID } from "../data/vitalCatalog";
import { filterByPeriod, trendPoints } from "../lib/analysis";
import { formatDateTime } from "../lib/format";
import BodyPanel from "../components/overview/BodyPanel";
import RecentAlerts from "../components/overview/RecentAlerts";
import VitalTile from "../components/overview/VitalTile";
import VitalTrendChart from "../components/VitalTrendChart";
import StatusBadge from "../components/ui/StatusBadge";
// import SourceBadge from "../components/ui/SourceBadge";
import LoadingScreen from "../components/ui/LoadingScreen";
import { PRIMARY_BUTTON_CLASS } from "../components/ui/fieldStyles";
import AddHealthRecordModal from "../components/health/AddHealthRecordModal";
import HealthStatusPanel from "../components/health/HealthStatusPanel";
import RadiationExposure from "../components/overview/RadiationExposure";
import useLanguage from "../i18n/useLanguage";

const TREND_DAYS = 14;
const TILE_SPARK_POINTS = 12;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function OverviewPage() {
  const { t, language } = useLanguage();
  const { profile, status, reload, addReadings } = useHealthData();
  const { groups, statuses, alerts, overall, statusBySystem, assessment } =
    useHealthInsights();
  const [selectedVitalId, setSelectedVitalId] = useState("heartRate");
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [toast, setToast] = useState(null);

  if (status === "loading") return <LoadingScreen />;

  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6">
        <p className="text-sm text-ink-100">
          {t("We could not load your health data. Check your connection and try again.")}
        </p>
        <button type="button" onClick={reload} className={PRIMARY_BUTTON_CLASS}>
          {t("Try again")}
        </button>
      </div>
    );
  }

  const latestReading = statuses
    .map((item) => item.latest)
    .filter(Boolean)
    .sort((a, b) => b.time - a.time)[0];
  const heartRate = groups.heartRate.at(-1)?.value;
  const selectedVital = VITAL_BY_ID[selectedVitalId];
  const points = trendPoints(
    filterByPeriod(groups[selectedVitalId], TREND_DAYS),
    language,
  );
  const hasReadings = latestReading !== undefined;
  const firstName = profile?.full_name?.split(" ")[0] || t("Astronaut");
  const overviewStatuses = [
    ...statuses.filter(
      ({ vital }) => vital.id !== "sleep" && vital.id !== "glucose",
    ),
    statuses.find(({ vital }) => vital.id === "glucose"),
    statuses.find(({ vital }) => vital.id === "sleep"),
  ].filter(Boolean);
  const renderVitalTile = ({ vital, latest, status: vitalStatus }) => (
    <VitalTile
      key={vital.id}
      vital={vital}
      latest={latest}
      status={vitalStatus}
      values={groups[vital.id]
        .slice(-TILE_SPARK_POINTS)
        .map((r) => r.value)}
      selected={vital.id === selectedVitalId}
      onSelect={setSelectedVitalId}
    />
  );

  const handleSave = async (rows) => {
    const saved = await addReadings(rows);
    if (!saved) return false;
    setToast(t("Health record saved successfully!"));
    window.setTimeout(() => setToast(null), 3500);
    return true;
  };

  return (
    <div className="relative flex flex-col gap-5">
      {toast && (
        <p
          role="status"
          className="fixed right-5 top-20 z-40 rounded-xl border border-teal-400/30 bg-space-900 px-4 py-3 text-sm text-teal-300 shadow-xl">
          {toast}
        </p>
      )}
      <section className="flex flex-col gap-4 rounded-2xl border border-space-700 bg-space-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            {t(greeting())}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {t("{name}, your health at a glance", { name: firstName })}
          </h2>
          <p className="mt-1 text-sm text-ink-300">
            {hasReadings
              ? t("Your current readings and health patterns are summarized below.")
              : t("Add your first measurement to begin.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-300">
          {hasReadings && (
            <>
              <StatusBadge status={overall} className="px-3 py-1 text-xs" />
              <span>{t("Latest {date}", { date: formatDateTime(latestReading.time, language) })}</span>
              {/* <SourceBadge source={latestReading.source} /> */}
            </>
          )}
          <button
            type="button"
            onClick={() => setIsAddRecordOpen(true)}
            className={PRIMARY_BUTTON_CLASS}>
            + {t("Add Health Record")}
          </button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <BodyPanel
            heartRate={heartRate}
            selectedSystemId={selectedSystemId}
            statusBySystem={statusBySystem}
            onSelectSystem={setSelectedSystemId}
          />
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-7 xl:grid-cols-3">
          {overviewStatuses.map(({ vital, latest, status: vitalStatus }) => (
            <Fragment key={vital.id}>
              {renderVitalTile({ vital, latest, status: vitalStatus })}
              {vital.id === "sleep" && (
                <RadiationExposure
                  missionStartDate={profile?.mission_start_date}
                  className="sm:col-span-2"
                />
              )}
            </Fragment>
          ))}
          <div className="sm:col-span-2 xl:col-span-3">
            <HealthStatusPanel assessment={assessment} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="rounded-2xl border border-space-700 bg-space-900/70 p-5 lg:col-span-7">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {t("{measurement} trend", { measurement: t(selectedVital.label) })}
              </h2>
              <p className="text-xs text-ink-500">
                {t("Last {days} days. Dashed lines mark the typical range.", { days: TREND_DAYS })}
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200">
              {t("Explore in analytics")}
            </Link>
          </div>
          {points.length > 1 ? (
            <VitalTrendChart
              key={selectedVital.id}
              vital={selectedVital}
              points={points}
            />
          ) : (
            <p className="flex h-64 items-center justify-center text-sm text-ink-500">
              {t("Not enough readings in this period to draw a trend.")}
            </p>
          )}
        </section>

        <div className="lg:col-span-5">
          <RecentAlerts alerts={alerts.slice(0, 4)} />
        </div>
      </div>
      <AddHealthRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
