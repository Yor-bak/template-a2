"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ClinicConfig } from "@/types/clinic";
import { DEFAULT_CLINIC_CONFIG } from "@/config/defaultClinicData";
import { getAdminClinic, updateAdminClinic } from "@/lib/api/clinicApi";
import { getPublicClinic } from "@/lib/api/publicApi";
import { getAuthToken, ApiError } from "@/lib/api/client";

const STORAGE_KEY = "ds_clinic_config";
const PUBLIC_CLINIC_ID = process.env.NEXT_PUBLIC_DEMO_CLINIC_ID ?? "";

/** Map backend isPremium boolean → frontend plan tier */
function premiumToPlan(isPremium: boolean): ClinicConfig["plan"] {
  return isPremium ? "premium" : "basic";
}

/** Merge a backend response into a ClinicConfig, filling missing fields from defaults. */
function mergeBackendConfig(
  backendData: Partial<ClinicConfig> & { isPremium?: boolean },
  base: ClinicConfig
): ClinicConfig {
  const merged: ClinicConfig = {
    ...base,
    ...backendData,
    plan: premiumToPlan(backendData.isPremium ?? false),
    updatedAt: backendData.updatedAt ?? new Date().toISOString(),
    createdAt: backendData.createdAt ?? base.createdAt,
  };
  return merged;
}

interface ClinicConfigContextValue {
  config: ClinicConfig;
  saveConfig: (partial: Partial<ClinicConfig>) => Promise<void>;
  isLoaded: boolean;
  isSaving: boolean;
  saveError: string | null;
}

const ClinicConfigContext = createContext<ClinicConfigContextValue | null>(null);

export function ClinicConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ClinicConfig>(DEFAULT_CLINIC_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const token = getAuthToken();

      // ── Admin context: load from backend ─────────────────────────────────
      if (token) {
        try {
          const data = await getAdminClinic();
          setConfig(mergeBackendConfig(data, DEFAULT_CLINIC_CONFIG));
          setIsLoaded(true);
          return;
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            // Token expired — fall through to localStorage
          } else {
            console.warn("[ClinicConfig] Backend unreachable, using localStorage fallback:", err);
          }
        }
      }

      // ── Public context: load from public endpoint ─────────────────────────
      if (!token && PUBLIC_CLINIC_ID) {
        try {
          const data = await getPublicClinic(PUBLIC_CLINIC_ID);
          setConfig(mergeBackendConfig(data, DEFAULT_CLINIC_CONFIG));
          setIsLoaded(true);
          return;
        } catch {
          console.warn("[ClinicConfig] Public backend unreachable, using localStorage/mock fallback.");
        }
      }

      // ── Fallback: localStorage / mock ─────────────────────────────────────
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<ClinicConfig>;
          setConfig((c) => ({ ...c, ...parsed }));
        }
      } catch {
        // ignore
      }
      setIsLoaded(true);
    }

    load();
  }, []);

  // Re-load when auth state changes (token appears/disappears)
  useEffect(() => {
    function handleUnauth() {
      // On logout, reset to public/mock config
      setConfig(DEFAULT_CLINIC_CONFIG);
    }
    window.addEventListener("ds:unauthorized", handleUnauth);
    return () => window.removeEventListener("ds:unauthorized", handleUnauth);
  }, []);

  const saveConfig = useCallback(async (partial: Partial<ClinicConfig>) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const token = getAuthToken();
      if (token) {
        const updated = await updateAdminClinic(partial);
        setConfig(mergeBackendConfig(updated, DEFAULT_CLINIC_CONFIG));
      } else {
        // Offline / no token — save only to localStorage
        setConfig((current) => {
          const next: ClinicConfig = { ...current, ...partial, updatedAt: new Date().toISOString() };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Error al guardar la configuración.";
      setSaveError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <ClinicConfigContext.Provider value={{ config, saveConfig, isLoaded, isSaving, saveError }}>
      {children}
    </ClinicConfigContext.Provider>
  );
}

export function useClinicConfig() {
  const ctx = useContext(ClinicConfigContext);
  if (!ctx) throw new Error("useClinicConfig must be used inside ClinicConfigProvider");
  return ctx;
}
