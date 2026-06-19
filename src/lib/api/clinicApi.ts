import { apiFetch } from "./client";
import type { ClinicConfig, OpeningHour } from "@/types/clinic";

/** Shape the backend returns for admin clinic (camelCase, includes isPremium). */
export interface ClinicAdminResponse extends Omit<ClinicConfig, "plan"> {
  isPremium: boolean;
  openingHours: OpeningHour[];
}

export async function getAdminClinic(): Promise<ClinicAdminResponse> {
  return apiFetch<ClinicAdminResponse>("/admin/clinic");
}

export async function updateAdminClinic(data: Partial<ClinicConfig>): Promise<ClinicAdminResponse> {
  return apiFetch<ClinicAdminResponse>("/admin/clinic", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
