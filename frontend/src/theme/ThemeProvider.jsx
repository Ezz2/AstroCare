/* eslint-disable react/prop-types */
import { useLayoutEffect, useState } from "react";
import ThemeContext from "./ThemeContext";

const THEME_STORAGE_KEY = "astrocare.theme";
const SUPPORTED_THEMES = ["dark", "light"];

function getSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return SUPPORTED_THEMES.includes(savedTheme) ? savedTheme : "dark";
  } catch (error) {
    console.error("Unable to read the saved theme preference.", error);
    return "dark";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getSavedTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Unable to save the theme preference.", error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
