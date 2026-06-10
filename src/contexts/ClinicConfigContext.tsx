"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ClinicConfig } from "@/types/clinic";
import { DEFAULT_CLINIC_CONFIG } from "@/data/mockClinicConfig";

const STORAGE_KEY = "ds_clinic_config";

interface ClinicConfigContextValue {
  config: ClinicConfig;
  saveConfig: (partial: Partial<ClinicConfig>) => void;
  isLoaded: boolean;
}

const ClinicConfigContext = createContext<ClinicConfigContextValue | null>(null);

export function ClinicConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ClinicConfig>(DEFAULT_CLINIC_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ClinicConfig>;
        setConfig((c) => ({ ...c, ...parsed }));
      }
    } catch {
      // fallback to default
    }
    setIsLoaded(true);
  }, []);

  function saveConfig(partial: Partial<ClinicConfig>) {
    setConfig((current) => {
      const next: ClinicConfig = { ...current, ...partial, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable
      }
      return next;
    });
  }

  return (
    <ClinicConfigContext.Provider value={{ config, saveConfig, isLoaded }}>
      {children}
    </ClinicConfigContext.Provider>
  );
}

export function useClinicConfig() {
  const ctx = useContext(ClinicConfigContext);
  if (!ctx) throw new Error("useClinicConfig must be used inside ClinicConfigProvider");
  return ctx;
}
