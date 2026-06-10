export type PregnancyStatus = "yes" | "no" | "not_applicable" | "unknown";

export type ClinicalNoteType = "consultation" | "treatment" | "follow_up" | "general";

export interface ClinicalHistory {
  id: string;
  clinicId: string;
  patientId: string;

  // Medical background
  allergies?: string;
  currentMedications?: string;
  chronicDiseases?: string;
  previousSurgeries?: string;
  pregnancyStatus?: PregnancyStatus;
  bleedingProblems?: string;
  anesthesiaReactions?: string;

  // Dental background
  dentalReason?: string;
  dentalPainLevel?: number; // 0–10
  lastDentalVisit?: string;
  oralHygieneNotes?: string;

  observations?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ClinicalNote {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string;

  noteType: ClinicalNoteType;
  title: string;
  description: string;
  treatmentPerformed?: string;
  recommendations?: string;
  nextVisitSuggestion?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const NOTE_TYPE_LABELS: Record<ClinicalNoteType, string> = {
  consultation: "Consulta",
  treatment:    "Tratamiento",
  follow_up:    "Seguimiento",
  general:      "General",
};

export const PREGNANCY_LABELS: Record<PregnancyStatus, string> = {
  yes:            "Sí",
  no:             "No",
  not_applicable: "No aplica",
  unknown:        "Desconocido",
};
