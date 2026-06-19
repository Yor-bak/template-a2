import { apiFetch } from "./client";
import type { Service } from "@/types";

/** Map a backend service response (camelCase) to the frontend Service type. */
function mapService(raw: Record<string, unknown>): Service {
  return {
    id: raw.id as string,
    slug: raw.slug as string,
    name: raw.name as string,
    shortDescription: (raw.shortDescription as string) ?? "",
    fullDescription: (raw.fullDescription as string) ?? "",
    durationMinutes: (raw.durationMinutes as number) ?? 60,
    priceType: (raw.priceType as Service["priceType"]) ?? "from",
    estimatedPrice: raw.estimatedPrice as number | undefined,
    includes: (raw.includes as string[]) ?? [],
    recommendations: (raw.recommendations as string[]) ?? [],
    whenRecommended: (raw.whenRecommended as string) ?? "",
    isEmergency: (raw.isEmergency as boolean) ?? false,
    isActive: (raw.isActive as boolean) ?? true,
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export async function getAdminServices(): Promise<Service[]> {
  const raw = await apiFetch<Record<string, unknown>[]>("/admin/services");
  return raw.map(mapService);
}

export async function createAdminService(data: Omit<Service, "id" | "createdAt" | "updatedAt">): Promise<Service> {
  const raw = await apiFetch<Record<string, unknown>>("/admin/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapService(raw);
}

export async function updateAdminService(id: string, data: Partial<Omit<Service, "id" | "createdAt">>): Promise<Service> {
  const raw = await apiFetch<Record<string, unknown>>(`/admin/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return mapService(raw);
}

export async function toggleAdminServiceStatus(id: string, isActive: boolean): Promise<Service> {
  const raw = await apiFetch<Record<string, unknown>>(`/admin/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  return mapService(raw);
}

export async function deleteAdminService(id: string): Promise<{ deleted: boolean; deactivated: boolean }> {
  try {
    await apiFetch(`/admin/services/${id}`, { method: "DELETE" });
    return { deleted: true, deactivated: false };
  } catch (err) {
    // Backend returns 204 for both hard-delete and soft-delete.
    // If it throws, re-throw.
    throw err;
  }
}

// ── Public services ────────────────────────────────────────────────────────────

export async function getPublicServices(clinicId: string): Promise<Service[]> {
  const raw = await apiFetch<Record<string, unknown>[]>(`/public/${clinicId}/services`, { public: true });
  return raw.map(mapService);
}

export async function getPublicServiceBySlug(clinicId: string, slug: string): Promise<Service> {
  const raw = await apiFetch<Record<string, unknown>>(`/public/${clinicId}/services/${slug}`, { public: true });
  return mapService(raw);
}
