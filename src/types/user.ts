export type UserRole = "admin" | "specialist";

/** All plans are paid. "standard" = base, "pro" = premium. */
export type UserPlan = "standard" | "cowork" | "intelligence";

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

export type CommissionStatus = "waiting_first_monthly_payment" | "pending" | "authorized" | "paid" | "cancelled";

export type ContractDocStatus = "pending_signature" | "signed" | "expired" | "cancelled";

export type TransferType = "opening" | "monthly" | "unidentified";

export type TransferStatus =
  | "pending"
  | "pending_activation"
  | "activation_error"
  | "verified"
  | "rejected"
  | "refunded";

/** Kept for future use; not exposed in admin forms yet. */
export type ClientType =
  | "dentist"
  | "physiotherapist"
  | "nutritionist"
  | "psychologist"
  | "veterinarian"
  | "other";

export type BusinessType =
  | "dentist"
  | "doctor"
  | "physiotherapist"
  | "nutritionist"
  | "psychologist"
  | "veterinarian"
  | "gym"
  | "other";

export type PreClientStatus =
  | "awaiting_payment"
  | "converted"
  | "discarded";

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

export interface PreClient {
  id: string;
  preClientNumber: string;
  specialistName: string;
  phone: string;
  businessName?: string;
  businessType?: BusinessType;
  sellerId?: string;
  sellerNumber?: string;
  status: PreClientStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  convertedClientId?: string;
  convertedAt?: string;
}

export interface BusinessInfo {
  businessType?: BusinessType;
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
  bankName?: string;             // bank name for commission payments
  accountNumber?: string;        // account number for commission payments
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
  amount: number;
  status: CommissionStatus;
  generatedAt: string;
  authorizedAt?: string;
  paidAt?: string;
  paidTransferRef?: string;
  paidTransferDate?: string;
  fortnightId: string;
  commissionType?: string;       // "opening" | "first_monthly_payment" | ...
  description?: string;          // human-readable concept
  monthlyPeriodId?: string;      // links to MonthlyPaymentPeriod.id
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
  preClientId?: string;

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

export interface ActivationInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  businessName: string;
  businessType: BusinessType;
  plan: UserPlan;
  monthlyAmount: number;
  contractType: ContractType;
  activationDate: string;
  slug: string;
  ownerEmail?: string;
  firstMonthlyPaymentGeneratesCommission?: boolean;
  // Access credentials
  accessPhone?: string;          // if different from business phone
  initialPassword?: string;      // set during activation
  mustChangePassword?: boolean;  // default true
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

export interface PaymentInstallment {
  id: string;
  amount: number;
  date: string;
  method?: string;
  reference?: string;
  transferId?: string;
}

export interface MonthlyPaymentPeriod {
  id: string;
  clientId: string;
  period: string;            // "2026-06"
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "pending" | "partial" | "paid" | "overdue";
  installments: PaymentInstallment[];
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
  fileSize?: number;      // bytes
  storageKey?: string;    // key in contractFileStorage (IndexedDB)
  uploadedBy?: string;
}

// ── Main entity ───────────────────────────────────────────────────────────────

export interface AdminClient {
  id: string;
  clientNumber: string;
  businessType?: BusinessType;

  specialist: SpecialistInfo;
  /** Business/consultorio data (formerly "clinic") */
  business: BusinessInfo;

  slug: string;
  subdomain: string;

  plan: UserPlan;
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

  /** Normalized phone used for panel login (digits only) */
  accessPhone?: string;
  /** Client must change password on next login */
  mustChangePassword?: boolean;
  /** ISO timestamp of last successful login */
  lastAccessAt?: string;

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

  firstMonthlyPaymentGeneratesCommission?: boolean;
  firstMonthlyCommissionGenerated?: boolean;
  firstMonthlyCommissionId?: string;

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
  paymentStatus: "paid" | "pending" | "overdue" | "free";
  createdAt: string;
  updatedAt: string;
}

// ── Finance module types ───────────────────────────────────────────────────────

export type FixedExpenseFrequency = "monthly" | "bimonthly" | "quarterly" | "annual";
export type FixedExpenseStatus = "pending" | "paid" | "overdue";
export type OtherIncomeCategory = "customization" | "installation" | "training" | "extraordinary" | "other";
export type OtherExpenseCategory = "equipment" | "advertising" | "repair" | "refund" | "extraordinary" | "other";
export type PaymentMethod = "transfer" | "cash" | "card" | "check" | "other";

export interface FixedExpensePayment {
  id: string;
  paidAt: string;
  amount: number;
  method?: PaymentMethod;
  reference?: string;
  note?: string;
}

export interface MonthlyFixedExpense {
  id: string;
  name: string;
  category?: string;
  description?: string;
  amount: number;
  frequency: FixedExpenseFrequency;
  nextDueDate?: string;
  status: FixedExpenseStatus;
  active: boolean;
  startDate: string;
  endDate?: string;
  paymentHistory: FixedExpensePayment[];
  createdAt: string;
  updatedAt?: string;
}

export type FinancialMovementType = "other_income" | "other_expense";

export interface OtherFinancialMovement {
  id: string;
  type: FinancialMovementType;
  name: string;
  category?: string;
  description?: string;
  amount: number;
  movementDate: string;
  method?: PaymentMethod;
  reference?: string;
  createdAt: string;
}

export interface BankAccountConfig {
  id: string;
  bank: string;
  accountHolder: string;
  accountNumber: string;
  clabe: string;
  cardNumber?: string;
  requiredConcept?: string;
  paymentInstructions?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyTaxRecord {
  id: string;
  year: number;
  month: number;
  taxPercentage: number;
  taxableBase: number;
  estimatedTaxAmount: number;
  actualPaidAmount?: number;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type InvoiceStatus = "not_required" | "pending" | "issued" | "cancelled";

export interface InvoiceRecord {
  id: string;
  clientId: string;
  transferId?: string;
  requiresInvoice: boolean;
  status: InvoiceStatus;
  invoiceNumber?: string;
  fiscalFolio?: string;
  issuedAt?: string;
  cancelledAt?: string;
  invoicedAmount?: number;
  pdfUrl?: string;
  xmlUrl?: string;
  notes?: string;
  createdAt: string;
}

export type ReconciliationStatus = "unmatched" | "matched" | "difference" | "ignored";

export interface BankMovement {
  id: string;
  movementDate: string;
  description: string;
  reference?: string;
  amount: number;
  direction: "income" | "expense";
  reconciliationStatus: ReconciliationStatus;
  relatedTransferId?: string;
  relatedCommissionId?: string;
  relatedExpenseId?: string;
  relatedTaxId?: string;
  relatedFinancialMovementId?: string;
  notes?: string;
  createdAt: string;
}

export type MonthlyCloseStatus = "open" | "closed" | "reopened";

export interface MonthlyCloseRecord {
  id: string;
  year: number;
  month: number;
  status: MonthlyCloseStatus;
  closedAt?: string;
  reopenedAt?: string;
  closedBy?: string;
  reopenedBy?: string;
  reopenReason?: string;
  notes?: string;
}

export interface FinancialLogItem {
  id: string;
  date: string;
  action: string;
  entity?: string;
  detail?: string;
  previousValue?: string;
  newValue?: string;
  actor: string;
}
