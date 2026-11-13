/* eslint-disable react/prop-types */
import { ShieldAlert, X } from "lucide-react";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "../ui/fieldStyles";

export default function UrgentHealthAlertModal({
  alert,
  onAcknowledge,
  onViewDetails,
}) {
  if (!alert) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-space-950/85 p-4 backdrop-blur-sm"
      role="presentation">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="urgent-health-alert-title"
        className="w-full max-w-lg rounded-2xl border-2 border-rose-500/70 bg-space-900 p-5 shadow-[0_0_60px_rgba(244,63,94,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
              <ShieldAlert size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
                Urgent health warning
              </p>
              <h2
                id="urgent-health-alert-title"
                className="mt-1 font-display text-xl font-semibold text-rose-100">
                Multiple indicators need prompt review
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onAcknowledge}
            aria-label="Acknowledge urgent health alert"
            className="rounded-lg p-1 text-ink-400 hover:bg-space-800 hover:text-ink-100">
            <X size={18} />
          </button>
        </div>

        <p className="mt-5 text-sm text-rose-100">{alert.what}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-300">{alert.why}</p>

        <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">
          <p className="font-semibold">What you should do</p>
          <p className="mt-1">{alert.action}</p>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onAcknowledge}
            className={SECONDARY_BUTTON_CLASS}>
            Acknowledge
          </button>
          <button type="button" onClick={onViewDetails} className={PRIMARY_BUTTON_CLASS}>
            View Health Details
          </button>
        </div>
      </section>
    </div>
  );
}
