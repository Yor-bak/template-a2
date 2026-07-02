import type { ThemePaletteKey, AutomationMode } from "@/types";

export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "credit_card"
  | "debit_card"
  | "months_without_interest"
  | "insurance"
  | "other";

export interface OpeningHour {
  dayOfWeek: number; // 0=Sunday, 1=Monday, …, 6=Saturday
  dayLabel: string;
  isOpen: boolean;
  blocks: { startTime: string; endTime: string }[];
}

export type PlanTier = "basic" | "pro" | "premium";

export type PublicPageStatus = "draft" | "published";

export interface MessageTemplates {
  appointmentRequestReceived: string;
  appointmentConfirmed: string;
  appointmentCancelled: string;
  appointmentRescheduled: string;
  reminder24h: string;
  emergencyMessage: string;
  outOfHoursMessage: string;
}

export interface ClinicConfig {
  id: string;
  clinicName: string;
  dentistName: string;
  professionalLicense: string;
  specialty: string;
  yearsExperience: number;
  patientsServed: number;
  shortDescription: string;
  welcomeMessage: string;

  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  locationReferences?: string;

  phone: string;
  whatsapp: string;
  email: string;

  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;

  parkingAvailable: boolean;
  parkingDetails?: string;

  acceptsEmergencies: boolean;
  emergencyDescription?: string;
  emergencyPhone?: string;
  emergencyWhatsapp?: string;

  acceptedPayments: PaymentMethod[];
  openingHours: OpeningHour[];

  showPrices: boolean;
  socialMedia?: { facebook?: string; instagram?: string };

  // Publication status
  publicPageStatus: PublicPageStatus;

  // Plan tier
  plan: PlanTier;

  // Images (URL-based for MVP, TODO: real upload)
  logoUrl?: string;
  heroImageUrl?: string;
  dentistPhotoUrl?: string;
  clinicGalleryUrls?: string[];
  beforeAfterGalleryUrls?: string[];

  // SEO local
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoCity?: string;
  seoNeighborhood?: string;
  seoMainServices?: string[];

  // Message templates (for n8n / WhatsApp AI)
  messageTemplates?: Partial<MessageTemplates>;

  // Multi-tenant (prepared, not yet implemented)
  subdomain?: string;
  customDomain?: string;

  themePalette: ThemePaletteKey;

  // Feature flags — per-business module toggles
  features?: {
    clinicalHistory?: boolean; // default true for existing clinics
  };

  automationEnabled: boolean;
  automationMode: AutomationMode;
  n8nWebhookUrl?: string | null;

  createdAt: string;
  updatedAt: string;
}
