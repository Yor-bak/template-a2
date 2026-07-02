"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  AdminClient,
  UserPlan,
  PaymentStatus,
  ClientStatus,
  ContractType,
  MonthlyPayment,
  MonthlyPaymentStatus,
  PublicPageStatus,
  OnboardingChecklist,
  OnboardingStatus,
  ActivityLogItem,
  ClientDocument,
  ClientContractDocument,
  ContractDocStatus,
  SpecialistInfo,
  BusinessInfo,
  SalesRep,
  Fortnight,
  CommissionStatus,
  CommissionRecord,
  TransferRecord,
  TransferStatus,
  TransferType,
  BusinessType,
  PreClientStatus,
  PreClient,
  ActivationInput,
  MonthlyFixedExpense,
  FixedExpensePayment,
  FixedExpenseFrequency,
  FixedExpenseStatus,
  OtherFinancialMovement,
  PaymentMethod,
  MonthlyTaxRecord,
  InvoiceRecord,
  InvoiceStatus,
  BankMovement,
  ReconciliationStatus,
  MonthlyCloseRecord,
  MonthlyCloseStatus,
  FinancialLogItem,
  BankAccountConfig,
} from "@/types/user";
import type { AdminRole, Permission } from "@/lib/adminPermissions";
import { hasPermission } from "@/lib/adminPermissions";

// ── Auth ──────────────────────────────────────────────────────────────────────

import { loginAdminUser, type AdminUser } from "@/lib/adminUsers";

interface AdminAuthValue {
  isAuthenticated: boolean;
  role: AdminRole;
  displayName: string;
  currentUser: AdminUser | null;
  can: (permission: Permission) => boolean;
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthCtx = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRoleState] = useState<AdminRole>("admin");
  const [displayName, setDisplayName] = useState("Admin J2EC");
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const login = useCallback((identifier: string, password: string) => {
    // Phone-based login via the central adminUsers store — single source of truth
    // for Superadmin (hidden), Admin and Contador.
    const result = loginAdminUser(identifier, password);
    if (result) {
      setIsAuthenticated(true);
      setRoleState(result.user.role);
      setDisplayName(`${result.user.firstName} ${result.user.lastName}`);
      setCurrentUser(result.user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setRoleState("admin");
    setDisplayName("Admin J2EC");
    setCurrentUser(null);
  }, []);

  const can = useCallback(
    (permission: Permission) =>
      hasPermission(role, permission, currentUser?.permissions as { granted?: Permission[]; revoked?: Permission[] } | undefined),
    [role, currentUser],
  );

  return (
    <AdminAuthCtx.Provider value={{ isAuthenticated, role, displayName, currentUser, can, login, logout }}>
      {children}
    </AdminAuthCtx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthCtx);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
}

// ── Label maps ────────────────────────────────────────────────────────────────

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  six_months: "6 meses",
  one_year: "1 año",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Pagado",
  unpaid: "No pagado",
  pending: "Pendiente",
  grace_period: "Periodo de gracia",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  suspended: "Suspendido",
  cancelled: "Cancelado",
};

export const PLAN_LABELS: Record<UserPlan, string> = {
  standard:     "Standard",
  cowork:       "Cowork",
  intelligence: "Intelligence",
};

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  not_started: "Sin configurar",
  in_progress: "En proceso",
  ready: "Lista",
};

export const DOC_TYPE_LABELS: Record<ClientDocument["type"], string> = {
  payment_receipt: "Comprobante de pago",
  signed_contract: "Contrato firmado",
  business_logo: "Logo del negocio",
  professional_license: "Cédula profesional",
  other: "Otro",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  waiting_first_monthly_payment: "Esp. 1ª mensualidad",
  pending: "Pendiente",
  authorized: "Autorizada",
  paid: "Pagada",
  cancelled: "Cancelada",
};

export const CONTRACT_DOC_STATUS_LABELS: Record<ContractDocStatus, string> = {
  pending_signature: "Pend. firma",
  signed: "Firmado",
  expired: "Vencido",
  cancelled: "Cancelado",
};

export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  opening:      "Apertura",
  monthly:      "Mensualidad",
  unidentified: "Sin identificar",
};

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  pending:            "Pendiente",
  pending_activation: "Pend. activación",
  activation_error:   "Error activación",
  verified:           "Verificada",
  rejected:           "Rechazada",
  refunded:           "Reembolsada",
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  dentist:         "Dentista",
  doctor:          "Médico",
  physiotherapist: "Fisioterapeuta",
  nutritionist:    "Nutriólogo/a",
  psychologist:    "Psicólogo/a",
  veterinarian:    "Veterinario/a",
  gym:             "Gimnasio",
  other:           "Otro",
};

export const PRE_CLIENT_STATUS_LABELS: Record<PreClientStatus, string> = {
  awaiting_payment: "Esperando pago",
  converted: "Convertido",
  discarded: "Descartado",
};

export const MX_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán",
  "Zacatecas",
];

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function buildSubdomain(slug: string): string {
  return `${slug}.templatea2.com`;
}

