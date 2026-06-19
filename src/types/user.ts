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

export type CommissionStatus = "pending" | "authorized" | "paid" | "cancelled";

export type ContractDocStatus = "pending_signature" | "signed" | "expired" | "cancelled";

export type TransferType = "opening" | "monthly";

export type TransferStatus = "pending" | "verified" | "rejected" | "refunded";

/** Kept for future use; not exposed in admin forms yet. */
export type ClientType =
  | "dentist"
  | "physiotherapist"
  | "nutritionist"
  | "psychologist"
  | "veterinarian"
  | "other";

// ── Nested entities ───────────────────────────────────────────────────────────

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

export interface BusinessInfo {
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

/** @deprecated Use BusinessInfo — kept for legacy imports */
export type ClinicInfo = BusinessInfo;

export interface SalesRep {
  id: string;
  sellerNumber: string;          // VEN-0001, VEN-0002, …
  name: string;
  phone?: string;
  active: boolean;
  fixedCommissionAmount: number; // fixed amount per verified opening (not percentage)
  createdAt: string;
}

/** @deprecated Use CommissionRecord — kept for data migration compatibility */
export interface SaleRecord {
  id: string;
  clientId: string;
  clientNumber: string;
  businessName: string;
  salesRepId: string;
  sellerNumber: string;
  saleDate: string;
  contractAmount: number;
  commissionStatus: CommissionStatus;
  paymentStatus: PaymentStatus;
  fortnightId: string;
  transferReference?: string;
  transferDate?: string;
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  salesRepId: string;
  sellerNumber: string;
  transferId: string;
  clientId: string;
  clientNumber: string;
  businessName: string;     // denormalized for display
  amount: number;           // fixed amount from SalesRep.fixedCommissionAmount
  status: CommissionStatus;
  generatedAt: string;
  authorizedAt?: string;
  paidAt?: string;
  paidTransferRef?: string;
  paidTransferDate?: string;
  fortnightId: string;
}

export interface TransferRecord {
  id: string;
  referenceNumber: string;   // unique bank reference
  transferDate: string;      // YYYY-MM-DD
  amount: number;
  type: TransferType;
  status: TransferStatus;

  // Opening transfer fields
  sellerId?: string;
  sellerNumber?: string;
  sellerName?: string;              // denormalized for display
  fixedCommissionAmount?: number;   // captured at registration time from SalesRep
  prospectName?: string;
  prospectPhone?: string;
  prospectiveBusinessName?: string;

  // Set after verification (opening)
  clientId?: string;
  clientNumber?: string;

  // Monthly transfer fields
  specialistId?: string;    // AdminClient.id
  paymentMonth?: string;    // matches MonthlyPayment.monthLabel

  // Common
  receiptUrl?: string;
  internalNotes?: string;
  createdAt: string;
  verifiedAt?: string;
  rejectedAt?: string;
}

export interface Fortnight {
  id: string;             // "YYYY-MM-H" e.g. "2026-06-1"
  year: number;
  month: number;          // 1–12
  half: 1 | 2;           // 1 = days 1–15, 2 = days 16–lastDay
  label: string;
  closed: boolean;
  closedAt?: string;
  closedBy?: string;
}

export interface MonthlyPayment {
  id: string;
  monthLabel: string;
  dueDate: string;
  status: MonthlyPaymentStatus;
  paidAt?: string;
  amount?: number;
  transferReference?: string;
  transferDate?: string;
  transferId?: string;           // links to TransferRecord
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
    | "business_logo"
    | "professional_license"
    | "other";
  url?: string;
  uploadedAt?: string;
}

export interface ClientContractDocument {
  id: string;
  clientId: string;
  fileName: string;
  fileType: string;
  fileUrl?: string;
  status: ContractDocStatus;
  signedAt?: string;
  startDate: string;
  endDate: string;
  version: number;
  uploadedAt: string;
}

// ── Main entity ───────────────────────────────────────────────────────────────

export interface AdminClient {
  id: string;
  clientNumber: string;

  specialist: SpecialistInfo;
  /** Business/consultorio data (formerly "clinic") */
  business: BusinessInfo;

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
  /** Denormalized for display */
  salesRepName?: string;
  /** Denormalized seller number */
  sellerNumber?: string;
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
  contracts: ClientContractDocument[];

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
