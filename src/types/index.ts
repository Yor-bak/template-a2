export type PriceType = "from" | "fixed" | "assessment_required" | "hidden";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus = "unpaid" | "paid" | "partial" | "courtesy";

export type PreferredContact = "whatsapp" | "call" | "email";

/** Cómo se originó la cita */
export type AppointmentSource = "public_web" | "manual" | "ai_whatsapp";

/** Quién creó la cita */
export type AppointmentCreatedBy = "patient" | "dentist" | "ai";

/** Plan del consultorio */
export type ClinicPlan = "manual" | "ai_whatsapp";

/** Metadata de conversación IA (solo para source = ai_whatsapp) */
export interface AIMetadata {
  conversationId?: string;
  summary?: string;
  confidence?: number;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  durationMinutes: number;
  priceType: PriceType;
  estimatedPrice?: number;
  includes?: string[];
  recommendations?: string[];
  whenRecommended?: string;
  isEmergency: boolean;
  isActive: boolean;
  icon: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  firstVisitAt: string;
  notes?: string;
  totalAppointments: number;
  totalSpent: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  serviceId: string;
  serviceName: string;
  durationMinutes?: number;
  desiredDate: string;
  desiredTime: string;
  reason: string;
  isEmergency: boolean;
  isFirstVisit: boolean;
  preferredContact: PreferredContact;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  estimatedAmount?: number;
  chargedAmount?: number;
  paidAt?: string;
  internalNotes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  additionalComments?: string;
  /** Origen de la cita */
  source: AppointmentSource;
  /** Quién creó la cita */
  createdBy: AppointmentCreatedBy;
  /** Metadata de IA (solo cuando source = ai_whatsapp) */
  aiMetadata?: AIMetadata;
}

export interface StatusHistoryEntry {
  id: string;
  oldStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

export interface Clinic {
  name: string;
  dentistName: string;
  professionalLicense: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  googleMapsUrl: string;
  googleMapsEmbed: string;
  welcomeMessage: string;
  showPrices: boolean;
  openingHours: OpeningHours[];
  socialMedia: SocialMedia;
  parkingAvailable: boolean;
  parkingNotes?: string;
  locationReferences?: string;
  /** Plan activo del consultorio */
  plan: ClinicPlan;
}

export interface OpeningHours {
  days: string;
  hours: string;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  service?: string;
  initials: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface DashboardSummary {
  todayAppointments: number;
  todayPending: number;
  todayConfirmed: number;
  todayCancelled: number;
  todayCompleted: number;
  todayEstimatedIncome: number;
  todayConfirmedIncome: number;
  monthTotal: number;
  monthCompleted: number;
  monthCancelled: number;
  monthNoShow: number;
  monthIncome: number;
  monthNewPatients: number;
  monthRecurringPatients: number;
  topServices: { name: string; count: number }[];
}

/** Payload que envía n8n / IA WhatsApp para crear una cita */
export interface WhatsAppAIPayload {
  patient: {
    name: string;
    phone: string;
    email?: string;
  };
  appointment: {
    serviceId: string;
    date: string;
    time: string;
    reason: string;
    isEmergency: boolean;
    isFirstVisit: boolean;
    preferredContactMethod: PreferredContact;
  };
  aiMetadata?: {
    conversationId?: string;
    summary?: string;
    confidence?: number;
  };
}
