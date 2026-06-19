import { apiFetch } from "./client";
import type { ClinicConfig } from "@/types/clinic";

export type ClinicPublicResponse = Partial<ClinicConfig> & {
  id: string;
  clinicName: string;
  publicPageStatus: string;
};

export async function getPublicClinic(clinicId: string): Promise<ClinicPublicResponse> {
  return apiFetch<ClinicPublicResponse>(`/public/${clinicId}/clinic`, { public: true });
}
