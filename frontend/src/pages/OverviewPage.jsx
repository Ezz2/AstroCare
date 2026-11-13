import { useState } from "react";
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
import LoadingScreen from "../components/ui/LoadingScreen";
import { PRIMARY_BUTTON_CLASS } from "../components/ui/fieldStyles";
import AddHealthRecordModal from "../components/health/AddHealthRecordModal";
// import { moodMeta } from "../data/moods";
// import { toLocalDateInput } from "../lib/format";

const TREND_DAYS = 14;
const TILE_SPARK_POINTS = 12;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function summaryFor(overall, alertCount) {
  if (overall === "normal")
    return "All current readings are within their typical ranges.";
  const noun = alertCount === 1 ? "reading needs" : "readings need";
  if (overall === "alert")
    return `${alertCount} ${noun} immediate attention. Review the alerts below.`;
  return `${alertCount} ${noun} a closer look.`;
}

export default function OverviewPage() {
  const { profile, status, reload, addReadings } = useHealthData();
  const { groups, statuses, alerts, overall, statusBySystem } =
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
          We could not load your health data. Check your connection and try
          again.
        </p>
        <button type="button" onClick={reload} className={PRIMARY_BUTTON_CLASS}>
          Try again
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
  );
  const hasReadings = latestReading !== undefined;
  const firstName = profile?.full_name?.split(" ")[0] || "Astronaut";
  const attentionCount = statuses.filter(
    (item) => item.status && item.status !== "normal",
  ).length;
  // const todayCheckIn = dailyCheckIns.find(
  //   (checkIn) => checkIn.check_in_date === toLocalDateInput(Date.now()),
  // );
  // const todayMood = todayCheckIn?.mood ? moodMeta(todayCheckIn.mood) : null;
  // const TodayMoodIcon = todayMood?.icon;

  const handleSave = async (rows) => {
    const saved = await addReadings(rows);
    if (!saved) return false;
    setToast("Health record saved successfully!");
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
            {greeting()}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {firstName}, here’s your health overview.
          </h2>
          <p className="mt-1 text-md text-ink-300">
            {hasReadings
              ? summaryFor(overall, attentionCount)
              : "No readings yet. Add your first measurement to begin."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-300">
          {hasReadings && (
            <>
              <StatusBadge status={overall} className="px-3 py-1 text-xs" />
              <span>Latest {formatDateTime(latestReading.time)}</span>
              {/* <SourceBadge source={latestReading.source} /> */}
            </>
          )}
          <button
            type="button"
            onClick={() => setIsAddRecordOpen(true)}
            className={PRIMARY_BUTTON_CLASS}>
            + Add Health Record
          </button>
        </div>
      </section>

      {/* <section className="rounded-2xl border border-space-700 bg-space-900/70 p-5 lg:col-span-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Daily check-in</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Today&apos;s Mood</h2>
            {todayMood ? (
              <p className={`mt-2 flex items-center gap-2 text-2xl font-semibold ${todayMood.color}`}>
                <TodayMoodIcon size={25} aria-hidden="true" /> {todayMood.label}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-300">
                Your daily check-in is waiting. Complete it to record your sleep and mood.
              </p>
            )}
          </div>
          <Link to="/daily-check-in" className={PRIMARY_BUTTON_CLASS}>
            {todayMood ? "Edit today's check-in" : 'Complete Check-in'}
          </Link>
        </div>
      </section> */}

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
          {statuses.map(({ vital, latest, status: vitalStatus }) => (
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
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="rounded-2xl border border-space-700 bg-space-900/70 p-5 lg:col-span-7">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {selectedVital.label} trend
              </h2>
              <p className="text-xs text-ink-500">
                Last {TREND_DAYS} days. Dashed lines mark the typical range.
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200">
              Explore in analytics
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
              Not enough readings in this period to draw a trend.
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