export function generateClientNumber(existing: AdminClient[]): string {
  const max = existing.reduce((acc, c) => {
    const n = parseInt(c.clientNumber.replace("TA2-", ""), 10);
    return isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `TA2-${String(max + 1).padStart(4, "0")}`;
}

export function generateSellerNumber(existing: SalesRep[]): string {
  const max = existing.reduce((acc, r) => {
    const n = parseInt(r.sellerNumber.replace("VEN-", ""), 10);
    return isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `VEN-${String(max + 1).padStart(4, "0")}`;
}

export function generatePreClientNumber(existing: PreClient[]): string {
  const max = existing.reduce((acc, p) => {
    const n = parseInt(p.preClientNumber.replace("PRE-", ""), 10);
    return isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `PRE-${String(max + 1).padStart(4, "0")}`;
}

export function generateContractEndDate(
  activationDate: string,
  contractType: ContractType
): string {
  const start = new Date(activationDate + "T00:00:00");
  const months = contractType === "one_year" ? 12 : 6;
  const end = new Date(start.getFullYear(), start.getMonth() + months, 0);
  return end.toISOString().split("T")[0];
}

export function getLastDayOfMonth(year: number, month: number): number {
  // new Date(year, month, 0) returns the last day of month (month is 1-based here)
  return new Date(year, month, 0).getDate();
}

export function getFortnightId(date: string): string {
  const d = new Date(date + "T00:00:00");
  const half = d.getDate() <= 15 ? 1 : 2;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${half}`;
}

export function getFortnightLabel(date: string): string {
  const d = new Date(date + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-based
  const half = d.getDate() <= 15 ? 1 : 2;
  const lastDay = getLastDayOfMonth(year, month);
  const range = half === 1 ? "1–15" : `16–${lastDay}`;
  const monthName = d.toLocaleDateString("es-MX", { month: "long" });
  return `${half === 1 ? "1a" : "2a"} quincena de ${monthName} ${year} (${range})`;
}

/** Returns the fortnight ID for today's date (system date). */
export function getCurrentFortnight(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const half = today.getDate() <= 15 ? 1 : 2;
  return `${y}-${String(m).padStart(2, "0")}-${half}`;
}

/** Returns { start, end } date strings for a given fortnight ID. */
export function getFortnightRange(fortnightId: string): { start: string; end: string } {
  const [y, m, h] = fortnightId.split("-").map(Number);
  const start = h === 1 ? `${y}-${String(m).padStart(2, "0")}-01` : `${y}-${String(m).padStart(2, "0")}-16`;
  const lastDay = getLastDayOfMonth(y, m);
  const end = h === 1 ? `${y}-${String(m).padStart(2, "0")}-15` : `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

/** Returns total authorized (unpaid) commission debt for a fortnight. */
export function getFortnightDebt(fortnightId: string, commissions: CommissionRecord[]): number {
  return commissions
    .filter((c) => c.fortnightId === fortnightId && c.status === "authorized")
    .reduce((sum, c) => sum + c.amount, 0);
}

/** Returns fortnight IDs to show in the main view: current + previous ones with debt. */
export function getVisibleFortnights(fortnights: Fortnight[], commissions: CommissionRecord[]): string[] {
  const current = getCurrentFortnight();
  const visible = new Set<string>([current]);
  for (const f of fortnights) {
    if (f.id === current) continue;
    if (getFortnightDebt(f.id, commissions) > 0) {
      visible.add(f.id);
    }
  }
  return Array.from(visible).sort((a, b) => b.localeCompare(a));
}

/** Returns all fortnight IDs sorted newest-first, for the history view. */
export function getHistoricalFortnights(fortnights: Fortnight[]): string[] {
  return fortnights
    .map((f) => f.id)
    .sort((a, b) => b.localeCompare(a));
}

/** Returns commissions for a specific seller in a specific fortnight. */
export function getSellerFortnightCommissions(
  sellerId: string,
  fortnightId: string,
  commissions: CommissionRecord[]
): CommissionRecord[] {
  return commissions.filter((c) => c.salesRepId === sellerId && c.fortnightId === fortnightId);
}

/** Returns total authorized (unpaid) debt for a seller in a specific fortnight. */
export function getSellerFortnightDebt(
  sellerId: string,
  fortnightId: string,
  commissions: CommissionRecord[]
): number {
  return commissions
    .filter((c) => c.salesRepId === sellerId && c.fortnightId === fortnightId && c.status === "authorized")
    .reduce((sum, c) => sum + c.amount, 0);
}

/** Returns fortnightIds to show for a seller: current + previous with authorized debt. */
export function getVisibleSellerFortnights(
  sellerId: string,
  commissions: CommissionRecord[]
): string[] {
  const current = getCurrentFortnight();
  const visible = new Set<string>([current]);
  const sellerComms = commissions.filter((c) => c.salesRepId === sellerId);
  const fortnightIds = new Set(sellerComms.map((c) => c.fortnightId));
  for (const fid of fortnightIds) {
    if (fid === current) continue;
    const debt = sellerComms
      .filter((c) => c.fortnightId === fid && c.status === "authorized")
      .reduce((sum, c) => sum + c.amount, 0);
    if (debt > 0) visible.add(fid);
  }
  return Array.from(visible).sort((a, b) => b.localeCompare(a));
}

/** Returns all fortnightIds for a seller's history (includes current), sorted newest-first. */
export function getSellerFortnightHistory(
  sellerId: string,
  commissions: CommissionRecord[]
): string[] {
  const current = getCurrentFortnight();
  const ids = new Set(commissions.filter((c) => c.salesRepId === sellerId).map((c) => c.fortnightId));
  ids.add(current);
  return Array.from(ids).sort((a, b) => b.localeCompare(a));
}

// ── Financial helpers ─────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

/** Verified opening transfers for a year, optionally filtered by month (uses verifiedAt). */
export function getVerifiedOpeningIncome(
  transfers: TransferRecord[],
  year: number,
  month?: number
): TransferRecord[] {
  return transfers.filter((t) => {
    if (t.type !== "opening" || t.status !== "verified" || !t.verifiedAt) return false;
    const d = new Date(t.verifiedAt);
    if (d.getFullYear() !== year) return false;
    if (month !== undefined && d.getMonth() + 1 !== month) return false;
    return true;
  });
}

/** Verified monthly transfers for a year, optionally filtered by month (uses verifiedAt). */
export function getVerifiedMonthlyIncome(
  transfers: TransferRecord[],
  year: number,
  month?: number
): TransferRecord[] {
  return transfers.filter((t) => {
    if (t.type !== "monthly" || t.status !== "verified" || !t.verifiedAt) return false;
    const d = new Date(t.verifiedAt);
    if (d.getFullYear() !== year) return false;
    if (month !== undefined && d.getMonth() + 1 !== month) return false;
    return true;
  });
}

/** Paid commissions for a year, optionally filtered by month (uses paidAt). */
export function getPaidCommissions(
  commissions: CommissionRecord[],
  year: number,
  month?: number
): CommissionRecord[] {
  return commissions.filter((c) => {
    if (c.status !== "paid" || !c.paidAt) return false;
    const d = new Date(c.paidAt);
    if (d.getFullYear() !== year) return false;
    if (month !== undefined && d.getMonth() + 1 !== month) return false;
    return true;
  });
}

/** Authorized (unpaid) commissions for a year, optionally filtered by month (uses authorizedAt). */
export function getAuthorizedCommissionDebt(
  commissions: CommissionRecord[],
  year: number,
  month?: number
): CommissionRecord[] {
  return commissions.filter((c) => {
    if (c.status !== "authorized" || !c.authorizedAt) return false;
    const d = new Date(c.authorizedAt);
    if (d.getFullYear() !== year) return false;
    if (month !== undefined && d.getMonth() + 1 !== month) return false;
    return true;
  });
}

export interface AnnualFinancialSummary {
  year: number;
  openingIncome: number;
  monthlyIncome: number;
  totalIncome: number;
  paidCommissions: number;
  pendingCommissions: number;
  netAfterCommissions: number;
  openingCount: number;
  monthlyCount: number;
}

export function getAnnualFinancialSummary(
  transfers: TransferRecord[],
  commissions: CommissionRecord[],
  year: number
): AnnualFinancialSummary {
  const openings = getVerifiedOpeningIncome(transfers, year);
  const monthly  = getVerifiedMonthlyIncome(transfers, year);
  const paid     = getPaidCommissions(commissions, year);
  const debt     = getAuthorizedCommissionDebt(commissions, year);

  const openingIncome      = openings.reduce((s, t) => s + t.amount, 0);
  const monthlyIncome      = monthly.reduce((s, t) => s + t.amount, 0);
  const paidCommissions    = paid.reduce((s, c) => s + c.amount, 0);
  const pendingCommissions = debt.reduce((s, c) => s + c.amount, 0);

  return {
    year,
    openingIncome,
    monthlyIncome,
    totalIncome: openingIncome + monthlyIncome,
    paidCommissions,
    pendingCommissions,
    netAfterCommissions: openingIncome + monthlyIncome - paidCommissions,
    openingCount: openings.length,
    monthlyCount: monthly.length,
  };
}

export interface MonthlyFinancialData {
  month: number;
  monthLabel: string;
  openingIncome: number;
  monthlyIncome: number;
  totalIncome: number;
  authorizedCommissions: number;
  paidCommissions: number;
  netAfterCommissions: number;
}

export function getMonthlyFinancialBreakdown(
  transfers: TransferRecord[],
  commissions: CommissionRecord[],
  year: number
): MonthlyFinancialData[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month   = i + 1;
    const openings = getVerifiedOpeningIncome(transfers, year, month);
    const monthly  = getVerifiedMonthlyIncome(transfers, year, month);
    const paid     = getPaidCommissions(commissions, year, month);
    const debt     = getAuthorizedCommissionDebt(commissions, year, month);

    const openingIncome   = openings.reduce((s, t) => s + t.amount, 0);
    const monthlyIncome   = monthly.reduce((s, t) => s + t.amount, 0);
    const paidComms       = paid.reduce((s, c) => s + c.amount, 0);
    const authorizedComms = debt.reduce((s, c) => s + c.amount, 0);

    return {
      month,
      monthLabel: MONTH_NAMES[i],
      openingIncome,
      monthlyIncome,
      totalIncome: openingIncome + monthlyIncome,
      authorizedCommissions: authorizedComms,
      paidCommissions: paidComms,
      netAfterCommissions: openingIncome + monthlyIncome - paidComms,
    };
  });
}

// ── Extended finance helpers ──────────────────────────────────────────────────

export function expenseAppliesToMonth(expense: MonthlyFixedExpense, year: number, month: number): boolean {
  if (!expense.active) return false;
  const target = `${year}-${String(month).padStart(2, "0")}`;
  const start  = expense.startDate.slice(0, 7);
  if (start > target) return false;
  if (expense.endDate && expense.endDate.slice(0, 7) < target) return false;

  if (expense.frequency === "monthly") return true;

  // Calculate months elapsed from the start month to the target month
  const [sy, sm] = start.split("-").map(Number);
  const monthsDiff = (year - sy) * 12 + (month - sm);
  const cycle = expense.frequency === "bimonthly" ? 2
              : expense.frequency === "quarterly"  ? 3
              : 12; // annual
  return monthsDiff % cycle === 0;
}

export function getActiveFixedExpensesByMonth(
  expenses: MonthlyFixedExpense[], year: number, month: number
): MonthlyFixedExpense[] {
  return expenses.filter((e) => expenseAppliesToMonth(e, year, month));
}

export function getFixedExpensesTotalByMonth(
  expenses: MonthlyFixedExpense[], year: number, month: number
): number {
  return getActiveFixedExpensesByMonth(expenses, year, month).reduce((s, e) => s + e.amount, 0);
}

export function getOtherIncomeByMonth(
  movements: OtherFinancialMovement[], year: number, month: number
): OtherFinancialMovement[] {
  return movements.filter((m) => {
    if (m.type !== "other_income") return false;
    const d = new Date(m.movementDate + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export function getOtherExpensesByMonth(
  movements: OtherFinancialMovement[], year: number, month: number
): OtherFinancialMovement[] {
  return movements.filter((m) => {
    if (m.type !== "other_expense") return false;
    const d = new Date(m.movementDate + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export function getEstimatedNetProfitByMonth(
  transfers: TransferRecord[],
  commissions: CommissionRecord[],
  expenses: MonthlyFixedExpense[],
  movements: OtherFinancialMovement[],
  taxRecords: MonthlyTaxRecord[],
  year: number,
  month: number
): number {
  const openingInc = getVerifiedOpeningIncome(transfers, year, month).reduce((s, t) => s + t.amount, 0);
  const monthlyInc = getVerifiedMonthlyIncome(transfers, year, month).reduce((s, t) => s + t.amount, 0);
  const otherInc   = getOtherIncomeByMonth(movements, year, month).reduce((s, m) => s + m.amount, 0);
  const comms      = getPaidCommissions(commissions, year, month).reduce((s, c) => s + c.amount, 0);
  const fixed      = getFixedExpensesTotalByMonth(expenses, year, month);
  const otherExp   = getOtherExpensesByMonth(movements, year, month).reduce((s, m) => s + m.amount, 0);
  const tax        = taxRecords.find((t) => t.year === year && t.month === month);
  const estTax     = tax?.estimatedTaxAmount ?? 0;
  return openingInc + monthlyInc + otherInc - comms - fixed - otherExp - estTax;
}

export function getActualNetProfitByMonth(
  transfers: TransferRecord[],
  commissions: CommissionRecord[],
  expenses: MonthlyFixedExpense[],
  movements: OtherFinancialMovement[],
  taxRecords: MonthlyTaxRecord[],
  year: number,
  month: number
): number | null {
  const tax = taxRecords.find((t) => t.year === year && t.month === month);
  if (!tax?.actualPaidAmount) return null;
  const openingInc = getVerifiedOpeningIncome(transfers, year, month).reduce((s, t) => s + t.amount, 0);
  const monthlyInc = getVerifiedMonthlyIncome(transfers, year, month).reduce((s, t) => s + t.amount, 0);
  const otherInc   = getOtherIncomeByMonth(movements, year, month).reduce((s, m) => s + m.amount, 0);
  const comms      = getPaidCommissions(commissions, year, month).reduce((s, c) => s + c.amount, 0);
  const fixed      = getFixedExpensesTotalByMonth(expenses, year, month);
  const otherExp   = getOtherExpensesByMonth(movements, year, month).reduce((s, m) => s + m.amount, 0);
  return openingInc + monthlyInc + otherInc - comms - fixed - otherExp - tax.actualPaidAmount;
}

export function calcOnboardingStatus(
  checklist: OnboardingChecklist
): OnboardingStatus {
  const vals = Object.values(checklist);
  if (vals.every(Boolean)) return "ready";
  if (vals.some(Boolean)) return "in_progress";
  return "not_started";
}

export function generatePaymentHistory(
  activationDate: string,
  contractType: ContractType,
  monthlyAmount = 0,
  existing: MonthlyPayment[] = []
): MonthlyPayment[] {
  const months = contractType === "one_year" ? 12 : 6;
  const start = new Date(activationDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingByIdx = new Map(existing.map((p, i) => [i, p]));

  return Array.from({ length: months }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
    const dueDate = d.toISOString().split("T")[0];
    const monthLabel = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    const prev = existingByIdx.get(i);
    if (prev?.status === "paid") return { ...prev, monthLabel, dueDate, amount: monthlyAmount };
    const dueD = new Date(dueDate + "T00:00:00");
    const isCurrent =
      dueD.getFullYear() === today.getFullYear() && dueD.getMonth() === today.getMonth();
    const isPast = dueD < today && !isCurrent;
    return {
      id: `ph-${activationDate}-${i}`,
      monthLabel,
      dueDate,
      status: (isPast ? "overdue" : "pending") as MonthlyPaymentStatus,
      amount: monthlyAmount,
    };
  });
}

export function recalcPaymentStatus(history: MonthlyPayment[]): {
  paymentStatus: PaymentStatus;
  accessActive: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let hasOverdue = false;
  let currentPaid = false;

  for (const p of history) {
    const due = new Date(p.dueDate + "T00:00:00");
    const isCurrent =
      due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
    if (isCurrent && p.status === "paid") currentPaid = true;
    if (due < today && !isCurrent && p.status !== "paid") hasOverdue = true;
  }

  if (hasOverdue) return { paymentStatus: "overdue", accessActive: false };
  if (currentPaid) return { paymentStatus: "paid", accessActive: true };
  return { paymentStatus: "pending", accessActive: true };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function mkLog(action: string, detail?: string): ActivityLogItem {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    date: new Date().toISOString(),
    action,
    detail,
    actor: "Admin",
  };
}

function withLog(
  clients: AdminClient[],
  id: string,
  action: string,
  detail?: string
): AdminClient[] {
  const now = new Date().toISOString();
  return clients.map((c) =>
    c.id !== id
      ? c
      : { ...c, updatedAt: now, activityLog: [mkLog(action, detail), ...c.activityLog] }
  );
}

const EMPTY_CL: OnboardingChecklist = {
  basicData: false, services: false, address: false,
  paymentMethods: false, templateSelected: false, colorsSelected: false, testimonials: false,
};

// ── Mock fixed expenses ───────────────────────────────────────────────────────

const MOCK_FIXED_EXPENSES: MonthlyFixedExpense[] = [
  { id: "exp1", name: "Servidor cloud", category: "Tecnología", description: "DigitalOcean droplet",
    amount: 350, frequency: "monthly", status: "paid", nextDueDate: "2026-07-01",
    active: true, startDate: "2026-01-01", paymentHistory: [], createdAt: "2026-01-01T00:00:00Z" },
  { id: "exp2", name: "Hosting", category: "Tecnología", description: "Dominio + SSL",
    amount: 120, frequency: "annual", status: "paid", nextDueDate: "2027-01-01",
    active: true, startDate: "2026-01-01", paymentHistory: [], createdAt: "2026-01-01T00:00:00Z" },
  { id: "exp3", name: "Software de diseño", category: "Tecnología", description: "Figma + herramientas",
    amount: 200, frequency: "monthly", status: "pending", nextDueDate: "2026-07-01",
    active: true, startDate: "2026-01-01", paymentHistory: [], createdAt: "2026-01-01T00:00:00Z" },
  { id: "exp4", name: "Contabilidad", category: "Servicios profesionales", description: "Honorarios contador",
    amount: 800, frequency: "monthly", status: "pending", nextDueDate: "2026-07-05",
    active: true, startDate: "2026-01-01", paymentHistory: [], createdAt: "2026-01-01T00:00:00Z" },
  { id: "exp5", name: "Publicidad Meta", category: "Marketing", description: "Ads en FB/Instagram",
    amount: 500, frequency: "monthly", status: "paid",
    active: false, startDate: "2026-01-01", endDate: "2026-05-31",
    paymentHistory: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-06-01T00:00:00Z" },
  { id: "exp6", name: "Renta coworking", category: "Espacio", description: "Espacio de trabajo Q1",
    amount: 1500, frequency: "monthly", status: "paid",
    active: false, startDate: "2026-01-01", endDate: "2026-03-31",
    paymentHistory: [], createdAt: "2026-01-01T00:00:00Z" },
];

// ── Mock other financial movements ────────────────────────────────────────────

const MOCK_OTHER_MOVEMENTS: OtherFinancialMovement[] = [
  { id: "mov1", type: "other_income", name: "Servicio de consultoría", category: "extraordinary",
    description: "Asesoría de implementación para cliente externo",
    amount: 2500, movementDate: "2026-03-15", method: "transfer", reference: "CONS-001",
    createdAt: "2026-03-15T10:00:00Z" },
  { id: "mov2", type: "other_expense", name: "Capacitación equipo", category: "extraordinary",
    description: "Taller de UX para el equipo",
    amount: 1200, movementDate: "2026-02-20", method: "transfer", reference: "CAP-001",
    createdAt: "2026-02-20T10:00:00Z" },
  { id: "mov3", type: "other_income", name: "Venta de licencia adicional", category: "other",
    amount: 800, movementDate: "2026-05-10", method: "transfer", createdAt: "2026-05-10T10:00:00Z" },
  { id: "mov4", type: "other_expense", name: "Compra de equipo", category: "equipment",
    description: "Monitor para nuevo integrante",
    amount: 3500, movementDate: "2026-04-05", method: "card", createdAt: "2026-04-05T10:00:00Z" },
];

const MOCK_BANK_ACCOUNT: BankAccountConfig = {
  id: "bank1",
  bank: "BBVA",
  accountHolder: "Template A2 S.A. de C.V.",
  accountNumber: "0123456789",
  clabe: "012345678901234567",
  cardNumber: "",
  requiredConcept: "Mensualidad [N° cliente]",
  paymentInstructions: "Incluir el número de cliente en el concepto de la transferencia.",
  active: true,
  createdAt: "2026-01-01T00:00:00Z",
};

// ── Mock tax records ──────────────────────────────────────────────────────────

const MOCK_TAX_RECORDS: MonthlyTaxRecord[] = [
  { id: "tax1", year: 2026, month: 1, taxPercentage: 16,
    taxableBase: 2150, estimatedTaxAmount: 344,
    actualPaidAmount: 344, paidAt: "2026-02-15",
    notes: "IVA enero", createdAt: "2026-02-01T00:00:00Z" },
  { id: "tax2", year: 2026, month: 2, taxPercentage: 16,
    taxableBase: 1800, estimatedTaxAmount: 288,
    actualPaidAmount: 300, paidAt: "2026-03-14",
    notes: "IVA febrero — ajuste manual",
    createdAt: "2026-03-01T00:00:00Z", updatedAt: "2026-03-14T00:00:00Z" },
  { id: "tax3", year: 2026, month: 3, taxPercentage: 16,
    taxableBase: 2900, estimatedTaxAmount: 464,
    notes: "Pendiente de pago", createdAt: "2026-04-01T00:00:00Z" },
  { id: "tax4", year: 2026, month: 4, taxPercentage: 16,
    taxableBase: 1500, estimatedTaxAmount: 240,
    notes: "Pendiente de pago", createdAt: "2026-05-01T00:00:00Z" },
  { id: "tax5", year: 2026, month: 5, taxPercentage: 16,
    taxableBase: 3200, estimatedTaxAmount: 512,
    notes: "Pendiente de pago", createdAt: "2026-06-01T00:00:00Z" },
];

// ── Mock invoices ─────────────────────────────────────────────────────────────

const MOCK_INVOICES: InvoiceRecord[] = [
  { id: "inv1", clientId: "c1", transferId: "tr1", requiresInvoice: true,
    status: "issued", invoiceNumber: "A-0001", fiscalFolio: "UUID-001",
    issuedAt: "2026-01-05", invoicedAmount: 599,
    notes: "Factura apertura Clínica Dental Sonrisa", createdAt: "2026-01-05T10:00:00Z" },
  { id: "inv2", clientId: "c2", transferId: "tr2", requiresInvoice: true,
    status: "pending", invoicedAmount: 299,
    notes: "Pendiente de emitir", createdAt: "2026-05-02T10:00:00Z" },
  { id: "inv3", clientId: "c3", transferId: "tr3", requiresInvoice: false,
    status: "not_required", createdAt: "2025-12-03T10:00:00Z" },
  { id: "inv4", clientId: "c4", transferId: "tr4", requiresInvoice: true,
    status: "issued", invoiceNumber: "A-0002", fiscalFolio: "UUID-002",
    issuedAt: "2026-01-06", invoicedAmount: 299, createdAt: "2026-01-06T10:00:00Z" },
  { id: "inv5", clientId: "c8", transferId: "tr8", requiresInvoice: true,
    status: "cancelled", invoiceNumber: "A-0003",
    cancelledAt: "2026-06-20",
    notes: "Cancelada por error en datos fiscales", createdAt: "2026-06-19T10:00:00Z" },
];

// ── Mock bank movements ───────────────────────────────────────────────────────

const MOCK_BANK_MOVEMENTS: BankMovement[] = [
  { id: "bm1", movementDate: "2026-01-03", description: "SPEI recibido - MARIANA LOPEZ",
    reference: "TRF-2026-001", amount: 599, direction: "income",
    reconciliationStatus: "matched", relatedTransferId: "tr1",
    createdAt: "2026-01-04T09:00:00Z" },
  { id: "bm2", movementDate: "2026-01-04", description: "SPEI recibido - JORGE SALINAS",
    reference: "TRF-2026-007", amount: 299, direction: "income",
    reconciliationStatus: "matched", relatedTransferId: "tr4",
    createdAt: "2026-01-05T09:00:00Z" },
  { id: "bm3", movementDate: "2026-01-18", description: "SPEI enviado - PEDRO GONZALEZ",
    reference: "TRF-COM-001", amount: 500, direction: "expense",
    reconciliationStatus: "matched", relatedCommissionId: "com1",
    createdAt: "2026-01-18T09:00:00Z" },
  { id: "bm4", movementDate: "2026-05-02", description: "SPEI recibido - CARLOS MENDOZA",
    reference: "TRF-2026-028", amount: 299, direction: "income",
    reconciliationStatus: "matched", relatedTransferId: "tr2",
    createdAt: "2026-05-03T09:00:00Z" },
  { id: "bm5", movementDate: "2026-04-12", description: "SPEI recibido - origen desconocido",
    reference: "REF-UNKNOWN-001", amount: 1500, direction: "income",
    reconciliationStatus: "unmatched", createdAt: "2026-04-12T09:00:00Z" },
  { id: "bm6", movementDate: "2026-06-18", description: "SPEI recibido - BEATRIZ SOLANO",
    reference: "TRF-2026-101", amount: 600, direction: "income",
    reconciliationStatus: "difference", relatedTransferId: "tr8",
    notes: "Monto difiere: banco $600 vs registrado $599",
    createdAt: "2026-06-19T09:00:00Z" },
  { id: "bm7", movementDate: "2026-03-01", description: "Cargo bancario mensual",
    reference: "CARGO-MAR-001", amount: 75, direction: "expense",
    reconciliationStatus: "ignored",
    notes: "Comisión bancaria, no afecta reportes internos",
    createdAt: "2026-03-02T09:00:00Z" },
];

// ── Mock monthly close records ────────────────────────────────────────────────

const MOCK_MONTHLY_CLOSES: MonthlyCloseRecord[] = [
  { id: "mc1", year: 2026, month: 1, status: "closed",
    closedAt: "2026-02-01T09:00:00Z", closedBy: "Admin" },
  { id: "mc2", year: 2026, month: 2, status: "closed",
    closedAt: "2026-03-01T09:00:00Z", closedBy: "Admin" },
  { id: "mc3", year: 2026, month: 3, status: "reopened",
    closedAt: "2026-04-01T09:00:00Z", closedBy: "Admin",
    reopenedAt: "2026-04-15T10:00:00Z", reopenedBy: "Admin",
    reopenReason: "Ajuste en gastos de consultoría" },
  { id: "mc4", year: 2026, month: 4, status: "closed",
    closedAt: "2026-05-01T09:00:00Z", closedBy: "Admin" },
];

// ── Mock financial log ────────────────────────────────────────────────────────

const MOCK_FINANCIAL_LOG: FinancialLogItem[] = [
  { id: "fl1", date: "2026-06-01T09:00:00Z", action: "Mes cerrado", entity: "Mayo 2026", actor: "Admin" },
  { id: "fl2", date: "2026-05-01T09:00:00Z", action: "Mes cerrado", entity: "Abril 2026", actor: "Admin" },
  { id: "fl3", date: "2026-04-15T10:00:00Z", action: "Mes reabierto", entity: "Marzo 2026",
    detail: "Ajuste en gastos de consultoría", actor: "Admin" },
  { id: "fl4", date: "2026-04-05T09:00:00Z", action: "Gasto registrado", entity: "Compra de equipo",
    newValue: "$3,500", actor: "Admin" },
  { id: "fl5", date: "2026-03-15T10:00:00Z", action: "Ingreso adicional registrado",
    entity: "Servicio de consultoría", newValue: "$2,500", actor: "Admin" },
  { id: "fl6", date: "2026-03-14T09:00:00Z", action: "Impuesto pagado",
    entity: "Feb 2026", detail: "$300 MXN", actor: "Admin" },
  { id: "fl7", date: "2026-02-15T09:00:00Z", action: "Impuesto pagado",
    entity: "Ene 2026", detail: "$344 MXN", actor: "Admin" },
  { id: "fl8", date: "2026-06-01T00:00:00Z", action: "Gasto pausado",
    entity: "Publicidad Meta", previousValue: "activo", newValue: "pausado", actor: "Admin" },
];

// ── Mock sales reps (no email, fixed commission amount) ───────────────────────

const MOCK_SALES_REPS: SalesRep[] = [
  {
    id: "rep1", sellerNumber: "VEN-0001", name: "Pedro González",
    phone: "5512340001", bankName: "BBVA", accountNumber: "4152 3130 1234 5678",
    active: true, fixedCommissionAmount: 500,
    createdAt: "2025-11-01T00:00:00Z",
  },
  {
    id: "rep2", sellerNumber: "VEN-0002", name: "Lucía Ramírez",
    phone: "5512340002", bankName: "Banamex", accountNumber: "5204 1652 9876 5432",
    active: true, fixedCommissionAmount: 400,
    createdAt: "2025-11-15T00:00:00Z",
  },
  {
    id: "rep3", sellerNumber: "VEN-0003", name: "Carlos Vega",
    phone: "5512340003", bankName: "HSBC", accountNumber: "4213 0011 2233 4455",
    active: false, fixedCommissionAmount: 500,
    createdAt: "2025-12-01T00:00:00Z",
  },
];

// ── Mock transfers ────────────────────────────────────────────────────────────

const MOCK_TRANSFERS: TransferRecord[] = [
  {
    id: "tr1", referenceNumber: "TRF-2026-001",
    transferDate: "2026-01-03", amount: 599,
    type: "opening", status: "verified",
    sellerId: "rep1", sellerNumber: "VEN-0001", sellerName: "Pedro González",
    fixedCommissionAmount: 500,
    prospectName: "Mariana López", prospectPhone: "5512345678",
    prospectiveBusinessName: "Clínica Dental Sonrisa",
    clientId: "c1", clientNumber: "TA2-0001",
    createdAt: "2026-01-01T08:00:00Z", verifiedAt: "2026-01-03T10:00:00Z",
  },
  {
    id: "tr2", referenceNumber: "TRF-2026-028",
    transferDate: "2026-05-02", amount: 299,
    type: "opening", status: "verified",
    sellerId: "rep2", sellerNumber: "VEN-0002", sellerName: "Lucía Ramírez",
    fixedCommissionAmount: 400,
    prospectName: "Carlos Mendoza", prospectPhone: "5598765432",
    prospectiveBusinessName: "Consultorio Dr. Mendoza",
    clientId: "c2", clientNumber: "TA2-0002",
    createdAt: "2026-05-01T08:00:00Z", verifiedAt: "2026-05-02T09:00:00Z",
  },
  {
    id: "tr3", referenceNumber: "TRF-2025-089",
    transferDate: "2025-12-03", amount: 599,
    type: "opening", status: "verified",
    sellerId: "rep1", sellerNumber: "VEN-0001", sellerName: "Pedro González",
    fixedCommissionAmount: 500,
    prospectName: "Sofía Ríos", prospectPhone: "5511223344",
    prospectiveBusinessName: "Centro Dental Familiar",
    clientId: "c3", clientNumber: "TA2-0003",
    createdAt: "2025-12-01T08:00:00Z", verifiedAt: "2025-12-03T09:00:00Z",
  },
  {
    id: "tr4", referenceNumber: "TRF-2026-007",
    transferDate: "2026-01-04", amount: 299,
    type: "opening", status: "verified",
    sellerId: "rep2", sellerNumber: "VEN-0002", sellerName: "Lucía Ramírez",
    fixedCommissionAmount: 400,
    prospectName: "Jorge Salinas", prospectPhone: "5566778899",
    prospectiveBusinessName: "Fisioterapia Movimiento",
    clientId: "c4", clientNumber: "TA2-0004",
    createdAt: "2026-01-01T08:00:00Z", verifiedAt: "2026-01-04T10:00:00Z",
  },
  {
    id: "tr5", referenceNumber: "TRF-2026-098",
    transferDate: "2026-06-17", amount: 599,
    type: "opening", status: "pending",
    sellerId: "rep1", sellerNumber: "VEN-0001", sellerName: "Pedro González",
    fixedCommissionAmount: 500,
    prospectName: "Ana García", prospectPhone: "5544332211",
    prospectiveBusinessName: "Estética Dental Ana García",
    preClientId: "pre1",
    createdAt: "2026-06-17T14:00:00Z",
  },
  {
    id: "tr6", referenceNumber: "TRF-2026-099",
    transferDate: "2026-06-18", amount: 599,
    type: "monthly", status: "pending",
    specialistId: "c1", clientNumber: "TA2-0001",
    paymentMonth: "junio de 2026",
    createdAt: "2026-06-18T09:00:00Z",
  },
  {
    id: "tr7", referenceNumber: "TRF-2026-055",
    transferDate: "2026-05-05", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c2", clientNumber: "TA2-0002",
    paymentMonth: "mayo de 2026",
    createdAt: "2026-05-05T09:00:00Z", verifiedAt: "2026-05-06T10:00:00Z",
  },
  // Test case 2 – current fortnight (2026-06-2) with authorized commission (VEN-0001)
  {
    id: "tr8", referenceNumber: "TRF-2026-101",
    transferDate: "2026-06-18", amount: 599,
    type: "opening", status: "verified",
    sellerId: "rep1", sellerNumber: "VEN-0001", sellerName: "Pedro González",
    fixedCommissionAmount: 500,
    prospectName: "Beatriz Solano", prospectPhone: "5500223344",
    prospectiveBusinessName: "Dermatología Solano",
    clientId: "c8", clientNumber: "TA2-0008",
    createdAt: "2026-06-18T10:00:00Z", verifiedAt: "2026-06-18T11:00:00Z",
  },
  // Test case 3 – quincena 2026-05-2: authorized commission (debt) → must appear in main view
  {
    id: "tr9", referenceNumber: "TRF-2026-062",
    transferDate: "2026-05-20", amount: 599,
    type: "opening", status: "verified",
    sellerId: "rep1", sellerNumber: "VEN-0001", sellerName: "Pedro González",
    fixedCommissionAmount: 500,
    prospectName: "Daniela Ortiz", prospectPhone: "5511334455",
    prospectiveBusinessName: "Ortiz Odontología",
    clientId: "c10", clientNumber: "TA2-0010",
    createdAt: "2026-05-18T09:00:00Z", verifiedAt: "2026-05-20T10:00:00Z",
  },
  // Test case 4 – quincena 2026-05-2: partially paid (one authorized, one paid) → must appear in main view
  {
    id: "tr10", referenceNumber: "TRF-2026-063",
    transferDate: "2026-05-22", amount: 299,
    type: "opening", status: "verified",
    sellerId: "rep2", sellerNumber: "VEN-0002", sellerName: "Lucía Ramírez",
    fixedCommissionAmount: 400,
    prospectName: "Fernanda Salas", prospectPhone: "5599001122",
    prospectiveBusinessName: "Psicología Salas",
    clientId: "c9", clientNumber: "TA2-0009",
    createdAt: "2026-05-22T10:00:00Z", verifiedAt: "2026-05-22T11:00:00Z",
  },
  // Test case 7 – quincena 2026-04-2: two vendors with debt → must appear in main view
  {
    id: "tr11", referenceNumber: "TRF-2026-040",
    transferDate: "2026-04-17", amount: 599,
    type: "opening", status: "verified",
    sellerId: "rep1", sellerNumber: "VEN-0001", sellerName: "Pedro González",
    fixedCommissionAmount: 500,
    prospectName: "Marcos Vidal", prospectPhone: "5533445566",
    prospectiveBusinessName: "Vidal Nutrición",
    clientId: "c5", clientNumber: "TA2-0005",
    createdAt: "2026-04-17T09:00:00Z", verifiedAt: "2026-04-17T10:00:00Z",
  },
  {
    id: "tr12", referenceNumber: "TRF-2026-041",
    transferDate: "2026-04-20", amount: 299,
    type: "opening", status: "verified",
    sellerId: "rep2", sellerNumber: "VEN-0002", sellerName: "Lucía Ramírez",
    fixedCommissionAmount: 400,
    prospectName: "Elena Mora", prospectPhone: "5522113344",
    prospectiveBusinessName: "PsicoMora",
    clientId: "c6", clientNumber: "TA2-0006",
    createdAt: "2026-04-20T10:00:00Z", verifiedAt: "2026-04-20T11:00:00Z",
  },
  // ── Monthly income transfers (for Finanzas section) ─────────────────────────
  // c1 – Clínica Dental Sonrisa ($599/mes, pago anual)
  { id: "tr13", referenceNumber: "TRF-MEN-2026-001",
    transferDate: "2026-01-10", amount: 599,
    type: "monthly", status: "verified",
    specialistId: "c1", clientNumber: "TA2-0001",
    paymentMonth: "enero de 2026",
    createdAt: "2026-01-10T08:00:00Z", verifiedAt: "2026-01-10T09:00:00Z" },
  { id: "tr14", referenceNumber: "TRF-MEN-2026-002",
    transferDate: "2026-02-07", amount: 599,
    type: "monthly", status: "verified",
    specialistId: "c1", clientNumber: "TA2-0001",
    paymentMonth: "febrero de 2026",
    createdAt: "2026-02-07T08:00:00Z", verifiedAt: "2026-02-07T09:00:00Z" },
  { id: "tr15", referenceNumber: "TRF-MEN-2026-003",
    transferDate: "2026-03-06", amount: 599,
    type: "monthly", status: "verified",
    specialistId: "c1", clientNumber: "TA2-0001",
    paymentMonth: "marzo de 2026",
    createdAt: "2026-03-06T08:00:00Z", verifiedAt: "2026-03-06T09:00:00Z" },
  { id: "tr16", referenceNumber: "TRF-MEN-2026-004",
    transferDate: "2026-04-05", amount: 599,
    type: "monthly", status: "verified",
    specialistId: "c1", clientNumber: "TA2-0001",
    paymentMonth: "abril de 2026",
    createdAt: "2026-04-05T08:00:00Z", verifiedAt: "2026-04-05T09:00:00Z" },
  // Mayo pagado con retraso — verificado en junio (demuestra cross-month)
  { id: "tr17", referenceNumber: "TRF-MEN-2026-005",
    transferDate: "2026-06-01", amount: 599,
    type: "monthly", status: "verified",
    specialistId: "c1", clientNumber: "TA2-0001",
    paymentMonth: "mayo de 2026",
    createdAt: "2026-06-01T08:00:00Z", verifiedAt: "2026-06-03T09:00:00Z" },
  // c4 – Fisioterapia Movimiento ($299/mes)
  { id: "tr18", referenceNumber: "TRF-MEN-2026-006",
    transferDate: "2026-02-07", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c4", clientNumber: "TA2-0004",
    paymentMonth: "febrero de 2026",
    createdAt: "2026-02-07T08:00:00Z", verifiedAt: "2026-02-07T10:00:00Z" },
  { id: "tr19", referenceNumber: "TRF-MEN-2026-007",
    transferDate: "2026-03-10", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c4", clientNumber: "TA2-0004",
    paymentMonth: "marzo de 2026",
    createdAt: "2026-03-10T08:00:00Z", verifiedAt: "2026-03-10T10:00:00Z" },
  { id: "tr20", referenceNumber: "TRF-MEN-2026-008",
    transferDate: "2026-04-07", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c4", clientNumber: "TA2-0004",
    paymentMonth: "abril de 2026",
    createdAt: "2026-04-07T08:00:00Z", verifiedAt: "2026-04-07T10:00:00Z" },
  { id: "tr21", referenceNumber: "TRF-MEN-2026-009",
    transferDate: "2026-05-08", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c4", clientNumber: "TA2-0004",
    paymentMonth: "mayo de 2026",
    createdAt: "2026-05-08T08:00:00Z", verifiedAt: "2026-05-08T10:00:00Z" },
  // c10 – Sonrisas Aguilar ($299/mes, activation feb 2026)
  { id: "tr22", referenceNumber: "TRF-MEN-2026-010",
    transferDate: "2026-03-05", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c10", clientNumber: "TA2-0010",
    paymentMonth: "marzo de 2026",
    createdAt: "2026-03-05T08:00:00Z", verifiedAt: "2026-03-05T10:00:00Z" },
  { id: "tr23", referenceNumber: "TRF-MEN-2026-011",
    transferDate: "2026-04-06", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c10", clientNumber: "TA2-0010",
    paymentMonth: "abril de 2026",
    createdAt: "2026-04-06T08:00:00Z", verifiedAt: "2026-04-06T10:00:00Z" },
  { id: "tr24", referenceNumber: "TRF-MEN-2026-012",
    transferDate: "2026-05-06", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c10", clientNumber: "TA2-0010",
    paymentMonth: "mayo de 2026",
    createdAt: "2026-05-06T08:00:00Z", verifiedAt: "2026-05-06T10:00:00Z" },
  // c5 – Nutrición Equilibrio ($299/mes, activation mar 2026)
  { id: "tr25", referenceNumber: "TRF-MEN-2026-013",
    transferDate: "2026-04-08", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c5", clientNumber: "TA2-0005",
    paymentMonth: "abril de 2026",
    createdAt: "2026-04-08T08:00:00Z", verifiedAt: "2026-04-08T10:00:00Z" },
  { id: "tr26", referenceNumber: "TRF-MEN-2026-014",
    transferDate: "2026-05-08", amount: 299,
    type: "monthly", status: "verified",
    specialistId: "c5", clientNumber: "TA2-0005",
    paymentMonth: "mayo de 2026",
    createdAt: "2026-05-08T08:00:00Z", verifiedAt: "2026-05-08T10:00:00Z" },
  // c9 – Bienestar Camila ($599/mes, pro, activation apr 2026)
  { id: "tr28", referenceNumber: "TRF-MEN-2026-015",
    transferDate: "2026-05-06", amount: 599,
    type: "monthly", status: "verified",
    specialistId: "c9", clientNumber: "TA2-0009",
    paymentMonth: "mayo de 2026",
    createdAt: "2026-05-06T08:00:00Z", verifiedAt: "2026-05-06T10:00:00Z" },
  // Mensualidad pendiente vencida (c3 con pagos atrasados)
  { id: "tr27", referenceNumber: "TRF-MEN-PEND-001",
    transferDate: "2026-06-20", amount: 599,
    type: "monthly", status: "pending",
    specialistId: "c3", clientNumber: "TA2-0003",
    paymentMonth: "marzo de 2026",
    createdAt: "2026-06-20T10:00:00Z" },
];

// ── Mock commissions (fixed amount, not percentage) ───────────────────────────

const MOCK_COMMISSIONS: CommissionRecord[] = [
  {
    id: "com1", salesRepId: "rep1", sellerNumber: "VEN-0001",
    transferId: "tr1", clientId: "c1", clientNumber: "TA2-0001",
    businessName: "Clínica Dental Sonrisa",
    amount: 500, status: "paid",
    generatedAt: "2026-01-03T10:00:00Z", authorizedAt: "2026-01-03T10:00:00Z",
    paidAt: "2026-01-18T00:00:00Z", paidTransferRef: "TRF-COM-001",
    paidTransferDate: "2026-01-18",
    fortnightId: "2026-01-1",
  },
  {
    id: "com2", salesRepId: "rep2", sellerNumber: "VEN-0002",
    transferId: "tr2", clientId: "c2", clientNumber: "TA2-0002",
    businessName: "Consultorio Dr. Mendoza",
    amount: 400, status: "authorized",
    generatedAt: "2026-05-02T09:00:00Z", authorizedAt: "2026-05-02T09:00:00Z",
    fortnightId: "2026-05-1",
  },
  {
    id: "com3", salesRepId: "rep1", sellerNumber: "VEN-0001",
    transferId: "tr3", clientId: "c3", clientNumber: "TA2-0003",
    businessName: "Centro Dental Familiar",
    amount: 500, status: "cancelled",
    generatedAt: "2025-12-03T09:00:00Z",
    fortnightId: "2025-12-1",
  },
  {
    id: "com4", salesRepId: "rep2", sellerNumber: "VEN-0002",
    transferId: "tr4", clientId: "c4", clientNumber: "TA2-0004",
    businessName: "Fisioterapia Movimiento",
    amount: 400, status: "authorized",
    generatedAt: "2026-01-04T10:00:00Z", authorizedAt: "2026-01-04T10:00:00Z",
    fortnightId: "2026-01-1",
  },
  // Test case 2 – current fortnight (2026-06-2) authorized commission for VEN-0001
  {
    id: "com5", salesRepId: "rep1", sellerNumber: "VEN-0001",
    transferId: "tr8", clientId: "c8", clientNumber: "TA2-0008",
    businessName: "Dermatología Solano",
    amount: 500, status: "authorized",
    generatedAt: "2026-06-18T11:00:00Z", authorizedAt: "2026-06-18T11:00:00Z",
    fortnightId: "2026-06-2",
  },
  // Test case 3 – quincena 2026-05-2: authorized (debt) for VEN-0001
  {
    id: "com6", salesRepId: "rep1", sellerNumber: "VEN-0001",
    transferId: "tr9", clientId: "c10", clientNumber: "TA2-0010",
    businessName: "Ortiz Odontología",
    amount: 500, status: "authorized",
    generatedAt: "2026-05-20T10:00:00Z", authorizedAt: "2026-05-20T10:00:00Z",
    fortnightId: "2026-05-2",
  },
  // Test case 4 – quincena 2026-05-2: authorized (debt) for VEN-0002
  {
    id: "com7", salesRepId: "rep2", sellerNumber: "VEN-0002",
    transferId: "tr10", clientId: "c9", clientNumber: "TA2-0009",
    businessName: "Psicología Salas",
    amount: 400, status: "authorized",
    generatedAt: "2026-05-22T11:00:00Z", authorizedAt: "2026-05-22T11:00:00Z",
    fortnightId: "2026-05-2",
  },
  // Test case 5 – quincena 2026-05-1 (com2) was already authorized → now fully paid → must NOT appear as debt
  // (com2 already has status: "authorized" for 2026-05-1 — left as-is to test: it has debt → WILL appear)
  // Adding a separate fully-paid commission in 2026-04-1 to show it doesn't appear
  {
    id: "com8", salesRepId: "rep1", sellerNumber: "VEN-0001",
    transferId: "tr1", clientId: "c1", clientNumber: "TA2-0001",
    businessName: "Clínica Dental Sonrisa (bono extra)",
    amount: 500, status: "paid",
    generatedAt: "2026-04-03T10:00:00Z", authorizedAt: "2026-04-03T10:00:00Z",
    paidAt: "2026-04-18T00:00:00Z", paidTransferRef: "TRF-COM-005", paidTransferDate: "2026-04-18",
    fortnightId: "2026-04-1",
  },
  // Test case 6 – quincena 2026-03-1: cancelled commission → must NOT count as debt
  {
    id: "com9", salesRepId: "rep2", sellerNumber: "VEN-0002",
    transferId: "tr4", clientId: "c4", clientNumber: "TA2-0004",
    businessName: "Fisioterapia Movimiento (anulada)",
    amount: 400, status: "cancelled",
    generatedAt: "2026-03-05T09:00:00Z",
    fortnightId: "2026-03-1",
  },
  // Test case 7 – quincena 2026-04-2: two vendors with authorized debt
  {
    id: "com10", salesRepId: "rep1", sellerNumber: "VEN-0001",
    transferId: "tr11", clientId: "c5", clientNumber: "TA2-0005",
    businessName: "Vidal Nutrición",
    amount: 500, status: "authorized",
    generatedAt: "2026-04-17T10:00:00Z", authorizedAt: "2026-04-17T10:00:00Z",
    fortnightId: "2026-04-2",
  },
  {
    id: "com11", salesRepId: "rep2", sellerNumber: "VEN-0002",
    transferId: "tr12", clientId: "c6", clientNumber: "TA2-0006",
    businessName: "PsicoMora",
    amount: 400, status: "authorized",
    generatedAt: "2026-04-20T11:00:00Z", authorizedAt: "2026-04-20T11:00:00Z",
    fortnightId: "2026-04-2",
  },
  // Test case 6 — comisión autorizada en febrero, pagada en junio (cross-month)
  {
    id: "com12", salesRepId: "rep1", sellerNumber: "VEN-0001",
    transferId: "tr3", clientId: "c3", clientNumber: "TA2-0003",
    businessName: "Centro Dental Familiar (bono 1a feb)",
    amount: 500, status: "paid",
    generatedAt: "2026-02-05T10:00:00Z", authorizedAt: "2026-02-05T10:00:00Z",
    paidAt: "2026-06-10T00:00:00Z", paidTransferRef: "TRF-COM-006", paidTransferDate: "2026-06-10",
    fortnightId: "2026-02-1",
  },
];

// ── Mock fortnights ───────────────────────────────────────────────────────────

const MOCK_FORTNIGHTS: Fortnight[] = [
  { id: "2025-12-1", year: 2025, month: 12, half: 1, label: "1a quincena de diciembre 2025 (1–15)",   closed: true,  closedAt: "2025-12-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-01-1", year: 2026, month: 1,  half: 1, label: "1a quincena de enero 2026 (1–15)",       closed: true,  closedAt: "2026-01-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-02-1", year: 2026, month: 2,  half: 1, label: "1a quincena de febrero 2026 (1–15)",     closed: true,  closedAt: "2026-02-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-03-1", year: 2026, month: 3,  half: 1, label: "1a quincena de marzo 2026 (1–15)",       closed: true,  closedAt: "2026-03-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-04-1", year: 2026, month: 4,  half: 1, label: "1a quincena de abril 2026 (1–15)",       closed: true,  closedAt: "2026-04-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-04-2", year: 2026, month: 4,  half: 2, label: "2a quincena de abril 2026 (16–30)",      closed: true,  closedAt: "2026-05-01T09:00:00Z", closedBy: "Admin" },
  { id: "2026-05-1", year: 2026, month: 5,  half: 1, label: "1a quincena de mayo 2026 (1–15)",        closed: true,  closedAt: "2026-05-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-05-2", year: 2026, month: 5,  half: 2, label: "2a quincena de mayo 2026 (16–31)",       closed: true,  closedAt: "2026-06-01T09:00:00Z", closedBy: "Admin" },
  { id: "2026-06-1", year: 2026, month: 6,  half: 1, label: "1a quincena de junio 2026 (1–15)",       closed: true,  closedAt: "2026-06-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-06-2", year: 2026, month: 6,  half: 2, label: "2a quincena de junio 2026 (16–30)",      closed: false },
];

// ── Mock global activity log ──────────────────────────────────────────────────

const MOCK_ADMIN_LOG: ActivityLogItem[] = [
  { id: "gl1", date: "2026-06-16T09:00:00Z", action: "Quincena cerrada",        detail: "1a quincena de junio 2026",        actor: "Admin" },
  { id: "gl2", date: "2026-06-01T10:00:00Z", action: "Comisión pagada",          detail: "VEN-0001 — com1 — $500",           actor: "Admin" },
  { id: "gl3", date: "2026-05-16T09:00:00Z", action: "Quincena cerrada",        detail: "1a quincena de mayo 2026",         actor: "Admin" },
  { id: "gl4", date: "2026-05-02T08:00:00Z", action: "Apertura verificada",     detail: "TA2-0002 — TRF-2026-028",          actor: "Admin" },
  { id: "gl5", date: "2026-01-03T08:00:00Z", action: "Apertura verificada",     detail: "TA2-0001 — TRF-2026-001",          actor: "Admin" },
  { id: "gl6", date: "2026-01-04T08:00:00Z", action: "Apertura verificada",     detail: "TA2-0004 — TRF-2026-007",          actor: "Admin" },
];

// ── Mock clients ──────────────────────────────────────────────────────────────

const FULL_CL: OnboardingChecklist = {
  basicData: true, services: true, address: true,
  paymentMethods: true, templateSelected: true, colorsSelected: true, testimonials: true,
};
const PARTIAL_CL: OnboardingChecklist = {
  basicData: true, services: true, address: true,
  paymentMethods: false, templateSelected: false, colorsSelected: false, testimonials: false,
};

function mockHistory(
  activationDate: string,
  contractType: ContractType,
  amount: number,
  paidCount: number
): MonthlyPayment[] {
  const months = contractType === "one_year" ? 12 : 6;
  const start = new Date(activationDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const monthLabel = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    const isPaid = i < paidCount;
    const dueD = new Date(dueDate + "T00:00:00");
    const isCurrent =
      dueD.getFullYear() === today.getFullYear() && dueD.getMonth() === today.getMonth();
    const isPast = dueD < today && !isCurrent;
    const status: MonthlyPaymentStatus = isPaid ? "paid" : isPast ? "overdue" : "pending";
    return {
      id: `mock-${activationDate}-${i}`,
      monthLabel, dueDate, status, amount,
      paidAt: isPaid
        ? new Date(d.getFullYear(), d.getMonth(), 5).toISOString().split("T")[0]
        : undefined,
      transferReference: isPaid ? `TRF-MES-${activationDate.slice(0, 4)}-${String(i + 1).padStart(3, "0")}` : undefined,
      transferDate: isPaid
        ? new Date(d.getFullYear(), d.getMonth(), 5).toISOString().split("T")[0]
        : undefined,
    };
  });
}

const spec1: SpecialistInfo = {
  firstName: "Mariana", lastNamePaternal: "López", lastNameMaternal: "Fernández",
  publicName: "Dra. Mariana López",
  phone: "5512345678", whatsapp: "5512345678",
  email: "mariana.lopez@negocionrisa.mx",
  shortDescription: "Especialista en ortodoncia y odontología cosmética.",
  bio: "Egresada de la UNAM con especialidad en Ortodoncia.",
};
const business1: BusinessInfo = {
  name: "Clínica Dental Sonrisa", commercialName: "Sonrisa",
  street: "Av. Insurgentes Sur", exteriorNumber: "1234",
  colony: "Del Valle", municipality: "Benito Juárez",
  city: "Ciudad de México", state: "Ciudad de México", postalCode: "03100",
  phone: "5512345678", whatsapp: "5512345678",
};

const spec2: SpecialistInfo = {
  firstName: "Carlos", lastNamePaternal: "Mendoza", lastNameMaternal: "Vega",
  publicName: "Dr. Carlos Mendoza",
  phone: "5598765432", whatsapp: "5598765432",
  email: "carlos.mendoza@fisio.mx",
  shortDescription: "Fisioterapeuta especializado en rehabilitación deportiva.",
};
const business2: BusinessInfo = {
  name: "Consultorio Dr. Mendoza",
  street: "Calle Durango", exteriorNumber: "88",
  colony: "Roma Norte", municipality: "Cuauhtémoc",
  city: "Ciudad de México", state: "Ciudad de México", postalCode: "06700",
  phone: "5598765432",
};

const spec3: SpecialistInfo = {
  firstName: "Sofía", lastNamePaternal: "Ríos", lastNameMaternal: "Castillo",
  publicName: "Dra. Sofía Ríos",
  phone: "5511223344", whatsapp: "5511223344",
  email: "sofia.rios@dentalfamiliar.mx",
  shortDescription: "Odontóloga con 12 años de experiencia en atención familiar.",
};
const business3: BusinessInfo = {
  name: "Centro Dental Familiar",
  street: "Av. Universidad", exteriorNumber: "450",
  colony: "Copilco", municipality: "Coyoacán",
  city: "Ciudad de México", state: "Ciudad de México", postalCode: "04360",
  phone: "5511223344",
};

const spec4: SpecialistInfo = {
  firstName: "Jorge", lastNamePaternal: "Salinas", lastNameMaternal: "Herrera",
  publicName: "Lic. Jorge Salinas",
  phone: "5566778899", whatsapp: "5566778899",
  email: "jorge.salinas@fisiomovimiento.mx",
  shortDescription: "Fisioterapeuta con enfoque en neurorrehabilitación.",
};
const business4: BusinessInfo = {
  name: "Fisioterapia Movimiento",
  street: "Blvd. Ávila Camacho", exteriorNumber: "32",
  colony: "Industrial", municipality: "Naucalpan",
  city: "Naucalpan de Juárez", state: "Estado de México", postalCode: "53370",
  phone: "5566778899", whatsapp: "5566778899",
};

const MOCK_CLIENTS: AdminClient[] = [
  {
    id: "c1", clientNumber: "TA2-0001",
    businessType: "dentist",
    specialist: spec1, business: business1,
    slug: "negocio-sonrisa", subdomain: "negocio-sonrisa.templatea2.com",
    plan: "cowork",
    paymentStatus: "paid", clientStatus: "active", accessActive: true,
    publicPageStatus: "published",
    contractType: "one_year", activationDate: "2026-01-01", contractEndDate: "2026-12-31",
    monthlyAmount: 599,
    paymentHistory: mockHistory("2026-01-01", "one_year", 599, 5),
    onboardingStatus: "ready", onboardingChecklist: FULL_CL,
    salesRepId: "rep1", salesRepName: "Pedro González", sellerNumber: "VEN-0001",
    assignedTo: "Soporte A",
    internalNotes: "Cliente premium. Pago puntual.",
    activityLog: [
      { id: "a1", date: "2026-06-01T10:00:00Z", action: "Pago registrado", detail: "Mayo 2026 — $599 MXN", actor: "Pedro González" },
      { id: "a2", date: "2026-01-15T09:00:00Z", action: "Página publicada", actor: "Admin" },
      { id: "a3", date: "2026-01-03T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada — TRF-2026-001", actor: "Admin" },
    ],
    documents: [{ id: "d1", name: "Comprobante enero", type: "payment_receipt", uploadedAt: "2026-01-05" }],
    contracts: [{
      id: "con1", clientId: "c1", fileName: "contrato_anual_2026.pdf",
      fileType: "application/pdf", status: "signed",
      signedAt: "2026-01-02", startDate: "2026-01-01", endDate: "2026-12-31",
      version: 1, uploadedAt: "2026-01-01T10:00:00Z",
    }],
    createdAt: "2026-01-03T10:00:00Z", updatedAt: "2026-06-01T00:00:00Z",
    lastPaymentAt: "2026-06-01", nextPaymentDueAt: "2026-07-01",
  },
  {
    id: "c2", clientNumber: "TA2-0002",
    businessType: "physiotherapist",
    specialist: spec2, business: business2,
    slug: "doctor-mendoza", subdomain: "doctor-mendoza.templatea2.com",
    plan: "standard",
    paymentStatus: "pending", clientStatus: "active", accessActive: true,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2026-05-01", contractEndDate: "2026-10-31",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-05-01", "six_months", 299, 1),
    onboardingStatus: "in_progress", onboardingChecklist: PARTIAL_CL,
    salesRepId: "rep2", salesRepName: "Lucía Ramírez", sellerNumber: "VEN-0002",
    assignedTo: "Soporte B",
    internalNotes: "Pendiente configurar template.",
    activityLog: [
      { id: "a4", date: "2026-05-02T09:00:00Z", action: "Cliente creado", detail: "Apertura verificada — TRF-2026-028", actor: "Admin" },
    ],
    documents: [{ id: "d3", name: "Logo consultorio", type: "business_logo", uploadedAt: "2026-05-10" }],
    contracts: [{
      id: "con2", clientId: "c2", fileName: "contrato_6meses_2026.pdf",
      fileType: "application/pdf", status: "pending_signature",
      startDate: "2026-05-01", endDate: "2026-10-31",
      version: 1, uploadedAt: "2026-05-01T12:00:00Z",
    }],
    createdAt: "2026-05-02T09:00:00Z", updatedAt: "2026-05-02T00:00:00Z",
  },
  {
    id: "c3", clientNumber: "TA2-0003",
    businessType: "dentist",
    specialist: spec3, business: business3,
    slug: "dental-familiar", subdomain: "dental-familiar.templatea2.com",
    plan: "cowork",
    paymentStatus: "overdue", clientStatus: "suspended", accessActive: false,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2025-12-01", contractEndDate: "2026-05-31",
    monthlyAmount: 599,
    paymentHistory: mockHistory("2025-12-01", "six_months", 599, 2),
    onboardingStatus: "not_started", onboardingChecklist: EMPTY_CL,
    salesRepId: "rep1", salesRepName: "Pedro González", sellerNumber: "VEN-0001",
    assignedTo: "Cobranza",
    internalNotes: "4 meses sin pagar. Acceso bloqueado.",
    activityLog: [
      { id: "a5", date: "2026-05-01T09:00:00Z", action: "Acceso bloqueado", detail: "Pago vencido", actor: "Sistema" },
      { id: "a6", date: "2025-12-03T09:00:00Z", action: "Cliente creado", detail: "Apertura verificada — TRF-2025-089", actor: "Admin" },
    ],
    documents: [{ id: "d4", name: "Cédula profesional", type: "professional_license", uploadedAt: "2025-12-05" }],
    contracts: [],
    createdAt: "2025-12-03T09:00:00Z", updatedAt: "2026-05-01T00:00:00Z",
    lastPaymentAt: "2026-01-05",
  },
  {
    id: "c4", clientNumber: "TA2-0004",
    businessType: "physiotherapist",
    specialist: spec4, business: business4,
    slug: "fisio-movimiento", subdomain: "fisio-movimiento.templatea2.com",
    plan: "standard",
    paymentStatus: "pending", clientStatus: "active", accessActive: true,
    publicPageStatus: "published",
    contractType: "six_months", activationDate: "2026-01-01", contractEndDate: "2026-06-30",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-01-01", "six_months", 299, 5),
    onboardingStatus: "ready", onboardingChecklist: FULL_CL,
    salesRepId: "rep2", salesRepName: "Lucía Ramírez", sellerNumber: "VEN-0002",
    assignedTo: "Soporte A",
    internalNotes: "Contrato vence fin de junio.",
    activityLog: [
      { id: "a8", date: "2026-06-01T10:00:00Z", action: "Pago registrado", detail: "Mayo 2026 — $299 MXN", actor: "Lucía Ramírez" },
      { id: "a9", date: "2026-01-04T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada — TRF-2026-007", actor: "Admin" },
    ],
    documents: [],
    contracts: [],
    createdAt: "2026-01-04T10:00:00Z", updatedAt: "2026-06-01T00:00:00Z",
    lastPaymentAt: "2026-06-01", nextPaymentDueAt: "2026-07-01",
  },
  // c5 — Nutriólogo/a, periodo de gracia
  {
    id: "c5", clientNumber: "TA2-0005",
    businessType: "nutritionist",
    specialist: {
      firstName: "Valeria", lastNamePaternal: "Gutiérrez", lastNameMaternal: "Mora",
      publicName: "Lic. Valeria Gutiérrez",
      phone: "5544001122", whatsapp: "5544001122",
      email: "valeria.gutierrez@nutriequilibrio.mx",
      shortDescription: "Nutrióloga clínica especializada en obesidad y diabetes.",
    },
    business: { name: "Nutrición Equilibrio", street: "Av. Revolución", exteriorNumber: "88",
      colony: "San Pedro de los Pinos", municipality: "Benito Juárez",
      city: "Ciudad de México", state: "Ciudad de México", postalCode: "03800",
      phone: "5544001122" },
    slug: "nutricion-equilibrio", subdomain: "nutricion-equilibrio.templatea2.com",
    plan: "standard",
    paymentStatus: "grace_period", clientStatus: "active", accessActive: true,
    publicPageStatus: "published",
    contractType: "six_months", activationDate: "2026-03-01", contractEndDate: "2026-08-31",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-03-01", "six_months", 299, 3),
    onboardingStatus: "ready", onboardingChecklist: FULL_CL,
    salesRepId: "rep1", salesRepName: "Pedro González", sellerNumber: "VEN-0001",
    internalNotes: "Pago de junio no recibido. En periodo de gracia hasta fin de mes.",
    activityLog: [
      { id: "a-c5-1", date: "2026-06-03T09:00:00Z", action: "Periodo de gracia iniciado", detail: "Pago junio sin confirmar", actor: "Sistema" },
      { id: "a-c5-2", date: "2026-03-04T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2026-03-04T10:00:00Z", updatedAt: "2026-06-03T00:00:00Z",
    lastPaymentAt: "2026-05-05", nextPaymentDueAt: "2026-06-01",
  },
  // c6 — Psicólogo/a, acceso bloqueado manualmente
  {
    id: "c6", clientNumber: "TA2-0006",
    businessType: "psychologist",
    specialist: {
      firstName: "Rodrigo", lastNamePaternal: "Peña", lastNameMaternal: "Ibáñez",
      publicName: "Dr. Rodrigo Peña",
      phone: "5533009988", whatsapp: "5533009988",
      email: "rodrigo.pena@psicovida.mx",
      shortDescription: "Psicólogo clínico con especialidad en terapia cognitivo-conductual.",
    },
    business: { name: "PsicoVida Consultorio", street: "Calle Sonora", exteriorNumber: "14",
      colony: "Condesa", municipality: "Cuauhtémoc",
      city: "Ciudad de México", state: "Ciudad de México", postalCode: "06140",
      phone: "5533009988" },
    slug: "psicovida-consultorio", subdomain: "psicovida-consultorio.templatea2.com",
    plan: "standard",
    paymentStatus: "pending", clientStatus: "active", accessActive: false,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2026-04-01", contractEndDate: "2026-09-30",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-04-01", "six_months", 299, 2),
    onboardingStatus: "in_progress", onboardingChecklist: PARTIAL_CL,
    salesRepId: "rep2", salesRepName: "Lucía Ramírez", sellerNumber: "VEN-0002",
    internalNotes: "Acceso bloqueado por solicitud del cliente. Pendiente documentación.",
    activityLog: [
      { id: "a-c6-1", date: "2026-06-10T11:00:00Z", action: "Acceso bloqueado", detail: "Solicitud del cliente por vacaciones", actor: "Admin" },
      { id: "a-c6-2", date: "2026-04-02T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2026-04-02T10:00:00Z", updatedAt: "2026-06-10T00:00:00Z",
    lastPaymentAt: "2026-05-05",
  },
  // c7 — Veterinario/a, cancelado
  {
    id: "c7", clientNumber: "TA2-0007",
    businessType: "veterinarian",
    specialist: {
      firstName: "Daniela", lastNamePaternal: "Fuentes", lastNameMaternal: "Ochoa",
      publicName: "M.V.Z. Daniela Fuentes",
      phone: "5577443322",
      email: "daniela.fuentes@vetpaws.mx",
      shortDescription: "Médica veterinaria especializada en animales de compañía.",
    },
    business: { name: "VetPaws Clínica Veterinaria", street: "Av. Coyoacán", exteriorNumber: "321",
      colony: "Del Valle", municipality: "Benito Juárez",
      city: "Ciudad de México", state: "Ciudad de México", postalCode: "03100",
      phone: "5577443322" },
    slug: "vetpaws-clinica", subdomain: "vetpaws-clinica.templatea2.com",
    plan: "standard",
    paymentStatus: "cancelled", clientStatus: "cancelled", accessActive: false,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2026-01-15", contractEndDate: "2026-07-14",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-01-15", "six_months", 299, 1),
    onboardingStatus: "not_started", onboardingChecklist: EMPTY_CL,
    salesRepId: "rep2", salesRepName: "Lucía Ramírez", sellerNumber: "VEN-0002",
    internalNotes: "Canceló al segundo mes. No quiso continuar.",
    activityLog: [
      { id: "a-c7-1", date: "2026-02-20T14:00:00Z", action: "Contrato cancelado", detail: "Solicitud del cliente", actor: "Admin" },
      { id: "a-c7-2", date: "2026-01-16T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-02-20T00:00:00Z",
  },
  // c8 — Médico, onboarding incompleto, plan standard
  {
    id: "c8", clientNumber: "TA2-0008",
    businessType: "doctor",
    specialist: {
      firstName: "Ernesto", lastNamePaternal: "Villanueva", lastNameMaternal: "Cruz",
      publicName: "Dr. Ernesto Villanueva",
      phone: "5566112233", whatsapp: "5566112233",
      email: "ernesto.villanueva@consultorioev.mx",
      shortDescription: "Médico general con enfoque en medicina preventiva.",
    },
    business: { name: "Consultorio Dr. Villanueva", street: "Blvd. Manuel Ávila Camacho", exteriorNumber: "200",
      colony: "Lomas Verdes", municipality: "Naucalpan",
      city: "Naucalpan de Juárez", state: "Estado de México", postalCode: "53120",
      phone: "5566112233" },
    slug: "consultorio-villanueva", subdomain: "consultorio-villanueva.templatea2.com",
    plan: "standard",
    paymentStatus: "pending", clientStatus: "active", accessActive: true,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2026-05-15", contractEndDate: "2026-11-14",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-05-15", "six_months", 299, 1),
    onboardingStatus: "in_progress",
    onboardingChecklist: { basicData: true, services: true, address: false, paymentMethods: false, templateSelected: false, colorsSelected: false, testimonials: false },
    salesRepId: "rep1", salesRepName: "Pedro González", sellerNumber: "VEN-0001",
    internalNotes: "Pendiente completar dirección y seleccionar template.",
    activityLog: [
      { id: "a-c8-1", date: "2026-05-16T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2026-05-16T10:00:00Z",
  },
  // c9 — Otro tipo, plan Pro, 1 año, página oculta, onboarding en proceso
  {
    id: "c9", clientNumber: "TA2-0009",
    businessType: "other",
    specialist: {
      firstName: "Camila", lastNamePaternal: "Reyes", lastNameMaternal: "Montoya",
      publicName: "Lic. Camila Reyes",
      phone: "5511220033", whatsapp: "5511220033",
      email: "camila.reyes@bienestarcamila.mx",
      shortDescription: "Terapeuta holística y coach de bienestar.",
    },
    business: { name: "Bienestar Camila", street: "Calle Amatlán", exteriorNumber: "10",
      colony: "Condesa", municipality: "Cuauhtémoc",
      city: "Ciudad de México", state: "Ciudad de México", postalCode: "06140",
      phone: "5511220033" },
    slug: "bienestar-camila", subdomain: "bienestar-camila.templatea2.com",
    plan: "cowork",
    paymentStatus: "pending", clientStatus: "active", accessActive: true,
    publicPageStatus: "hidden",
    contractType: "one_year", activationDate: "2026-04-01", contractEndDate: "2027-03-31",
    monthlyAmount: 599,
    paymentHistory: mockHistory("2026-04-01", "one_year", 599, 2),
    onboardingStatus: "in_progress",
    onboardingChecklist: { basicData: true, services: true, address: true, paymentMethods: true, templateSelected: false, colorsSelected: false, testimonials: false },
    salesRepId: "rep2", salesRepName: "Lucía Ramírez", sellerNumber: "VEN-0002",
    internalNotes: "Pendiente seleccionar template y colores.",
    activityLog: [
      { id: "a-c9-1", date: "2026-04-02T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2026-04-02T10:00:00Z",
    lastPaymentAt: "2026-05-05",
  },
  // c10 — Dentista, standard, 6 meses, todo al corriente
  {
    id: "c10", clientNumber: "TA2-0010",
    businessType: "dentist",
    specialist: {
      firstName: "Patricio", lastNamePaternal: "Aguilar", lastNameMaternal: "Soto",
      publicName: "Dr. Patricio Aguilar",
      phone: "5522334455", whatsapp: "5522334455",
      email: "patricio.aguilar@sonrisasaguila.mx",
      shortDescription: "Odontólogo general y estético con 8 años de experiencia.",
    },
    business: { name: "Sonrisas Aguilar", street: "Calle Hamburgo", exteriorNumber: "55",
      colony: "Juárez", municipality: "Cuauhtémoc",
      city: "Ciudad de México", state: "Ciudad de México", postalCode: "06600",
      phone: "5522334455" },
    slug: "sonrisas-aguilar", subdomain: "sonrisas-aguilar.templatea2.com",
    plan: "standard",
    paymentStatus: "pending", clientStatus: "active", accessActive: true,
    publicPageStatus: "published",
    contractType: "six_months", activationDate: "2026-02-01", contractEndDate: "2026-07-31",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-02-01", "six_months", 299, 4),
    onboardingStatus: "ready", onboardingChecklist: FULL_CL,
    salesRepId: "rep1", salesRepName: "Pedro González", sellerNumber: "VEN-0001",
    internalNotes: "Buen cliente. Al corriente en pagos.",
    activityLog: [
      { id: "a-c10-1", date: "2026-05-05T10:00:00Z", action: "Pago registrado", detail: "Mayo 2026 — $299 MXN", actor: "Pedro González" },
      { id: "a-c10-2", date: "2026-02-02T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2026-02-02T10:00:00Z", updatedAt: "2026-05-05T00:00:00Z",
    lastPaymentAt: "2026-05-05", nextPaymentDueAt: "2026-07-01",
  },
  // c11 — Fisioterapeuta, contrato vencido (feb 2026), acceso bloqueado
  {
    id: "c11", clientNumber: "TA2-0011",
    businessType: "physiotherapist",
    specialist: {
      firstName: "Natalia", lastNamePaternal: "Herrera", lastNameMaternal: "Lara",
      publicName: "Lic. Natalia Herrera",
      phone: "5599887766",
      email: "natalia.herrera@fisionat.mx",
      shortDescription: "Fisioterapeuta especializada en terapia manual y pilates clínico.",
    },
    business: { name: "FisioNat Studio", street: "Av. de los Maestros", exteriorNumber: "120",
      colony: "Normal", municipality: "Azcapotzalco",
      city: "Ciudad de México", state: "Ciudad de México", postalCode: "02450",
      phone: "5599887766" },
    slug: "fisionat-studio", subdomain: "fisionat-studio.templatea2.com",
    plan: "standard",
    paymentStatus: "overdue", clientStatus: "active", accessActive: false,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2025-09-01", contractEndDate: "2026-02-28",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2025-09-01", "six_months", 299, 3),
    onboardingStatus: "not_started", onboardingChecklist: EMPTY_CL,
    internalNotes: "Contrato vencido en febrero 2026. Pendiente renovación o cancelación.",
    activityLog: [
      { id: "a-c11-1", date: "2026-03-01T09:00:00Z", action: "Acceso bloqueado", detail: "Contrato vencido, pagos pendientes", actor: "Sistema" },
      { id: "a-c11-2", date: "2025-09-02T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2025-09-02T10:00:00Z", updatedAt: "2026-03-01T00:00:00Z",
    lastPaymentAt: "2025-11-05",
  },
  // c12 — Gimnasio (vertical Gimnasios)
  {
    id: "c12", clientNumber: "TA2-0012",
    businessType: "gym",
    specialist: {
      firstName: "Roberto", lastNamePaternal: "Gutiérrez", lastNameMaternal: "Sosa",
      publicName: "Roberto Gutiérrez",
      phone: "5511223344",
      email: "roberto@ironfit.mx",
      shortDescription: "Dueño y director del gimnasio IronFit.",
    },
    business: { name: "IronFit Gym", commercialName: "IronFit",
      street: "Blvd. Deportivo", exteriorNumber: "45",
      colony: "Polanco", municipality: "Miguel Hidalgo",
      city: "Ciudad de México", state: "Ciudad de México", postalCode: "11550",
      phone: "5511223344", whatsapp: "5511223344" },
    slug: "ironfit-gym", subdomain: "ironfit-gym.templatea2.com",
    plan: "standard",
    paymentStatus: "paid", clientStatus: "active", accessActive: true,
    publicPageStatus: "published",
    contractType: "one_year", activationDate: "2026-03-01", contractEndDate: "2027-02-28",
    monthlyAmount: 399,
    paymentHistory: mockHistory("2026-03-01", "one_year", 399, 4),
    onboardingStatus: "in_progress",
    onboardingChecklist: { basicData: true, services: false, address: true, paymentMethods: false, templateSelected: false, colorsSelected: false, testimonials: false },
    internalNotes: "Cliente Gimnasio piloto. Producto Gimnasios en desarrollo.",
    salesRepId: "rep2", salesRepName: "Luis Pérez", sellerNumber: "VEN-0002",
    activityLog: [
      { id: "a-c12-1", date: "2026-03-01T10:00:00Z", action: "Cliente creado", detail: "Apertura verificada — IronFit Gym", actor: "Admin" },
    ],
    documents: [], contracts: [],
    createdAt: "2026-03-01T10:00:00Z",
    lastPaymentAt: "2026-06-01", nextPaymentDueAt: "2026-07-01",
  },
];

// ── Mock pre-clients ──────────────────────────────────────────────────────────

const MOCK_PRE_CLIENTS: PreClient[] = [
  {
    id: "pre1",
    preClientNumber: "PRE-0001",
    specialistName: "Ana García",
    phone: "5544332211",
    businessName: "Estética Dental Ana García",
    businessType: "dentist",
    sellerId: "rep1",
    sellerNumber: "VEN-0001",
    status: "awaiting_payment",
    notes: "Acordó contrato anual Pro. Transferencia enviada el 17 de junio, pendiente de verificar.",
    createdAt: "2026-06-15T10:00:00Z",
    updatedAt: "2026-06-17T14:00:00Z",
  },
  {
    id: "pre2",
    preClientNumber: "PRE-0002",
    specialistName: "Luis Hernández",
    phone: "5533221100",
    businessName: "Consultorio Dr. Hernández",
    businessType: "doctor",
    sellerId: "rep2",
    sellerNumber: "VEN-0002",
    status: "awaiting_payment",
    notes: "Interesado en plan anual. Solicita descuento por pago adelantado.",
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-18T11:00:00Z",
  },
  {
    id: "pre3",
    preClientNumber: "PRE-0003",
    specialistName: "Valentina Cruz",
    phone: "5577889900",
    businessName: "Nutrición Integral Cruz",
    businessType: "nutritionist",
    sellerId: "rep1",
    sellerNumber: "VEN-0001",
    status: "awaiting_payment",
    notes: "Pidió demo de la plataforma. Seguimiento pendiente.",
    createdAt: "2026-06-08T15:00:00Z",
  },
  {
    id: "pre4",
    preClientNumber: "PRE-0004",
    specialistName: "Roberto Torres",
    phone: "5500112233",
    businessType: "physiotherapist",
    status: "awaiting_payment",
    notes: "Contactado por WhatsApp. Pendiente llamada de presentación.",
    createdAt: "2026-06-12T10:00:00Z",
  },
  {
    id: "pre5",
    preClientNumber: "PRE-0005",
    specialistName: "Marco Jiménez",
    phone: "5511002233",
    businessName: "PsicoBalance",
    businessType: "psychologist",
    status: "awaiting_payment",
    createdAt: "2026-06-20T16:00:00Z",
  },
  {
    id: "pre6",
    preClientNumber: "PRE-0006",
    specialistName: "Jorge Salinas",
    phone: "5566778899",
    businessName: "Fisioterapia Movimiento",
    businessType: "physiotherapist",
    sellerId: "rep2",
    sellerNumber: "VEN-0002",
    status: "converted",
    convertedClientId: "c4",
    notes: "Convertido en cliente TA2-0004 en enero 2026.",
    createdAt: "2025-12-28T09:00:00Z",
    updatedAt: "2026-01-04T10:00:00Z",
  },
];

// ── NewClientInput (kept for internal use only) ───────────────────────────────

export type NewClientInput = Omit<
  AdminClient,
  | "id" | "clientNumber" | "createdAt" | "updatedAt"
  | "subdomain" | "accessActive" | "paymentStatus"
  | "paymentHistory" | "contractEndDate" | "onboardingStatus"
  | "activityLog" | "documents" | "lastPaymentAt" | "nextPaymentDueAt"
  | "contracts"
>;

// ── Store interface ───────────────────────────────────────────────────────────

export type AddTransferInput = Omit<TransferRecord, "id" | "createdAt" | "status" | "verifiedAt" | "rejectedAt" | "clientId" | "clientNumber">;

interface AdminStoreValue {
  clients: AdminClient[];
  salesReps: SalesRep[];
  transfers: TransferRecord[];
  commissions: CommissionRecord[];
  fortnights: Fortnight[];
  adminLog: ActivityLogItem[];
  preClients: PreClient[];

  // Clients
  updateClient: (id: string, patch: Partial<AdminClient>) => void;
  setPaymentStatus: (id: string, status: PaymentStatus) => void;
  setClientStatus: (id: string, status: ClientStatus) => void;
  setPlan: (id: string, plan: UserPlan) => void;
  setAccess: (id: string, active: boolean) => void;
  setPublicPageStatus: (id: string, status: PublicPageStatus) => void;
  setMonthStatus: (clientId: string, monthId: string, status: MonthlyPaymentStatus, transferRef?: string, transferDate?: string) => void;
  markMonthPaid: (clientId: string, monthId: string) => void;
  regenerateHistory: (clientId: string, activationDate: string, contractType: ContractType) => void;
  renewContract: (clientId: string, contractType: ContractType) => void;
  updateOnboardingChecklist: (id: string, patch: Partial<OnboardingChecklist>) => void;
  setNotes: (id: string, notes: string) => void;
  setSlug: (id: string, slug: string) => void;
  setAssignedTo: (id: string, assignedTo: string) => void;
  assignSalesRep: (clientId: string, repId: string, repName: string, sellerNumber: string) => void;
  updateSpecialist: (id: string, patch: Partial<SpecialistInfo>) => void;
  updateBusiness: (id: string, patch: Partial<BusinessInfo>) => void;
  addDocument: (clientId: string, doc: Omit<ClientDocument, "id">) => void;

  // Contracts
  addContract: (clientId: string, doc: Omit<ClientContractDocument, "id" | "clientId" | "version" | "uploadedAt">) => void;
  replaceContract: (clientId: string, contractId: string, doc: Omit<ClientContractDocument, "id" | "clientId" | "version" | "uploadedAt">) => void;
  updateContractStatus: (clientId: string, contractId: string, status: ContractDocStatus, signedAt?: string) => void;

  // Client access
  updateClientAccessPhone: (clientId: string, phone: string) => void;
  setMustChangePassword: (clientId: string, value: boolean) => void;
  updateClientLastAccess: (clientId: string) => void;

  // Transfers
  addTransfer: (data: AddTransferInput) => string | null; // returns id or null if ref duplicate
  verifyOpeningTransfer: (transferId: string) => void;
  activateClientFromTransfer: (transferId: string, input: ActivationInput) => void;
  verifyMonthlyTransfer: (transferId: string) => void;
  applyMonthlyInstallment: (
    transferId: string,
    periodKey: string,
    mode: "full" | "partial" | "excess_to_next" | "excess_pending"
  ) => void;
  rejectTransfer: (transferId: string) => void;
  refundTransfer: (transferId: string) => void;

  // Commissions
  authorizeCommission: (commissionId: string) => void;
  markCommissionPaid: (commissionId: string, transferRef?: string, transferDate?: string) => void;
  markCommissionsPaid: (ids: string[], opts: { paidAt: string; method: PaymentMethod; reference?: string; note?: string }) => void;
  cancelCommission: (commissionId: string) => void;
  ensureFirstMonthlyCommission: (clientId: string) => void;
  cancelWaitingFirstMonthlyCommission: (clientId: string) => void;

  // Sales reps
  addSalesRep: (data: Omit<SalesRep, "id" | "sellerNumber" | "createdAt">) => void;
  updateSalesRep: (repId: string, patch: Partial<Omit<SalesRep, "id" | "sellerNumber" | "createdAt">>) => void;
  toggleSalesRep: (repId: string) => void;

  // Fortnights
  ensureFortnight: (date: string) => void;
  closeFortnight: (fortnightId: string) => void;
  reopenFortnight: (fortnightId: string) => void;

  // Pre-clients
  addPreClient: (data: Omit<PreClient, "id" | "preClientNumber" | "createdAt">) => void;
  updatePreClient: (id: string, patch: Partial<PreClient>) => void;
  setPreClientStatus: (id: string, status: PreClientStatus) => void;

  // Monthly payment periods (partial payments)
  monthlyPeriods: import("@/types/user").MonthlyPaymentPeriod[];

  // Finance module state
  fixedExpenses: MonthlyFixedExpense[];
  otherMovements: OtherFinancialMovement[];
  taxRecords: MonthlyTaxRecord[];
  invoices: InvoiceRecord[];
  bankMovements: BankMovement[];
  monthlyCloses: MonthlyCloseRecord[];
  financialLog: FinancialLogItem[];
  bankAccountConfig: BankAccountConfig | null;

  // Fixed expenses
  addFixedExpense: (data: Omit<MonthlyFixedExpense, "id" | "createdAt" | "paymentHistory">) => void;
  updateFixedExpense: (id: string, patch: Partial<MonthlyFixedExpense>) => void;
  markFixedExpensePaid: (id: string, payment: Omit<FixedExpensePayment, "id">) => void;
  toggleFixedExpense: (id: string) => void;
  deleteFixedExpense: (id: string) => void;

  // Other movements
  addOtherMovement: (data: Omit<OtherFinancialMovement, "id" | "createdAt">) => void;
  updateOtherMovement: (id: string, patch: Partial<OtherFinancialMovement>) => void;
  deleteOtherMovement: (id: string) => void;

  // Bank account config
  saveBankAccountConfig: (data: Omit<BankAccountConfig, "id" | "createdAt" | "updatedAt">) => void;

  // Tax records
  upsertTaxRecord: (year: number, month: number, data: Partial<Omit<MonthlyTaxRecord, "id" | "year" | "month" | "createdAt">>) => void;
  markTaxPaid: (id: string, amount: number, paidAt: string) => void;

  // Invoices
  addInvoice: (data: Omit<InvoiceRecord, "id" | "createdAt">) => void;
  updateInvoice: (id: string, patch: Partial<InvoiceRecord>) => void;

  // Bank movements
  addBankMovement: (data: Omit<BankMovement, "id" | "createdAt">) => void;
  reconcileBankMovement: (id: string, status: ReconciliationStatus, patch?: Partial<BankMovement>) => void;

  // Monthly close
  closeMonth: (year: number, month: number) => void;
  reopenMonth: (year: number, month: number, reason: string) => void;
  isMonthClosed: (year: number, month: number) => boolean;

  // Legacy aliases
  users: AdminClient[];
  updateUser: (id: string, patch: Partial<AdminClient>) => void;
  updateClinic: (id: string, patch: Partial<BusinessInfo>) => void;
}

// ── First-monthly commission constants ───────────────────────────────────────

export const FIRST_MONTHLY_COMMISSION_TYPE = "first_monthly_payment";
const FIRST_MONTHLY_COMMISSION_CONCEPT     = "Comisión por primera mensualidad";

const AdminStoreCtx = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [fortnights, setFortnights] = useState<Fortnight[]>([]);
  const [adminLog, setAdminLog] = useState<ActivityLogItem[]>([]);
  const [preClients, setPreClients] = useState<PreClient[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<MonthlyFixedExpense[]>([]);
  const [otherMovements, setOtherMovements] = useState<OtherFinancialMovement[]>([]);
  const [taxRecords, setTaxRecords] = useState<MonthlyTaxRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [bankMovements, setBankMovements] = useState<BankMovement[]>([]);
  const [monthlyCloses, setMonthlyCloses] = useState<MonthlyCloseRecord[]>([]);
  const [financialLog, setFinancialLog] = useState<FinancialLogItem[]>([]);
  const [bankAccountConfig, setBankAccountConfig] = useState<BankAccountConfig | null>(null);
  const [monthlyPeriods, setMonthlyPeriods] = useState<import("@/types/user").MonthlyPaymentPeriod[]>([]);

  function addToAdminLog(action: string, detail?: string) {
    setAdminLog((prev) => [mkLog(action, detail), ...prev].slice(0, 300));
  }

  // ── Client actions ──────────────────────────────────────────────────────────

  const updateClient = useCallback((id: string, patch: Partial<AdminClient>) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id !== id ? c : { ...c, ...patch, updatedAt: new Date().toISOString() }
      )
    );
  }, []);

  const setPaymentStatus = useCallback((id: string, status: PaymentStatus) => {
    const accessActive = status !== "overdue" && status !== "cancelled";
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, paymentStatus: status, accessActive })),
        id, "Estado de pago cambiado", PAYMENT_STATUS_LABELS[status]
      )
    );
  }, []);

  const setClientStatus = useCallback((id: string, status: ClientStatus) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, clientStatus: status })),
        id, "Estado del cliente cambiado", CLIENT_STATUS_LABELS[status]
      )
    );
  }, []);

  const setPlan = useCallback((id: string, plan: UserPlan) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, plan })),
        id, `Plan cambiado a ${PLAN_LABELS[plan]}`
      )
    );
  }, []);

  const setAccess = useCallback((id: string, active: boolean) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, accessActive: active })),
        id, active ? "Acceso activado" : "Acceso bloqueado"
      )
    );
  }, []);

  const setPublicPageStatus = useCallback((id: string, status: PublicPageStatus) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, publicPageStatus: status })),
        id, status === "published" ? "Página publicada" : "Página oculta"
      )
    );
  }, []);

  const setMonthStatus = useCallback(
    (clientId: string, monthId: string, status: MonthlyPaymentStatus, transferRef?: string, transferDate?: string) => {
      setClients((prev) => {
        let monthLabel = "";
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const paymentHistory = c.paymentHistory.map((p) => {
            if (p.id !== monthId) return p;
            monthLabel = p.monthLabel;
            return {
              ...p, status,
              paidAt: status === "paid" ? new Date().toISOString().split("T")[0] : undefined,
              transferReference: transferRef ?? p.transferReference,
              transferDate: transferDate ?? p.transferDate,
            };
          });
          const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
          return { ...c, paymentHistory, paymentStatus, accessActive };
        });
        const action = status === "paid" ? "Pago registrado" : "Estado de pago actualizado";
        const detail = [monthLabel, transferRef].filter(Boolean).join(" · ") || undefined;
        return withLog(mapped, clientId, action, detail);
      });
    },
    []
  );

  const markMonthPaid = useCallback(
    (clientId: string, monthId: string) => setMonthStatus(clientId, monthId, "paid"),
    [setMonthStatus]
  );

  const regenerateHistory = useCallback(
    (clientId: string, activationDate: string, contractType: ContractType) => {
      setClients((prev) => {
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const paymentHistory = generatePaymentHistory(
            activationDate, contractType, c.monthlyAmount, c.paymentHistory
          );
          const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
          const contractEndDate = generateContractEndDate(activationDate, contractType);
          return { ...c, activationDate, contractType, paymentHistory, paymentStatus, accessActive, contractEndDate };
        });
        return withLog(mapped, clientId, "Contrato actualizado", CONTRACT_TYPE_LABELS[contractType]);
      });
    },
    []
  );

  const renewContract = useCallback((clientId: string, contractType: ContractType) => {
    setClients((prev) => {
      const today = new Date().toISOString().split("T")[0];
      const mapped = prev.map((c) => {
        if (c.id !== clientId) return c;
        const paymentHistory = generatePaymentHistory(today, contractType, c.monthlyAmount);
        const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
        const contractEndDate = generateContractEndDate(today, contractType);
        return { ...c, activationDate: today, contractType, contractEndDate, paymentHistory, paymentStatus, accessActive };
      });
      return withLog(mapped, clientId, "Contrato renovado", `${CONTRACT_TYPE_LABELS[contractType]} desde hoy`);
    });
  }, []);

  const updateOnboardingChecklist = useCallback(
    (id: string, patch: Partial<OnboardingChecklist>) => {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const onboardingChecklist = { ...c.onboardingChecklist, ...patch };
          const onboardingStatus = calcOnboardingStatus(onboardingChecklist);
          return { ...c, onboardingChecklist, onboardingStatus, updatedAt: new Date().toISOString() };
        })
      );
    },
    []
  );

  const setNotes = useCallback((id: string, notes: string) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, internalNotes: notes })),
        id, "Notas internas actualizadas"
      )
    );
  }, []);

  const setSlug = useCallback((id: string, slug: string) => {
    const subdomain = buildSubdomain(slug);
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, slug, subdomain })),
        id, "Subdominio actualizado", subdomain
      )
    );
  }, []);

  const setAssignedTo = useCallback((id: string, assignedTo: string) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, assignedTo })),
        id, "Responsable asignado", assignedTo
      )
    );
  }, []);

  const assignSalesRep = useCallback(
    (clientId: string, repId: string, repName: string, sellerNumber: string) => {
      setClients((prev) =>
        withLog(
          prev.map((c) =>
            c.id !== clientId ? c : { ...c, salesRepId: repId, salesRepName: repName, sellerNumber }
          ),
          clientId, "Vendedor asignado", `${sellerNumber} — ${repName}`
        )
      );
      // Update any waiting first-monthly commission for this client
      setCommissions((prev) =>
        prev.map((c) =>
          c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
          c.clientId === clientId &&
          c.status === "waiting_first_monthly_payment"
            ? { ...c, salesRepId: repId, sellerNumber }
            : c
        )
      );
    },
    []
  );

  // ── First-monthly commission lifecycle ─────────────────────────────────────

  function ensureFirstMonthlyCommission(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (!client || !client.salesRepId) return;

    const alreadyLive = commissions.some(
      (c) =>
        c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
        c.clientId === clientId &&
        c.status !== "cancelled"
    );
    if (alreadyLive) {
      // Just ensure the flag is on
      setClients((prev) =>
        prev.map((c) =>
          c.id !== clientId ? c : { ...c, firstMonthlyPaymentGeneratesCommission: true }
        )
      );
      return;
    }

    const rep = salesReps.find((r) => r.id === client.salesRepId);
    if (!rep) return;

    const now = new Date().toISOString();
    const commId = crypto.randomUUID();
    const newComm: CommissionRecord = {
      id: commId,
      salesRepId: rep.id,
      sellerNumber: rep.sellerNumber,
      transferId: "waiting",
      clientId,
      clientNumber: client.clientNumber,
      businessName: client.business.name,
      amount: client.monthlyAmount ?? 0,
      status: "waiting_first_monthly_payment",
      generatedAt: now,
      fortnightId: getFortnightId(now.split("T")[0]),
      commissionType: FIRST_MONTHLY_COMMISSION_TYPE,
      description: FIRST_MONTHLY_COMMISSION_CONCEPT,
    };

    setCommissions((prev) => {
      if (prev.some(
        (c) =>
          c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
          c.clientId === clientId &&
          c.status !== "cancelled"
      )) return prev;
      return [...prev, newComm];
    });

    setClients((prev) =>
      prev.map((c) =>
        c.id !== clientId ? c : {
          ...c,
          firstMonthlyPaymentGeneratesCommission: true,
          firstMonthlyCommissionId: commId,
        }
      )
    );
  }

  function cancelWaitingFirstMonthlyCommission(clientId: string) {
    setCommissions((prev) =>
      prev.map((c) =>
        c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
        c.clientId === clientId &&
        c.status === "waiting_first_monthly_payment"
          ? { ...c, status: "cancelled" as CommissionStatus }
          : c
      )
    );
    setClients((prev) =>
      prev.map((c) =>
        c.id !== clientId ? c : {
          ...c,
          firstMonthlyPaymentGeneratesCommission: false,
          firstMonthlyCommissionGenerated: false,
          firstMonthlyCommissionId: undefined,
        }
      )
    );
  }

  function activateFirstMonthlyCommission(clientId: string, transferId: string) {
    setCommissions((prev) =>
      prev.map((c) =>
        c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
        c.clientId === clientId &&
        c.status === "waiting_first_monthly_payment"
          ? { ...c, status: "authorized" as CommissionStatus, transferId, authorizedAt: new Date().toISOString() }
          : c
      )
    );
  }

  const updateSpecialist = useCallback((id: string, patch: Partial<SpecialistInfo>) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id !== id
          ? c
          : { ...c, specialist: { ...c.specialist, ...patch }, updatedAt: new Date().toISOString() }
      )
    );
  }, []);

  const updateBusiness = useCallback((id: string, patch: Partial<BusinessInfo>) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id !== id
          ? c
          : { ...c, business: { ...c.business, ...patch }, updatedAt: new Date().toISOString() }
      )
    );
  }, []);

  const addDocument = useCallback((clientId: string, doc: Omit<ClientDocument, "id">) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const newDoc: ClientDocument = {
          ...doc, id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString().split("T")[0],
        };
        return { ...c, documents: [...c.documents, newDoc], updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  // ── Contract actions ────────────────────────────────────────────────────────

  const addContract = useCallback(
    (clientId: string, doc: Omit<ClientContractDocument, "id" | "clientId" | "version" | "uploadedAt">) => {
      setClients((prev) => {
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const maxVersion = c.contracts.reduce((m, x) => Math.max(m, x.version), 0);
          const newDoc: ClientContractDocument = {
            ...doc, id: crypto.randomUUID(), clientId,
            version: maxVersion + 1, uploadedAt: new Date().toISOString(),
          };
          return { ...c, contracts: [...c.contracts, newDoc], updatedAt: new Date().toISOString() };
        });
        return withLog(mapped, clientId, "Contrato cargado", doc.fileName);
      });
    },
    []
  );

  const replaceContract = useCallback(
    (clientId: string, _contractId: string, doc: Omit<ClientContractDocument, "id" | "clientId" | "version" | "uploadedAt">) => {
      setClients((prev) => {
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const maxVersion = c.contracts.reduce((m, x) => Math.max(m, x.version), 0);
          const newDoc: ClientContractDocument = {
            ...doc, id: crypto.randomUUID(), clientId,
            version: maxVersion + 1, uploadedAt: new Date().toISOString(),
          };
          return { ...c, contracts: [...c.contracts, newDoc], updatedAt: new Date().toISOString() };
        });
        return withLog(mapped, clientId, "Contrato reemplazado", doc.fileName);
      });
    },
    []
  );

  const updateContractStatus = useCallback(
    (clientId: string, contractId: string, status: ContractDocStatus, signedAt?: string) => {
      setClients((prev) => {
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const contracts = c.contracts.map((x) =>
            x.id !== contractId ? x : { ...x, status, signedAt: signedAt ?? x.signedAt }
          );
          return { ...c, contracts, updatedAt: new Date().toISOString() };
        });
        return withLog(mapped, clientId, "Estado de contrato actualizado", CONTRACT_DOC_STATUS_LABELS[status]);
      });
    },
    []
  );

  // ── Transfer actions ────────────────────────────────────────────────────────

  // addTransfer reads transfers state — keep as normal function to avoid stale closure
  function addTransfer(data: AddTransferInput): string | null {
    // Check duplicate reference
    const isDuplicate = transfers.some(
      (t) => t.referenceNumber.trim().toLowerCase() === data.referenceNumber.trim().toLowerCase()
    );
    if (isDuplicate) return null;

    const id = crypto.randomUUID();
    const newTransfer: TransferRecord = {
      ...data, id, status: "pending", createdAt: new Date().toISOString(),
    };
    setTransfers((prev) => [newTransfer, ...prev]);
    addToAdminLog("Transferencia registrada", `${data.referenceNumber} — $${data.amount}`);
    return id;
  }

  // verifyOpeningTransfer marks payment confirmed but does NOT create a client yet.
  // Call activateClientFromTransfer() after the activation wizard completes.
  function verifyOpeningTransfer(transferId: string) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || transfer.type !== "opening") return;
    if (transfer.status !== "pending" && transfer.status !== "activation_error") return;
    if (transfer.clientId) return; // already provisioned

    const now = new Date().toISOString();
    setTransfers((prev) =>
      prev.map((t) =>
        t.id !== transferId
          ? t
          : { ...t, status: "pending_activation" as TransferStatus, verifiedAt: now }
      )
    );
    addToAdminLog("Pago confirmado — activación pendiente", `${transfer.referenceNumber}`);
  }

  // activateClientFromTransfer provisions the client from an opening transfer.
  // Idempotent: if clientId is already set the call is a no-op.
  function activateClientFromTransfer(transferId: string, input: ActivationInput) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || transfer.type !== "opening") return;
    if (transfer.clientId) return; // already provisioned — idempotent guard

    const now = new Date().toISOString();
    const clientId = "clt-" + transferId;
    const clientNumber = generateClientNumber(clients);

    const slug = input.slug || generateSlug(input.businessName);
    const paymentHistory = generatePaymentHistory(input.activationDate, input.contractType, input.monthlyAmount);
    const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
    const contractEndDate = generateContractEndDate(input.activationDate, input.contractType);

    const newClient: AdminClient = {
      id: clientId, clientNumber,
      businessType: input.businessType,
      specialist: {
        firstName: input.firstName,
        lastNamePaternal: input.lastName,
        publicName: `${input.firstName} ${input.lastName}`.trim(),
        phone: input.phone,
        whatsapp: input.phone,
        email: input.email,
      },
      business: { name: input.businessName, businessType: input.businessType },
      slug, subdomain: buildSubdomain(slug),
      accessPhone: input.accessPhone?.replace(/[^\d]/g, "") || input.phone?.replace(/[^\d]/g, ""),
      mustChangePassword: input.mustChangePassword ?? true,
      plan: input.plan,
      paymentStatus, clientStatus: "active", accessActive,
      publicPageStatus: "hidden",
      contractType: input.contractType,
      activationDate: input.activationDate,
      contractEndDate,
      monthlyAmount: input.monthlyAmount,
      firstMonthlyPaymentGeneratesCommission: input.firstMonthlyPaymentGeneratesCommission,
      paymentHistory,
      onboardingStatus: "not_started",
      onboardingChecklist: { ...EMPTY_CL },
      salesRepId: transfer.sellerId,
      salesRepName: transfer.sellerName,
      sellerNumber: transfer.sellerNumber,
      activityLog: [mkLog("Cliente creado", `Apertura activada — ${transfer.referenceNumber}`)],
      documents: [], contracts: [],
      createdAt: now,
    };

    setClients((prev) => {
      if (prev.some((c) => c.id === clientId)) return prev;
      return [...prev, newClient];
    });

    // Update transfer with clientId and mark verified
    setTransfers((prev) =>
      prev.map((t) =>
        t.id !== transferId
          ? t
          : { ...t, status: "verified" as TransferStatus, clientId, clientNumber }
      )
    );

    // Create commission (authorized immediately)
    const fortnightId = getFortnightId(transfer.transferDate);
    const commissionId = "com-" + transferId;
    setCommissions((prev) => {
      if (prev.some((c) => c.id === commissionId)) return prev;
      const commission: CommissionRecord = {
        id: commissionId,
        salesRepId: transfer.sellerId ?? "",
        sellerNumber: transfer.sellerNumber ?? "",
        transferId,
        clientId, clientNumber,
        businessName: input.businessName,
        amount: transfer.fixedCommissionAmount ?? 0,
        status: "authorized",
        generatedAt: now, authorizedAt: now,
        fortnightId,
      };
      return [...prev, commission];
    });

    // Ensure fortnight
    setFortnights((prev) => {
      if (prev.some((f) => f.id === fortnightId)) return prev;
      const label = getFortnightLabel(transfer.transferDate);
      const d = new Date(transfer.transferDate + "T00:00:00");
      const half = d.getDate() <= 15 ? 1 : 2;
      return [...prev, { id: fortnightId, year: d.getFullYear(), month: d.getMonth() + 1, half: half as 1 | 2, label, closed: false }];
    });

    // Mark pre-client converted if linked
    if (transfer.preClientId) {
      setPreClients((prev) =>
        prev.map((p) =>
          p.id !== transfer.preClientId
            ? p
            : { ...p, status: "converted" as PreClientStatus, convertedClientId: clientId, convertedAt: now, updatedAt: now }
        )
      );
    }

    // Create provisional "waiting" first-monthly commission if requested
    if (input.firstMonthlyPaymentGeneratesCommission && transfer.sellerId) {
      const rep = salesReps.find((r) => r.id === transfer.sellerId);
      if (rep) {
        const fmCommId = crypto.randomUUID();
        const waitingComm: CommissionRecord = {
          id: fmCommId,
          salesRepId: rep.id,
          sellerNumber: rep.sellerNumber,
          transferId: "waiting",
          clientId,
          clientNumber,
          businessName: input.businessName,
          amount: input.monthlyAmount ?? 0,
          status: "waiting_first_monthly_payment",
          generatedAt: now,
          fortnightId: getFortnightId(now.split("T")[0]),
          commissionType: FIRST_MONTHLY_COMMISSION_TYPE,
          description: FIRST_MONTHLY_COMMISSION_CONCEPT,
        };
        setCommissions((prev) => {
          if (prev.some(
            (c) =>
              c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
              c.clientId === clientId &&
              c.status !== "cancelled"
          )) return prev;
          return [...prev, waitingComm];
        });
        setClients((prev) =>
          prev.map((c) =>
            c.id !== clientId ? c : { ...c, firstMonthlyCommissionId: fmCommId }
          )
        );
        addToAdminLog("Com. 1ª mensualidad (en espera)", `${clientNumber} — ${rep.sellerNumber}`);
      }
    }

    addToAdminLog("Cliente activado", `${clientNumber} — ${input.businessName}`);
    addToAdminLog("Comisión generada (autorizada)", `${transfer.sellerNumber ?? ""} — $${transfer.fixedCommissionAmount ?? 0}`);
  }

  // verifyMonthlyTransfer marks a payment month as paid
  function verifyMonthlyTransfer(transferId: string) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || transfer.type !== "monthly" || transfer.status !== "pending") return;
    if (!transfer.specialistId || !transfer.paymentMonth) return;

    const now = new Date().toISOString();

    setTransfers((prev) =>
      prev.map((t) =>
        t.id !== transferId ? t : { ...t, status: "verified" as TransferStatus, verifiedAt: now }
      )
    );

    setClients((prev) => {
      const mapped = prev.map((c) => {
        if (c.id !== transfer.specialistId) return c;
        const paymentHistory = c.paymentHistory.map((p) => {
          if (p.monthLabel !== transfer.paymentMonth) return p;
          return {
            ...p,
            status: "paid" as MonthlyPaymentStatus,
            paidAt: now.split("T")[0],
            transferReference: transfer.referenceNumber,
            transferDate: transfer.transferDate,
            transferId: transfer.id,
          };
        });
        const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
        return { ...c, paymentHistory, paymentStatus, accessActive };
      });
      return withLog(mapped, transfer.specialistId!, "Mensualidad verificada",
        `${transfer.paymentMonth} — ${transfer.referenceNumber}`);
    });

    addToAdminLog("Mensualidad marcada pagada", `${transfer.clientNumber} — ${transfer.paymentMonth}`);
  }

  // Convert "junio de 2026" → "2026-06"
  function monthLabelToPeriodKey(label: string): string {
    const MONTH_MAP: Record<string, string> = {
      enero: "01", febrero: "02", marzo: "03", abril: "04",
      mayo: "05", junio: "06", julio: "07", agosto: "08",
      septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    const parts = label.toLowerCase().split(" de ");
    if (parts.length !== 2) return label;
    const [mon, yr] = parts;
    return `${yr.trim()}-${MONTH_MAP[mon.trim()] ?? "01"}`;
  }

  // applyMonthlyInstallment — the partial-payment aware alternative to verifyMonthlyTransfer
  function applyMonthlyInstallment(
    transferId: string,
    periodKey: string,
    mode: "full" | "partial" | "excess_to_next" | "excess_pending",
  ) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || transfer.type !== "monthly" || transfer.status !== "pending") return;
    if (!transfer.specialistId) return;

    const client = clients.find((c) => c.id === transfer.specialistId);
    const expectedAmount = client?.monthlyAmount ?? 0;
    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const installmentId = `inst-${Date.now()}`;

    // Determine effective amount for this period (cap at remaining if excess_to_next / excess_pending)
    setMonthlyPeriods((prev) => {
      const existing = prev.find((p) => p.clientId === transfer.specialistId && p.period === periodKey);
      const paidSoFar = existing?.paidAmount ?? 0;
      const remaining = existing ? existing.remainingAmount : expectedAmount;
      const applyAmount = (mode === "excess_to_next" || mode === "excess_pending")
        ? Math.min(transfer.amount, remaining)
        : transfer.amount;

      const newPaid = paidSoFar + applyAmount;
      const newRemaining = Math.max(0, (existing ? existing.remainingAmount : expectedAmount) - applyAmount);
      const newStatus: import("@/types/user").MonthlyPaymentPeriod["status"] =
        newRemaining <= 0 ? "paid" : newPaid > 0 ? "partial" : "pending";

      const installment: import("@/types/user").PaymentInstallment = {
        id: installmentId,
        amount: applyAmount,
        date: today,
        method: undefined,
        reference: transfer.referenceNumber,
        transferId: transfer.id,
      };

      if (existing) {
        return prev.map((p) =>
          p.clientId === transfer.specialistId && p.period === periodKey
            ? { ...p, paidAmount: newPaid, remainingAmount: newRemaining, status: newStatus, installments: [...p.installments, installment] }
            : p
        );
      } else {
        const newPeriod: import("@/types/user").MonthlyPaymentPeriod = {
          id: `period-${transfer.specialistId}-${periodKey}`,
          clientId: transfer.specialistId!,
          period: periodKey,
          expectedAmount,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          installments: [installment],
        };
        return [...prev, newPeriod];
      }
    });

    // If excess_to_next: create / update the next period with the surplus
    if (mode === "excess_to_next") {
      const existing = monthlyPeriods.find((p) => p.clientId === transfer.specialistId && p.period === periodKey);
      const remaining = existing ? existing.remainingAmount : expectedAmount;
      const surplus = transfer.amount - Math.min(transfer.amount, remaining);
      if (surplus > 0) {
        const [yr, mo] = periodKey.split("-").map(Number);
        const nextDate = new Date(yr, mo, 1); // next month
        const nextKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
        const nextInstallment: import("@/types/user").PaymentInstallment = {
          id: `inst-next-${Date.now()}`,
          amount: surplus,
          date: today,
          reference: transfer.referenceNumber,
          transferId: transfer.id,
        };
        setMonthlyPeriods((prev) => {
          const nextPeriod = prev.find((p) => p.clientId === transfer.specialistId && p.period === nextKey);
          if (nextPeriod) {
            const np = nextPeriod.paidAmount + surplus;
            const nr = Math.max(0, nextPeriod.remainingAmount - surplus);
            return prev.map((p) =>
              p.clientId === transfer.specialistId && p.period === nextKey
                ? { ...p, paidAmount: np, remainingAmount: nr, status: nr <= 0 ? "paid" : "partial", installments: [...p.installments, nextInstallment] }
                : p
            );
          }
          return [...prev, {
            id: `period-${transfer.specialistId}-${nextKey}`,
            clientId: transfer.specialistId!,
            period: nextKey,
            expectedAmount,
            paidAmount: surplus,
            remainingAmount: Math.max(0, expectedAmount - surplus),
            status: surplus >= expectedAmount ? "paid" : "partial",
            installments: [nextInstallment],
          }];
        });
      }
    }

    // Mark transfer as verified
    setTransfers((prev) =>
      prev.map((t) =>
        t.id !== transferId ? t : { ...t, status: "verified" as TransferStatus, verifiedAt: now }
      )
    );

    // Also update the legacy paymentHistory on the client for backwards compat
    if (transfer.paymentMonth) {
      setClients((prev) => {
        const mapped = prev.map((c) => {
          if (c.id !== transfer.specialistId) return c;
          const paymentHistory = c.paymentHistory.map((p) => {
            if (p.monthLabel !== transfer.paymentMonth) return p;
            const periodStatus = mode === "full" || mode === "excess_to_next" || mode === "excess_pending"
              ? "paid" as MonthlyPaymentStatus
              : "pending" as MonthlyPaymentStatus;
            return { ...p, status: periodStatus, paidAt: today, transferReference: transfer.referenceNumber, transferDate: transfer.transferDate, transferId: transfer.id };
          });
          const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
          return { ...c, paymentHistory, paymentStatus, accessActive };
        });
        return withLog(mapped, transfer.specialistId!, "Mensualidad verificada", `${transfer.paymentMonth} — ${transfer.referenceNumber}`);
      });
    }

    addToAdminLog("Mensualidad aplicada", `${transfer.clientNumber} — ${periodKey} (${mode})`);

    // Activate waiting first-monthly commission on first confirmed payment (any amount)
    const clientForComm = clients.find((c) => c.id === transfer.specialistId);
    if (clientForComm) {
      const firstPeriodKey = clientForComm.activationDate.slice(0, 7);
      if (periodKey === firstPeriodKey) {
        const waitingComm = commissions.find(
          (c) =>
            c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
            c.clientId === clientForComm.id &&
            c.status === "waiting_first_monthly_payment"
        );
        if (waitingComm) {
          activateFirstMonthlyCommission(clientForComm.id, transfer.id);
          addToAdminLog(FIRST_MONTHLY_COMMISSION_CONCEPT + " — activada", `${clientForComm.clientNumber}`);
        }
      }
    }
  }

  function rejectTransfer(transferId: string) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || (transfer.status !== "pending" && transfer.status !== "pending_activation")) return;
    const now = new Date().toISOString();
    setTransfers((prev) =>
      prev.map((t) =>
        t.id !== transferId ? t : { ...t, status: "rejected" as TransferStatus, rejectedAt: now }
      )
    );
    // Cancel any commission linked to this transfer
    setCommissions((prev) =>
      prev.map((c) =>
        c.transferId !== transferId ? c : { ...c, status: "cancelled" as CommissionStatus }
      )
    );
    addToAdminLog("Transferencia rechazada", transfer.referenceNumber);
  }

  function refundTransfer(transferId: string) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || (transfer.status !== "verified" && transfer.status !== "rejected")) return;
    setTransfers((prev) =>
      prev.map((t) =>
        t.id !== transferId ? t : { ...t, status: "refunded" as TransferStatus }
      )
    );
    setCommissions((prev) =>
      prev.map((c) =>
        c.transferId !== transferId ? c : { ...c, status: "cancelled" as CommissionStatus }
      )
    );
    addToAdminLog("Transferencia reembolsada", transfer.referenceNumber);
  }

  // ── Client access actions ───────────────────────────────────────────────────

  function updateClientAccessPhone(clientId: string, phone: string) {
    const norm = phone.replace(/[^\d]/g, "");
    setClients((prev) =>
      withLog(
        prev.map((c) => c.id !== clientId ? c : { ...c, accessPhone: norm }),
        clientId, "Teléfono de acceso actualizado", norm,
      )
    );
  }

  function setMustChangePassword(clientId: string, value: boolean) {
    setClients((prev) =>
      prev.map((c) => c.id !== clientId ? c : { ...c, mustChangePassword: value })
    );
  }

  function updateClientLastAccess(clientId: string) {
    setClients((prev) =>
      prev.map((c) => c.id !== clientId ? c : { ...c, lastAccessAt: new Date().toISOString() })
    );
  }

  // ── Commission actions ──────────────────────────────────────────────────────

  const authorizeCommission = useCallback((commissionId: string) => {
    setCommissions((prev) =>
      prev.map((c) => {
        if (c.id !== commissionId || c.status !== "pending") return c;
        addToAdminLog("Comisión autorizada", `${c.sellerNumber} — $${c.amount}`);
        return { ...c, status: "authorized" as CommissionStatus, authorizedAt: new Date().toISOString() };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markCommissionPaid = useCallback(
    (commissionId: string, transferRef?: string, transferDate?: string) => {
      setCommissions((prev) =>
        prev.map((c) => {
          if (c.id !== commissionId || c.status !== "authorized") return c;
          addToAdminLog("Comisión pagada", `${c.sellerNumber} — $${c.amount}`);
          return {
            ...c,
            status: "paid" as CommissionStatus,
            paidAt: new Date().toISOString(),
            paidTransferRef: transferRef ?? c.paidTransferRef,
            paidTransferDate: transferDate ?? c.paidTransferDate,
          };
        })
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  );

  const markCommissionsPaid = useCallback(
    (ids: string[], opts: { paidAt: string; method: PaymentMethod; reference?: string; note?: string }) => {
      setCommissions((prev) =>
        prev.map((c) => {
          if (!ids.includes(c.id) || c.status !== "authorized") return c;
          addToAdminLog("Comisión pagada", `${c.sellerNumber} — $${c.amount}`);
          return {
            ...c,
            status: "paid" as CommissionStatus,
            paidAt: new Date(opts.paidAt + "T12:00:00").toISOString(),
            paidTransferRef: opts.reference,
            paidTransferDate: opts.paidAt,
          };
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const cancelCommission = useCallback((commissionId: string) => {
    setCommissions((prev) =>
      prev.map((c) => {
        if (c.id !== commissionId) return c;
        addToAdminLog("Comisión cancelada", `${c.sellerNumber} — $${c.amount}`);
        return { ...c, status: "cancelled" as CommissionStatus };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sales rep actions ───────────────────────────────────────────────────────

  const addSalesRep = useCallback(
    (data: Omit<SalesRep, "id" | "sellerNumber" | "createdAt">) => {
      setSalesReps((prev) => {
        const sellerNumber = generateSellerNumber(prev);
        const newRep: SalesRep = { ...data, id: crypto.randomUUID(), sellerNumber, createdAt: new Date().toISOString() };
        addToAdminLog("Vendedor creado", `${sellerNumber} — ${newRep.name}`);
        return [...prev, newRep];
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const updateSalesRep = useCallback(
    (repId: string, patch: Partial<Omit<SalesRep, "id" | "sellerNumber" | "createdAt">>) => {
      setSalesReps((prev) =>
        prev.map((r) => (r.id !== repId ? r : { ...r, ...patch }))
      );
    },
    []
  );

  const toggleSalesRep = useCallback((repId: string) => {
    setSalesReps((prev) =>
      prev.map((r) => {
        if (r.id !== repId) return r;
        const next = { ...r, active: !r.active };
        addToAdminLog(next.active ? "Vendedor activado" : "Vendedor desactivado", `${r.sellerNumber} — ${r.name}`);
        return next;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fortnight actions ───────────────────────────────────────────────────────

  const ensureFortnight = useCallback((date: string) => {
    const id = getFortnightId(date);
    setFortnights((prev) => {
      if (prev.some((f) => f.id === id)) return prev;
      const label = getFortnightLabel(date);
      const d = new Date(date + "T00:00:00");
      const half = d.getDate() <= 15 ? 1 : 2;
      return [
        ...prev,
        { id, year: d.getFullYear(), month: d.getMonth() + 1, half: half as 1 | 2, label, closed: false },
      ];
    });
  }, []);

  const closeFortnight = useCallback((fortnightId: string) => {
    setFortnights((prev) =>
      prev.map((f) => {
        if (f.id !== fortnightId) return f;
        addToAdminLog("Quincena cerrada", f.label);
        return { ...f, closed: true, closedAt: new Date().toISOString(), closedBy: "Admin" };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reopenFortnight = useCallback((fortnightId: string) => {
    setFortnights((prev) =>
      prev.map((f) => {
        if (f.id !== fortnightId) return f;
        addToAdminLog("Quincena reabierta", f.label);
        return { ...f, closed: false, closedAt: undefined, closedBy: undefined };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pre-client actions ──────────────────────────────────────────────────────

  const addPreClient = useCallback(
    (data: Omit<PreClient, "id" | "preClientNumber" | "createdAt">) => {
      setPreClients((prev) => {
        const preClientNumber = generatePreClientNumber(prev);
        const newPc: PreClient = {
          ...data,
          id: crypto.randomUUID(),
          preClientNumber,
          createdAt: new Date().toISOString(),
        };
        return [newPc, ...prev];
      });
    },
    []
  );

  const updatePreClient = useCallback((id: string, patch: Partial<PreClient>) => {
    setPreClients((prev) =>
      prev.map((p) =>
        p.id !== id ? p : { ...p, ...patch, updatedAt: new Date().toISOString() }
      )
    );
  }, []);

  const setPreClientStatus = useCallback((id: string, status: PreClientStatus) => {
    setPreClients((prev) =>
      prev.map((p) =>
        p.id !== id ? p : { ...p, status, updatedAt: new Date().toISOString() }
      )
    );
  }, []);

  // ── Finance module actions ──────────────────────────────────────────────────

  function addFinancialLogEntry(action: string, entity?: string, detail?: string, newValue?: string, previousValue?: string) {
    const entry: FinancialLogItem = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      action, entity, detail, newValue, previousValue,
      actor: "Admin",
    };
    setFinancialLog((prev) => [entry, ...prev].slice(0, 500));
  }

  const addFixedExpense = useCallback((data: Omit<MonthlyFixedExpense, "id" | "createdAt" | "paymentHistory">) => {
    const expense: MonthlyFixedExpense = { ...data, id: crypto.randomUUID(), paymentHistory: [], createdAt: new Date().toISOString() };
    setFixedExpenses((prev) => [...prev, expense]);
    addFinancialLogEntry("Gasto fijo creado", data.name, undefined, `$${data.amount}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFixedExpense = useCallback((id: string, patch: Partial<MonthlyFixedExpense>) => {
    setFixedExpenses((prev) =>
      prev.map((e) => e.id !== id ? e : { ...e, ...patch, updatedAt: new Date().toISOString() })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markFixedExpensePaid = useCallback((id: string, payment: Omit<FixedExpensePayment, "id">) => {
    setFixedExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const paymentRecord: FixedExpensePayment = { ...payment, id: crypto.randomUUID() };
        // Calculate next due date based on frequency
        const nextDate = new Date(payment.paidAt + "T00:00:00");
        if (e.frequency === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
        else if (e.frequency === "bimonthly") nextDate.setMonth(nextDate.getMonth() + 2);
        else if (e.frequency === "quarterly") nextDate.setMonth(nextDate.getMonth() + 3);
        else if (e.frequency === "annual") nextDate.setFullYear(nextDate.getFullYear() + 1);
        const nextDueDate = nextDate.toISOString().split("T")[0];
        addFinancialLogEntry("Gasto fijo pagado", e.name, undefined, `$${payment.amount}`);
        return { ...e, status: "paid" as FixedExpenseStatus, nextDueDate, paymentHistory: [...e.paymentHistory, paymentRecord], updatedAt: new Date().toISOString() };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteFixedExpense = useCallback((id: string) => {
    setFixedExpenses((prev) => {
      const e = prev.find((x) => x.id === id);
      if (e) addFinancialLogEntry("Gasto fijo eliminado", e.name);
      return prev.filter((x) => x.id !== id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFixedExpense = useCallback((id: string) => {
    setFixedExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e, active: !e.active, updatedAt: new Date().toISOString() };
        addFinancialLogEntry(
          next.active ? "Gasto activado" : "Gasto pausado",
          e.name, undefined, next.active ? "activo" : "pausado", next.active ? "pausado" : "activo"
        );
        return next;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addOtherMovement = useCallback((data: Omit<OtherFinancialMovement, "id" | "createdAt">) => {
    const mov: OtherFinancialMovement = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setOtherMovements((prev) => [mov, ...prev]);
    addFinancialLogEntry(
      data.type === "other_income" ? "Ingreso adicional registrado" : "Egreso adicional registrado",
      data.name, undefined, `$${data.amount}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOtherMovement = useCallback((id: string, patch: Partial<OtherFinancialMovement>) => {
    setOtherMovements((prev) => prev.map((m) => m.id !== id ? m : { ...m, ...patch }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteOtherMovement = useCallback((id: string) => {
    setOtherMovements((prev) => {
      const m = prev.find((x) => x.id === id);
      if (m) addFinancialLogEntry("Movimiento eliminado", m.name);
      return prev.filter((x) => x.id !== id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBankAccountConfig = useCallback((data: Omit<BankAccountConfig, "id" | "createdAt" | "updatedAt">) => {
    setBankAccountConfig((prev) => ({
      ...data,
      id: prev?.id ?? crypto.randomUUID(),
      createdAt: prev?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    addFinancialLogEntry("Cuenta bancaria actualizada", data.bank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upsertTaxRecord = useCallback(
    (year: number, month: number, data: Partial<Omit<MonthlyTaxRecord, "id" | "year" | "month" | "createdAt">>) => {
      setTaxRecords((prev) => {
        const existing = prev.find((t) => t.year === year && t.month === month);
        if (existing) {
          return prev.map((t) =>
            t.year === year && t.month === month
              ? { ...t, ...data, updatedAt: new Date().toISOString() }
              : t
          );
        }
        const newRecord: MonthlyTaxRecord = {
          id: crypto.randomUUID(), year, month,
          taxPercentage: data.taxPercentage ?? 16,
          taxableBase: data.taxableBase ?? 0,
          estimatedTaxAmount: data.estimatedTaxAmount ?? 0,
          notes: data.notes,
          createdAt: new Date().toISOString(),
        };
        return [...prev, newRecord];
      });
      addFinancialLogEntry("Registro de impuesto actualizado", `${MONTH_NAMES[month - 1]} ${year}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const markTaxPaid = useCallback((id: string, amount: number, paidAt: string) => {
    setTaxRecords((prev) =>
      prev.map((t) =>
        t.id !== id ? t : { ...t, actualPaidAmount: amount, paidAt, updatedAt: new Date().toISOString() }
      )
    );
    const rec = taxRecords.find((t) => t.id === id);
    addFinancialLogEntry(
      "Impuesto pagado",
      rec ? `${MONTH_NAMES[rec.month - 1]} ${rec.year}` : id,
      undefined, `$${amount}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxRecords]);

  const addInvoice = useCallback((data: Omit<InvoiceRecord, "id" | "createdAt">) => {
    const inv: InvoiceRecord = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setInvoices((prev) => [inv, ...prev]);
    addFinancialLogEntry("Factura creada", inv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateInvoice = useCallback((id: string, patch: Partial<InvoiceRecord>) => {
    setInvoices((prev) => prev.map((i) => i.id !== id ? i : { ...i, ...patch }));
    addFinancialLogEntry("Factura actualizada", id, patch.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBankMovement = useCallback((data: Omit<BankMovement, "id" | "createdAt">) => {
    const bm: BankMovement = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setBankMovements((prev) => [bm, ...prev]);
    addFinancialLogEntry("Movimiento bancario registrado", data.description, undefined, `$${data.amount}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reconcileBankMovement = useCallback((id: string, status: ReconciliationStatus, patch?: Partial<BankMovement>) => {
    setBankMovements((prev) =>
      prev.map((b) => b.id !== id ? b : { ...b, ...patch, reconciliationStatus: status })
    );
    addFinancialLogEntry("Movimiento conciliado", id, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeMonth = useCallback((year: number, month: number) => {
    const now = new Date().toISOString();
    setMonthlyCloses((prev) => {
      const existing = prev.find((m) => m.year === year && m.month === month);
      if (existing) {
        return prev.map((m) =>
          m.year === year && m.month === month
            ? { ...m, status: "closed" as MonthlyCloseStatus, closedAt: now, closedBy: "Admin" }
            : m
        );
      }
      return [...prev, { id: crypto.randomUUID(), year, month, status: "closed", closedAt: now, closedBy: "Admin" }];
    });
    addFinancialLogEntry("Mes cerrado", `${MONTH_NAMES[month - 1]} ${year}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reopenMonth = useCallback((year: number, month: number, reason: string) => {
    const now = new Date().toISOString();
    setMonthlyCloses((prev) =>
      prev.map((m) =>
        m.year === year && m.month === month
          ? { ...m, status: "reopened" as MonthlyCloseStatus, reopenedAt: now, reopenedBy: "Admin", reopenReason: reason }
          : m
      )
    );
    addFinancialLogEntry("Mes reabierto", `${MONTH_NAMES[month - 1]} ${year}`, reason);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isMonthClosed(year: number, month: number): boolean {
    const rec = monthlyCloses.find((m) => m.year === year && m.month === month);
    return rec?.status === "closed";
  }

  // ── First-monthly commission reconciliation ─────────────────────────────────
  // Safety net: ensures commission state is consistent with client flags and
  // monthly payment records. Runs whenever relevant state changes.
  const reconciledRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const toAdd: CommissionRecord[] = [];
    const toActivate: { id: string; transferId: string }[] = [];
    const clientPatches: { id: string; commId: string }[] = [];

    for (const client of clients) {
      if (!client.firstMonthlyPaymentGeneratesCommission) continue;
      if (!client.salesRepId) continue;

      const existingComm = [...commissions, ...toAdd].find(
        (c) =>
          c.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
          c.clientId === client.id &&
          c.status !== "cancelled"
      );

      if (!existingComm) {
        // Flag on but no live commission: create "waiting"
        if (reconciledRef.current.has(`create-${client.id}`)) continue;
        const rep = salesReps.find((r) => r.id === client.salesRepId);
        if (!rep) continue;
        const now = new Date().toISOString();
        const commId = crypto.randomUUID();
        toAdd.push({
          id: commId,
          salesRepId: rep.id,
          sellerNumber: rep.sellerNumber,
          transferId: "waiting",
          clientId: client.id,
          clientNumber: client.clientNumber,
          businessName: client.business.name,
          amount: client.monthlyAmount ?? 0,
          status: "waiting_first_monthly_payment",
          generatedAt: now,
          fortnightId: getFortnightId(now.split("T")[0]),
          commissionType: FIRST_MONTHLY_COMMISSION_TYPE,
          description: FIRST_MONTHLY_COMMISSION_CONCEPT,
        });
        clientPatches.push({ id: client.id, commId });
        reconciledRef.current.add(`create-${client.id}`);
      } else if (existingComm.status === "waiting_first_monthly_payment") {
        // Waiting commission + first period has at least one payment: activate
        if (reconciledRef.current.has(`activate-${client.id}`)) continue;
        const firstPeriodKey = client.activationDate.slice(0, 7);
        const period = monthlyPeriods.find(
          (p) => p.clientId === client.id && p.period === firstPeriodKey
        );
        if (period && period.installments.length > 0) {
          const lastTransferId =
            period.installments[period.installments.length - 1]?.transferId ?? "reconciled";
          toActivate.push({ id: existingComm.id, transferId: lastTransferId });
          reconciledRef.current.add(`activate-${client.id}`);
        }
      }
    }

    if (toAdd.length > 0) {
      setCommissions((prev) => [...prev, ...toAdd]);
      setClients((prev) =>
        prev.map((c) => {
          const patch = clientPatches.find((p) => p.id === c.id);
          if (!patch) return c;
          return { ...c, firstMonthlyCommissionId: patch.commId };
        })
      );
    }

    if (toActivate.length > 0) {
      setCommissions((prev) =>
        prev.map((c) => {
          const upd = toActivate.find((u) => u.id === c.id);
          if (!upd) return c;
          return { ...c, status: "pending" as CommissionStatus, transferId: upd.transferId };
        })
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, monthlyPeriods, commissions]);

  const value: AdminStoreValue = {
    clients, salesReps, transfers, commissions, fortnights, adminLog, preClients,
    monthlyPeriods,
    fixedExpenses, otherMovements, taxRecords, invoices, bankMovements, monthlyCloses, financialLog,
    bankAccountConfig,
    updateClient,
    setPaymentStatus, setClientStatus, setPlan, setAccess, setPublicPageStatus,
    setMonthStatus, markMonthPaid, regenerateHistory, renewContract,
    updateOnboardingChecklist, setNotes, setSlug, setAssignedTo, assignSalesRep,
    updateSpecialist, updateBusiness, addDocument,
    addContract, replaceContract, updateContractStatus,
    updateClientAccessPhone, setMustChangePassword, updateClientLastAccess,
    addTransfer, verifyOpeningTransfer, activateClientFromTransfer, verifyMonthlyTransfer, applyMonthlyInstallment, rejectTransfer, refundTransfer,
    authorizeCommission, markCommissionPaid, markCommissionsPaid, cancelCommission,
    ensureFirstMonthlyCommission, cancelWaitingFirstMonthlyCommission,
    addSalesRep, updateSalesRep, toggleSalesRep,
    ensureFortnight, closeFortnight, reopenFortnight,
    addPreClient, updatePreClient, setPreClientStatus,
    addFixedExpense, updateFixedExpense, markFixedExpensePaid, toggleFixedExpense, deleteFixedExpense,
    addOtherMovement, updateOtherMovement, deleteOtherMovement,
    saveBankAccountConfig,
    upsertTaxRecord, markTaxPaid,
    addInvoice, updateInvoice,
    addBankMovement, reconcileBankMovement,
    closeMonth, reopenMonth, isMonthClosed,
    users: clients, updateUser: updateClient,
    updateClinic: updateBusiness,
  };

  return <AdminStoreCtx.Provider value={value}>{children}</AdminStoreCtx.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreCtx);
  if (!ctx) throw new Error("useAdminStore must be inside AdminStoreProvider");
  return ctx;
}
