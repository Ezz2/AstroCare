import { useState } from "react";
import { BODY_SYSTEMS } from "../../data/bodySystems";
import { STATUS_META } from "../../lib/health";
import BodyScene from "../body/BodyScene";
import StatusBadge from "../ui/StatusBadge";
import useLanguage from "../../i18n/useLanguage";

export default function BodyPanel({
  heartRate,
  selectedSystemId,
  statusBySystem,
  onSelectSystem,
}) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(null);
  const selectedSystem = BODY_SYSTEMS.find(
    (system) => system.id === selectedSystemId,
  );

  return (
    <section className="flex h-full flex-col rounded-2xl border border-space-700 bg-space-900/70 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {t("Body map")}
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            {t("Drag to rotate. Select a system or organ to see its status.")}
          </p>
        </div>
      </div>

      <div
        className="mb-3 flex flex-wrap gap-2"
        role="group"
        aria-label={t("Body systems")}>
        {BODY_SYSTEMS.map((system) => {
          const active = system.id === selectedSystemId;
          const status = statusBySystem[system.id];
          return (
            <button
              key={system.id}
              type="button"
              onClick={() => onSelectSystem(active ? null : system.id)}
              onMouseEnter={() => setHovered(system.id)}
              onMouseLeave={() => setHovered(null)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                  : hovered === system.id
                    ? "border-cyan-400/50 text-ink-100"
                    : "border-space-600 text-ink-300"
              }`}>
              {status && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`}
                />
              )}
              {t(system.name)}
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[380px] flex-1 overflow-hidden rounded-xl border border-space-800 bg-space-950/60">
        <BodyScene
          heartRate={heartRate}
          selectedSystemId={selectedSystemId}
          statusBySystem={statusBySystem}
          onSelectSystem={onSelectSystem}
        />

        {selectedSystem && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 animate-fade-up rounded-xl border border-space-600 bg-space-950/90 p-4 sm:right-auto sm:w-72">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display font-semibold">
                {t(selectedSystem.name)}
              </p>
              <StatusBadge status={statusBySystem[selectedSystem.id]} />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
              {t(selectedSystem.summary)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
