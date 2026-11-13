/* eslint-disable react/prop-types */
import { AlertTriangle, CheckCircle2, CircleAlert, HelpCircle } from "lucide-react";
import { PANEL_CLASS } from "../ui/fieldStyles";
import useLanguage from "../../i18n/useLanguage";

const STATUS_META = {
  stable: {
    label: "Stable",
    className: "border-teal-400/30 bg-teal-400/10 text-teal-200",
    icon: CheckCircle2,
  },
  needs_attention: {
    label: "Needs Attention",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    icon: AlertTriangle,
  },
  concerning: {
    label: "Concerning",
    className: "border-orange-400/40 bg-orange-400/10 text-orange-200",
    icon: CircleAlert,
  },
  critical: {
    label: "Critical",
    className: "border-rose-400/50 bg-rose-400/10 text-rose-200",
    icon: CircleAlert,
  },
  insufficient: {
    label: "More Data Needed",
    className: "border-space-600 bg-space-950/40 text-ink-300",
    icon: HelpCircle,
  },
};

export default function HealthStatusPanel({ assessment, detailed = false }) {
  const { t } = useLanguage();
  const meta = STATUS_META[assessment?.healthStatus] ?? STATUS_META.insufficient;
  const Icon = meta.icon;
  const concerns = (assessment?.physiologicalGroups ?? [])
    .filter((group) => group.latestStatus && group.latestStatus !== "normal")
    .map((group) => t(group.label));
  if (assessment?.contextPatterns?.recoveryPattern) concerns.push(t("Recovery"));
  else if (assessment?.contextPatterns?.moodPattern) concerns.push(t("Mood and context"));

  return (
    <section className={PANEL_CLASS}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            {t(detailed ? "Overall health assessment" : "Health status")}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold">{t(meta.label)}</h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.className}`}>
              <Icon size={14} aria-hidden="true" />
              {t(meta.label)}
            </span>
          </div>
        </div>
        {detailed && concerns.length > 0 && (
          <div className="text-left text-xs text-ink-400 sm:text-right">
            <p className="text-ink-500">{t("Main areas to review")}</p>
            <p className="mt-1 text-ink-200">{concerns.join(" · ")}</p>
          </div>
        )}
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-200">
        {t(assessment?.healthStatusSummary)}
      </p>
    </section>
  );
}
