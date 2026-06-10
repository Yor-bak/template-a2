"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  type ThemePaletteKey,
  applyThemePalette,
} from "@/theme/palettes";

const STORAGE_KEY = "ds_theme_palette";
const DEFAULT_PALETTE: ThemePaletteKey = "dental_premium";

interface ThemeContextValue {
  selectedPalette: ThemePaletteKey;
  setPalette: (key: ThemePaletteKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<ThemePaletteKey>(DEFAULT_PALETTE);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemePaletteKey | null) ?? DEFAULT_PALETTE;
    setSelected(saved);
    applyThemePalette(saved);
  }, []);

  function setPalette(key: ThemePaletteKey) {
    setSelected(key);
    applyThemePalette(key);
    localStorage.setItem(STORAGE_KEY, key);
  }

  return (
    <ThemeContext.Provider value={{ selectedPalette: selected, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
