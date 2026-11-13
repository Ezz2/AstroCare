/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCheck } from "lucide-react";
import { useHealthData } from "../health/useHealthData";
import { CONTRIBUTING_FACTORS, MOOD_OPTIONS, moodMeta } from "../data/moods";
import { toLocalDateInput } from "../lib/format";
import LoadingScreen from "../components/ui/LoadingScreen";
import {
  INPUT_CLASS,
  PANEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "../components/ui/fieldStyles";

function todayKey() {
  return toLocalDateInput(Date.now());
}

function dateLabel(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MoodChoices({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
      {MOOD_OPTIONS.map(({ id, label, icon: Icon, emoji, color }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
            value === id
              ? "border-cyan-400 bg-cyan-400/10 text-ink-100"
              : "border-space-600 text-ink-300 hover:border-cyan-400/50 hover:bg-space-800"
          }`}>
          <Icon size={18} className={color} aria-hidden="true" />
          <span>
            {emoji} {label}
          </span>
        </button>
      ))}
    </div>
  );
}

function FactorChoices({ values, onChange }) {
  const toggleFactor = (id) => {
    onChange(
      values.includes(id)
        ? values.filter((value) => value !== id)
        : [...values, id],
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CONTRIBUTING_FACTORS.map(({ id, label, emoji }) => (
        <button
          key={id}
          type="button"
          onClick={() => toggleFactor(id)}
          aria-pressed={values.includes(id)}
          className={`rounded-full border px-3 py-2 text-xs transition ${
            values.includes(id)
              ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
              : "border-space-600 text-ink-300 hover:border-cyan-400/50 hover:bg-space-800"
          }`}>
          {emoji} {label}
        </button>
      ))}
    </div>
  );
}

export default function DailyCheckInPage() {
  const { status, dailyCheckIns, saveDailyCheckIn, reload } = useHealthData();
  const currentDate = todayKey();
  const todayCheckIn = useMemo(
    () =>
      dailyCheckIns.find((item) => item.check_in_date === currentDate) ?? null,
    [dailyCheckIns, currentDate],
  );
  const [sleepDuration, setSleepDuration] = useState("");
  const [mood, setMood] = useState("");
  const [factors, setFactors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSleepDuration(todayCheckIn ? String(todayCheckIn.sleep_duration) : "");
    setMood(todayCheckIn?.mood ?? "");
    setFactors(
      Array.isArray(todayCheckIn?.contributing_factors)
        ? todayCheckIn.contributing_factors
        : [],
    );
    setMessage(null);
    setError(null);
  }, [todayCheckIn]);

  if (status === "loading") return <LoadingScreen />;
  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6">
        <p className="text-sm text-ink-100">
          We could not load your daily check-in. Check your connection and try
          again.
        </p>
        <button type="button" onClick={reload} className={PRIMARY_BUTTON_CLASS}>
          Try again
        </button>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const sleep = Number(sleepDuration);
    if (!Number.isFinite(sleep) || sleep <= 0 || sleep >= 24 || !mood) {
      setError(
        !mood
          ? "Select how you are feeling today."
          : "Enter how many hours you slept.",
      );
      return;
    }
    setSaving(true);
    const saved = await saveDailyCheckIn({
      check_in_date: currentDate,
      sleep_duration: sleep,
      mood,
      contributing_factors: factors,
    });
    setSaving(false);
    if (!saved) {
      setError("We could not save your daily check-in. Please try again.");
      return;
    }
    setMessage(
      todayCheckIn
        ? "Your daily check-in was updated."
        : "Your daily check-in was saved.",
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <section className={PANEL_CLASS}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            <ClipboardCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
              Daily routine
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              Daily Check-in
            </h2>
            <p className="mt-1 text-sm text-ink-300">
              Record your sleep and how you are feeling today.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div>
            <label
              htmlFor="check-in-sleep"
              className="mb-1.5 block text-sm font-medium text-ink-100">
              How long did you sleep?
            </label>
            <p className="mb-2 text-xs text-ink-500">
              Today, {dateLabel(currentDate)}. Enter hours, for example 7.5.
            </p>
            <div className="flex max-w-xs items-center gap-2">
              <input
                id="check-in-sleep"
                type="number"
                min="0"
                max="24"
                step="0.1"
                inputMode="decimal"
                value={sleepDuration}
                onChange={(event) => setSleepDuration(event.target.value)}
                className={INPUT_CLASS}
              />
              <span className="text-sm text-ink-500">hours</span>
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-ink-100">
              How are you feeling today?
            </p>
            <p className="mb-2 text-xs text-ink-500">Choose one mood.</p>
            <MoodChoices value={mood} onChange={setMood} />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-ink-100">
              How was your day?
            </p>
            <p className="mb-2 text-xs text-ink-500">
              Optional context for your check-in.
            </p>
            <FactorChoices values={factors} onChange={setFactors} />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-teal-300">
              <Check size={16} aria-hidden="true" /> {message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className={PRIMARY_BUTTON_CLASS}>
              {saving
                ? "Saving..."
                : todayCheckIn
                  ? "Update today's check-in"
                  : "Save today's check-in"}
            </button>
          </div>
        </form>
      </section>

      <section className={PANEL_CLASS}>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Recent check-ins
        </h2>
        {dailyCheckIns.length === 0 ? (
          <p className="text-sm text-ink-500">
            Your completed check-ins will appear here.
          </p>
        ) : (
          <div className="divide-y divide-space-800">
            {dailyCheckIns.slice(0, 14).map((checkIn) => {
              const moodInfo = checkIn.mood ? moodMeta(checkIn.mood) : null;
              const factorLabels = (checkIn.contributing_factors ?? [])
                .map(
                  (id) =>
                    CONTRIBUTING_FACTORS.find((factor) => factor.id === id)
                      ?.label,
                )
                .filter(Boolean);
              return (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <span className="text-sm text-ink-300">
                    {dateLabel(checkIn.check_in_date)}
                  </span>
                  <span
                    className={`text-right text-sm ${moodInfo?.color ?? "text-ink-500"}`}>
                    {moodInfo ? `${moodInfo.label}` : "Mood skipped"} ·{" "}
                    {checkIn.sleep_duration}h sleep
                    {factorLabels.length > 0 && (
                      <span className="block text-xs text-ink-500">
                        {factorLabels.join(", ")}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
