"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { services as seedServices } from "@/data/services";
import { appointments as seedAppointments } from "@/data/appointments";
import type { Service, PriceType } from "@/types";

// ── Helpers exportados ───────────────────────────────────────────────────────

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
  const taken = services
    .filter((s) => s.id !== excludeId)
    .map((s) => s.slug);
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

// ── Contexto ─────────────────────────────────────────────────────────────────

interface ServicesContextValue {
  services: Service[];
  getPublicServices: () => Service[];
  getActiveServices: () => Service[];
  getEmergencyServices: () => Service[];
  getServiceBySlug: (slug: string) => Service | undefined;
  serviceHasAppointments: (serviceId: string) => boolean;
  createService: (data: Omit<Service, "id" | "createdAt" | "updatedAt">) => Service;
  updateService: (id: string, data: Partial<Omit<Service, "id" | "createdAt">>) => void;
  toggleActive: (id: string) => void;
  deleteService: (id: string) => { deleted: boolean; deactivated: boolean };
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

const now = new Date().toISOString();
const initialized: Service[] = seedServices.map((s) => ({
  ...s,
  createdAt: s.createdAt ?? now,
  updatedAt: s.updatedAt ?? now,
}));

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(initialized);

  const getPublicServices = useCallback(
    () => services.filter((s) => s.isActive),
    [services]
  );

  const getActiveServices = useCallback(
    () => services.filter((s) => s.isActive),
    [services]
  );

  const getEmergencyServices = useCallback(
    () => services.filter((s) => s.isActive && s.isEmergency),
    [services]
  );

  const getServiceBySlug = useCallback(
    (slug: string) => services.find((s) => s.slug === slug),
    [services]
  );

  const serviceHasAppointments = useCallback(
    (serviceId: string) =>
      seedAppointments.some((a) => a.serviceId === serviceId),
    []
  );

  const createService = useCallback(
    (data: Omit<Service, "id" | "createdAt" | "updatedAt">): Service => {
      const ts = new Date().toISOString();
      const newService: Service = {
        ...data,
        id: `svc_${Date.now()}`,
        createdAt: ts,
        updatedAt: ts,
      };
      setServices((prev) => [...prev, newService]);
      return newService;
    },
    []
  );

  const updateService = useCallback(
    (id: string, data: Partial<Omit<Service, "id" | "createdAt">>) => {
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...data, updatedAt: new Date().toISOString() }
            : s
        )
      );
    },
    []
  );

  const toggleActive = useCallback((id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const deleteService = useCallback(
    (id: string): { deleted: boolean; deactivated: boolean } => {
      const hasApts = seedAppointments.some((a) => a.serviceId === id);
      if (hasApts) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, isActive: false, updatedAt: new Date().toISOString() }
              : s
          )
        );
        return { deleted: false, deactivated: true };
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
      return { deleted: true, deactivated: false };
    },
    []
  );

  return (
    <ServicesContext.Provider
      value={{
        services,
        getPublicServices,
        getActiveServices,
        getEmergencyServices,
        getServiceBySlug,
        serviceHasAppointments,
        createService,
        updateService,
        toggleActive,
        deleteService,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServices must be used inside ServicesProvider");
  return ctx;
}
