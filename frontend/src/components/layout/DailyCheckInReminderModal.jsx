import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarCheck, X } from "lucide-react";
import { PRIMARY_BUTTON_CLASS } from "../ui/fieldStyles";
import useLanguage from "../../i18n/useLanguage";

const CLOSE_ANIMATION_MS = 180;

export default function DailyCheckInReminderModal({ onClose, onComplete }) {
  const { t } = useLanguage();
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const completeButtonRef = useRef(null);

  useEffect(() => {
    completeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        requestClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  function requestClose(callback = onClose) {
    if (closing) return;
    setClosing(true);
    closeTimerRef.current = window.setTimeout(callback, CLOSE_ANIMATION_MS);
  }

  function handleComplete() {
    requestClose(onComplete);
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-space-950/70 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        closing ? "opacity-0" : "astrocare-reminder-backdrop"
      }`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-check-in-reminder-title"
        aria-describedby="daily-check-in-reminder-description"
        className={`w-full max-w-md rounded-2xl border border-cyan-400/30 bg-space-900 p-6 shadow-[0_20px_80px_rgba(8,15,35,0.55)] transition-all duration-200 sm:p-7 ${
          closing
            ? "translate-y-2 scale-[0.98] opacity-0"
            : "astrocare-reminder-panel"
        }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <CalendarCheck size={23} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="daily-check-in-reminder-title"
                className="font-display text-xl font-semibold text-ink-100">
                {t("Daily Check-in Reminder")}
              </h2>
              <p
                id="daily-check-in-reminder-description"
                className="mt-2 text-sm leading-relaxed text-ink-300">
                {t(
                  "Take a moment to update your daily health check-in. It only takes a minute!",
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => requestClose()}
            aria-label={t("Dismiss daily check-in reminder")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 transition hover:bg-space-800 hover:text-ink-100">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <button
          ref={completeButtonRef}
          type="button"
          onClick={handleComplete}
          className={`${PRIMARY_BUTTON_CLASS} mt-6 w-full justify-center`}>
          {t("Complete Daily Check-in")}
        </button>
      </section>
    </div>,
    document.body,
  );
}
