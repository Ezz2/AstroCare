/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import LanguageContext from "./LanguageContext";
import { translate } from "./translations";

const LANGUAGE_STORAGE_KEY = "astrocare.language";
const SUPPORTED_LANGUAGES = ["en", "ar", "de"];

function getSavedLanguage() {
  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : "en";
  } catch (error) {
    console.error("Unable to read the saved language preference.", error);
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getSavedLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = translate(
      language,
      "AstroCare | Astronaut Health Monitoring Prototype",
    );
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = translate(
        language,
        "AstroCare is an astronaut health monitoring prototype by AstroByteX for the NASA Space Apps Challenge. Explore health measurements, trends, alerts, reports, and a 3D body-system map.",
      );
    }

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error("Unable to save the language preference.", error);
    }
  }, [language]);

  const t = (text, values) => translate(language, text, values);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
