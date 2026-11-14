
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import useLanguage from "../i18n/useLanguage";

const LANGUAGE_OPTIONS = [
  {
    value: "en",
    labels: {
      en: "English",
      ar: "الإنجليزية",
      de: "Englisch",
    },
  },
  {
    value: "ar",
    labels: {
      en: "Arabic",
      ar: "العربية",
      de: "Arabisch",
    },
  },
  {
    value: "de",
    labels: {
      en: "German",
      ar: "الألمانية",
      de: "Deutsch",
    },
  },
];

function LanguageFlag({ language }) {
  const flags = {
    en: "https://flagcdn.com/gb.svg",
    ar: "https://flagcdn.com/eg.svg",
    de: "https://flagcdn.com/de.svg",
  };

  return (
    <img
      src={flags[language]}
      alt=""
      aria-hidden="true"
      className="h-4 w-5 shrink-0 rounded-[2px] object-cover"
    />
  );
}

export default function LanguageSwitcher({ className = "", menuPosition = "top" }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const currentLanguage = LANGUAGE_OPTIONS.find(
    (option) => option.value === language,
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLanguageChange = (value) => {
    setLanguage(value);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={t("Select language")}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-space-700 bg-space-850 px-3 text-ink-300 transition-all duration-200 hover:border-cyan-400/40 hover:bg-space-800 hover:text-cyan-300"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Languages size={17} className="shrink-0 text-cyan-300" />
          <span className="truncate text-sm font-medium">
            {currentLanguage?.labels[language] ?? "English"}
          </span>
        </span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-ink-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        dir="ltr"
        className={`absolute left-0 z-[70] w-full min-w-[170px] overflow-hidden rounded-xl border border-space-700 bg-space-900 p-1.5 shadow-2xl shadow-black/30 transition-all duration-200 ease-out ${
          menuPosition === "bottom"
            ? "top-full mt-2 origin-top"
            : "bottom-full mb-2 origin-bottom"
        } ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : menuPosition === "bottom"
              ? "invisible -translate-y-2 scale-[0.97] opacity-0 pointer-events-none"
              : "invisible translate-y-2 scale-[0.97] opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1">
          {LANGUAGE_OPTIONS.map(({ value, labels }) => {
            const selected = language === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => handleLanguageChange(value)}
                lang={value}
                dir="ltr"
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                  selected
                    ? "bg-cyan-400/10 font-medium text-cyan-300"
                    : "text-ink-300 hover:bg-space-800 hover:text-ink-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <LanguageFlag language={value} />
                  <span>{labels[language] ?? labels.en}</span>
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
