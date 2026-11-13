/* eslint-disable react/prop-types */
import { Languages } from "lucide-react";
import useLanguage from "../i18n/useLanguage";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "de", label: "Deutsch" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label
      className={`inline-flex h-10 items-center gap-2 rounded-xl border border-space-700 bg-space-850 px-2.5 text-ink-300 transition hover:border-cyan-400/30 hover:text-cyan-300 ${className}`}
    >
      <Languages size={17} aria-hidden="true" />
      <select
        aria-label={t("Select language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="max-w-24 cursor-pointer bg-transparent text-xs text-inherit outline-none"
      >
        {LANGUAGE_OPTIONS.map(({ value, label }) => (
          <option className="bg-space-900 text-ink-100" key={value} value={value} lang={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
