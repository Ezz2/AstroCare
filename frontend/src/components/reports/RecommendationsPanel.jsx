/* eslint-disable react/prop-types */
import { ArrowRight, CircleCheck, ShieldAlert } from "lucide-react";
import { PANEL_CLASS } from "../ui/fieldStyles";

const PRIORITY_META = {
  informational: {
    label: "Insight",
    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  },
  low: {
    label: "Helpful next step",
    className: "border-teal-400/30 bg-teal-400/10 text-teal-200",
  },
  medium: {
    label: "Worth focusing on",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  high: {
    label: "Review soon",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  },
};

function RecommendationItem({ item }) {
  const priority = PRIORITY_META[item.priority] ?? PRIORITY_META.informational;
  return (
    <li className="rounded-xl border border-space-700 bg-space-950/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-medium text-ink-100">{item.title}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priority.className}`}>
          {priority.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-200">{item.what}</p>
      <div className="mt-3 flex gap-2 text-sm text-ink-100">
        <ArrowRight size={16} className="mt-0.5 shrink-0 text-cyan-300" />
        <span>{item.action}</span>
      </div>
      <details className="mt-3 text-xs text-ink-400">
        <summary className="cursor-pointer text-ink-300">Why this is recommended</summary>
        <p className="mt-2 leading-relaxed">{item.why}</p>
      </details>
    </li>
  );
}

export default function RecommendationsPanel({ assessment }) {
  const recommendations = assessment?.recommendations ?? [];
  const criticalAlerts = assessment?.criticalAlerts ?? [];

  return (
    <section className={PANEL_CLASS}>
      <h2 className="font-display text-lg font-semibold">Recommendations</h2>
      <p className="mt-1 text-xs text-ink-500">
        Short, actionable guidance based on your stored readings and check-ins.
      </p>

      {criticalAlerts.length > 0 && (
        <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-400/10 p-4">
          <p className="flex items-center gap-2 font-semibold text-rose-200">
            <ShieldAlert size={17} /> Critical health alert
          </p>
          <p className="mt-1 text-sm text-rose-100">
            Follow the applicable onboard medical protocol and contact medical
            support.
          </p>
        </div>
      )}

      {recommendations.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {recommendations.slice(0, 3).map((item) => (
            <RecommendationItem item={item} key={item.id} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-300">
          <CircleCheck size={17} className="text-teal-300" />
          No actions are needed from the data currently available.
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-ink-500">
        Guidance is based on the health data and self-reported check-ins stored
        in AstroCare. It is not a diagnosis.
      </p>
    </section>
  );
}
