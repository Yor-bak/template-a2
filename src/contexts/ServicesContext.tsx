"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { services as seedServices } from "@/data/services";
import type { Service, PriceType } from "@/types";
import {
  getAdminServices,
  createAdminService,
  updateAdminService,
  toggleAdminServiceStatus,
  deleteAdminService,
  getPublicServices,
} from "@/lib/api/servicesApi";
import { getAuthToken, ApiError } from "@/lib/api/client";

const PUBLIC_CLINIC_ID = process.env.NEXT_PUBLIC_DEMO_CLINIC_ID ?? "";

// ── Helpers exportados (sin cambios) ─────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function ensureUniqueSlug(
  slug: string,
  services: Service[],
  excludeId?: string
): string {
  const taken = services.filter((s) => s.id !== excludeId).map((s) => s.slug);
  if (!taken.includes(slug)) return slug;
  let i = 2;
  while (taken.includes(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  from: "Desde",
  fixed: "Precio fijo",
  assessment_required: "Requiere valoración",
  hidden: "No mostrar precio",
};

export const PRICE_TYPE_HINTS: Record<PriceType, string> = {
  from: "Úsalo cuando el costo puede variar, pero quieres mostrar un precio inicial.",
  fixed: "Úsalo cuando el servicio siempre cuesta lo mismo.",
  assessment_required: "Úsalo para tratamientos que dependen del diagnóstico.",
  hidden: "Oculta el precio en la página pública.",
};

// ── Context types ─────────────────────────────────────────────────────────────

interface ServicesContextValue {
  services: Service[];
  isLoading: boolean;
  loadError: string | null;
  getPublicServices: () => Service[];
  getActiveServices: () => Service[];
  getEmergencyServices: () => Service[];
  getServiceBySlug: (slug: string) => Service | undefined;
  serviceHasAppointments: (serviceId: string) => boolean;
  createService: (data: Omit<Service, "id" | "createdAt" | "updatedAt">) => Promise<Service>;
  updateService: (id: string, data: Partial<Omit<Service, "id" | "createdAt">>) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<{ deleted: boolean; deactivated: boolean }>;
  reload: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

// ── Seed fallback ─────────────────────────────────────────────────────────────

const now = new Date().toISOString();
const seedInitialized: Service[] = seedServices.map((s) => ({
  ...s,
  createdAt: s.createdAt ?? now,
  updatedAt: s.updatedAt ?? now,
}));

// ── Provider ──────────────────────────────────────────────────────────────────

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(seedInitialized);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const token = getAuthToken();
      if (token) {
        const data = await getAdminServices();
        setServices(data);
      } else if (PUBLIC_CLINIC_ID) {
        const data = await getPublicServices(PUBLIC_CLINIC_ID);
        setServices(data);
      } else {
        console.warn(
          "[Services] No hay NEXT_PUBLIC_DEMO_CLINIC_ID; usando datos mock públicos.\n" +
          "  Para conectar con el backend: agrega NEXT_PUBLIC_DEMO_CLINIC_ID=<clinic_id> en .env.local"
        );
        setServices(seedInitialized);
      }
    } catch (err) {
      console.warn("[Services] Backend unreachable — using mock data:", err);
      setServices(seedInitialized);
      if (err instanceof ApiError && err.status !== 0) {
        setLoadError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Re-load when token clears (logout → switch to public or mock)
  useEffect(() => {
    window.addEventListener("ds:unauthorized", load);
    return () => window.removeEventListener("ds:unauthorized", load);
  }, [load]);

  const getPublicServicesFn = useCallback(() => services.filter((s) => s.isActive), [services]);
  const getActiveServices = useCallback(() => services.filter((s) => s.isActive), [services]);
  const getEmergencyServices = useCallback(() => services.filter((s) => s.isActive && s.isEmergency), [services]);
  const getServiceBySlug = useCallback((slug: string) => services.find((s) => s.slug === slug), [services]);
  const serviceHasAppointments = useCallback((_id: string) => false, []); // real check via backend when appointments phase connects

  const createService = useCallback(async (data: Omit<Service, "id" | "createdAt" | "updatedAt">): Promise<Service> => {
    const created = await createAdminService(data);
    setServices((prev) => [...prev, created]);
    return created;
  }, []);

  const updateService = useCallback(async (id: string, data: Partial<Omit<Service, "id" | "createdAt">>) => {
    const updated = await updateAdminService(id, data);
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    const svc = services.find((s) => s.id === id);
    if (!svc) return;
    const updated = await toggleAdminServiceStatus(id, !svc.isActive);
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, [services]);

  const deleteService = useCallback(async (id: string): Promise<{ deleted: boolean; deactivated: boolean }> => {
    const result = await deleteAdminService(id);
    if (result.deleted) {
      // Backend may have done soft-delete (service still exists but inactive) or hard delete
      // Reload to get accurate state
      await load();
    }
    return result;
  }, [load]);

  return (
    <ServicesContext.Provider value={{
      services,
      isLoading,
      loadError,
      getPublicServices: getPublicServicesFn,
      getActiveServices,
      getEmergencyServices,
      getServiceBySlug,
      serviceHasAppointments,
      createService,
      updateService,
      toggleActive,
      deleteService,
      reload: load,
    }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServices must be used inside ServicesProvider");
  return ctx;
}
