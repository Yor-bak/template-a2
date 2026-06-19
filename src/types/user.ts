export type UserRole = "admin" | "specialist";

/** All plans are paid. "standard" = base, "pro" = premium. */
export type UserPlan = "standard" | "pro";

export type PaymentStatus =
  | "paid"
  | "unpaid"
  | "pending"
  | "grace_period"
  | "overdue"
  | "cancelled";

export type ClientStatus = "active" | "suspended" | "cancelled";

export type ContractType = "six_months" | "one_year";

export type MonthlyPaymentStatus = "paid" | "unpaid" | "pending" | "overdue";

export type PublicPageStatus = "published" | "hidden";

export type OnboardingStatus = "not_started" | "in_progress" | "ready";

/** Kept for future use; not exposed in admin forms yet. */
export type ClientType =
  | "dentist"
  | "physiotherapist"
  | "nutritionist"
  | "psychologist"
  | "veterinarian"
  | "other";

// ── Nested entities (future DB tables) ───────────────────────────────────────

export interface SpecialistInfo {
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal?: string;
  /** Display name shown publicly, e.g. "Dra. Mariana López" */
  publicName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  shortDescription?: string;
  bio?: string;
}

export interface ClinicInfo {
  name: string;
  commercialName?: string;
  street?: string;
  exteriorNumber?: string;
  interiorNumber?: string;
  colony?: string;
  municipality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  googleMapsUrl?: string;
  phone?: string;
  whatsapp?: string;
}

export interface SalesRep {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
}

export interface MonthlyPayment {
  id: string;
  monthLabel: string;
  dueDate: string;
  status: MonthlyPaymentStatus;
  paidAt?: string;
  amount?: number;
}

export interface OnboardingChecklist {
  basicData: boolean;
  services: boolean;
  address: boolean;
  paymentMethods: boolean;
  templateSelected: boolean;
  colorsSelected: boolean;
  testimonials: boolean;
}

export interface ActivityLogItem {
  id: string;
  date: string;
  action: string;
  detail?: string;
  actor?: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type:
    | "payment_receipt"
    | "signed_contract"
    | "clinic_logo"
    | "professional_license"
    | "other";
  url?: string;
  uploadedAt?: string;
}

// ── Main entity ───────────────────────────────────────────────────────────────

export interface AdminClient {
  id: string;
  clientNumber: string;

  /** Future: specialists table */
  specialist: SpecialistInfo;
  /** Future: clinics table */
  clinic: ClinicInfo;

  slug: string;
  subdomain: string;

  plan: UserPlan;
  isPro: boolean;
  paymentStatus: PaymentStatus;
  clientStatus: ClientStatus;
  accessActive: boolean;
  publicPageStatus: PublicPageStatus;

  /** FK to SalesRep.id */
  salesRepId?: string;
  /** Denormalized for display without joins */
  salesRepName?: string;
  /** Internal support/account owner (free text) */
  assignedTo?: string;

  contractType: ContractType;
  activationDate: string;
  contractEndDate: string;
  monthlyAmount?: number;
  paymentHistory: MonthlyPayment[];

  onboardingStatus: OnboardingStatus;
  onboardingChecklist: OnboardingChecklist;

  internalNotes?: string;
  activityLog: ActivityLogItem[];
  documents: ClientDocument[];

  createdAt: string;
  updatedAt?: string;
  lastPaymentAt?: string;
  nextPaymentDueAt?: string;
}

// ── Legacy ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  isActive: boolean;
  isPro: boolean;
  paymentStatus: "paid" | "pending" | "overdue" | "free";
  createdAt: string;
  updatedAt: string;
}
