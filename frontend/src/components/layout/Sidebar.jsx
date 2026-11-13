import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Activity, LogOut, UserRound, Settings, ChevronUp } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useHealthData } from "../../health/useHealthData";
import { NAV_ITEMS } from "./navItems";
import { missionDayFor } from "../../lib/format";

export default function Sidebar({ alertCount, onNavigate }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { signOut } = useAuth();
  const { profile } = useHealthData();

  const missionDay = missionDayFor(profile?.mission_start_date);

  // Close User Menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-6 bg-space-900 px-4 py-6">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-space-950">
          <Activity size={18} strokeWidth={2.5} />
        </div>

        <div>
          <p className="font-display text-lg font-semibold leading-none">
            AstroCare
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Health Monitoring
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, showCount }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-cyan-400/10 font-medium text-cyan-300 shadow-[inset_2px_0_0_#22d3ee]"
                  : "text-ink-300 hover:bg-space-800 hover:text-ink-100"
              }`
            }>
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{label}</span>

            {showCount && alertCount > 0 && (
              <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
                {alertCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {/* Settings Navigation */}
        <div className="border-t border-space-800 pt-3">
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-cyan-400/10 font-medium text-cyan-300"
                  : "text-ink-400 hover:bg-space-800 hover:text-ink-100"
              }`
            }>
            <Settings size={18} className="shrink-0" />
            <span className="flex-1">Settings</span>
          </NavLink>
        </div>

        {/* Account Section */}
        <div ref={userMenuRef} className="relative">
          <div
            className={` absolute bottom-full left-0 mb-2 w-full origin-bottom rounded-xl border border-space-700 bg-space-850 p-2 shadow-xl transition-all duration-200 ease-out ${userMenuOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-2 scale-[0.98] opacity-0 pointer-events-none"} `}>
            <div className="border-b border-space-700 px-3 py-2">
              <p className="truncate text-sm font-medium text-ink-100">
                {profile?.full_name || "Astronaut"}
              </p>

              <p className="text-xs text-ink-500">
                {profile?.crew_id || "Crew ID pending"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                onNavigate?.();
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-300 transition hover:bg-space-800 hover:text-cyan-300">
              <Settings size={16} />
              User Settings
            </button>

            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-300 transition hover:bg-space-800 hover:text-rose-400">
              <LogOut size={16} />
              Sign out
            </button>
          </div>

          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            aria-expanded={userMenuOpen}
            className="flex w-full items-center gap-3 rounded-xl border border-space-700 bg-space-850 p-3 text-left transition hover:border-cyan-400/30 hover:bg-space-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
              <UserRound size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-100">
                {profile?.full_name || "Astronaut"}
              </p>

              <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
                <span className="shrink-0 text-[10px] text-ink-500">
                  {profile?.crew_id || "Crew ID pending"}
                </span>

                {missionDay !== null && (
                  <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan-300">
                    Mission Day {missionDay}
                  </span>
                )}
              </div>
            </div>

            <ChevronUp
              size={16}
              className={`shrink-0 text-ink-400 transition-transform ${
                userMenuOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
