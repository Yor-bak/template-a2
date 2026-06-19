export type UserRole = "admin" | "specialist";

export type UserPlan = "free" | "pro";

export type PaymentStatus =
  | "paid"
  | "unpaid"
  | "pending"
  | "grace_period"
  | "overdue"
  | "cancelled";

export type ClientStatus =
  | "active"
  | "inactive"
  | "trial"
  | "suspended"
  | "cancelled";

export type ContractType = "six_months" | "one_year";

export type MonthlyPaymentStatus = "paid" | "unpaid" | "pending" | "overdue";

export type PublicPageStatus = "published" | "hidden";

export type OnboardingStatus = "not_started" | "in_progress" | "ready";

export type ClientType =
  | "dentist"
  | "physiotherapist"
  | "nutritionist"
  | "psychologist"
  | "veterinarian"
  | "other";

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

export interface AdminClient {
  id: string;
  clientNumber: string;

  clinicName: string;
  specialistName: string;
  clientType: ClientType;

  phone: string;
  clinicAddress: string;
  googleMapsUrl?: string;

  slug: string;
  subdomain: string;

  plan: UserPlan;
  isPro: boolean;

  paymentStatus: PaymentStatus;
  clientStatus: ClientStatus;
  accessActive: boolean;

  publicPageStatus: PublicPageStatus;

  contractType: ContractType;
  activationDate: string;
  contractEndDate: string;

  monthlyAmount?: number;
  paymentHistory: MonthlyPayment[];

  onboardingStatus: OnboardingStatus;
  onboardingChecklist: OnboardingChecklist;

  assignedTo?: string;
  internalNotes?: string;

  activityLog: ActivityLogItem[];
  documents: ClientDocument[];

  createdAt: string;
  updatedAt?: string;
  lastPaymentAt?: string;
  nextPaymentDueAt?: string;
}

// Legacy — kept for contexts that still reference it
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
