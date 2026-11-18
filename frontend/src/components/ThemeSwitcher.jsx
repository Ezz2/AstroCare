/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Moon, Sun } from "lucide-react";
import useLanguage from "../i18n/useLanguage";
import useTheme from "../theme/useTheme";

const THEME_OPTIONS = [
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
];

export default function ThemeSwitcher({
  className = "",
  menuPosition = "top",
  iconOnly = false,
}) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const isBottom = menuPosition === "bottom";
  const menuPositionClass = isBottom
    ? "top-full mt-3 origin-top"
    : "bottom-full mb-3 origin-bottom";
  const menuHorizontalPosition = iconOnly ? "start-0" : "end-0";
  const closedTransform = isBottom ? "-translate-y-2" : "translate-y-2";
  const currentTheme = THEME_OPTIONS.find((option) => option.value === theme);
  const CurrentIcon = currentTheme.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handleClickOutside, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleThemeChange = (value) => {
    setTheme(value);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={t("Select appearance")}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex h-10 items-center gap-2 rounded-xl border border-space-700/80 bg-space-900 text-ink-200 outline-none transition-all duration-200 hover:border-cyan-400/40 hover:bg-space-800 hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/30 ${
          iconOnly ? "w-10 justify-center px-0" : "w-full justify-between px-3"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CurrentIcon size={17} className="shrink-0 text-cyan-300" />
          {!iconOnly && (
            <span className="truncate text-sm font-medium">
              {t(currentTheme.label)}
            </span>
          )}
        </span>
        {!iconOnly && (
          <ChevronDown
            size={15}
            className={`shrink-0 text-ink-500 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      <div
        aria-hidden={!open}
        className={`absolute ${menuHorizontalPosition} ${menuPositionClass} z-[70] w-[170px] overflow-hidden rounded-xl border border-space-700 bg-space-900 p-1.5 shadow-2xl shadow-black/30 transition-all duration-300 ease-out ${
          open
            ? "visible translate-y-0 scale-100 opacity-100 pointer-events-auto"
            : `invisible ${closedTransform} scale-95 opacity-0 pointer-events-none`
        }`}
      >
        <div className="flex flex-col gap-1">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = theme === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => handleThemeChange(value)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                  selected
                    ? "bg-cyan-400/10 font-medium text-cyan-300"
                    : "text-ink-300 hover:bg-space-800 hover:text-ink-100"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon size={16} className="shrink-0" />
                  <span className="whitespace-nowrap">{t(label)}</span>
                </span>
                {selected && (
                  <Check size={15} className="shrink-0 text-cyan-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
