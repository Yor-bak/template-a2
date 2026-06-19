import type { ThemePaletteKey } from "@/types";
import type { ClinicConfig } from "@/types/clinic";

// Alias semántico: el "especialista" es la entidad principal del sistema de templates
export type Specialist = ClinicConfig;

export interface SpecialistPublicProfile {
  clinicName: string;
  dentistName: string;
  professionalLicense: string;
  specialty: string;
  yearsExperience: number;
  patientsServed: number;
  shortDescription: string;
  address: string;
  city?: string;
  phone: string;
  whatsapp: string;
  email: string;
  themePalette: ThemePaletteKey;
  selectedTemplate: string; // e.g. "template-01"
}
