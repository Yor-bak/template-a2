"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
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
} from "@/types/user";

// ── Auth ──────────────────────────────────────────────────────────────────────

const ADMIN_CREDS = { email: "admin@templatea2.com", password: "admin123" };

interface AdminAuthValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthCtx = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const login = useCallback((e: string, p: string) => {
    if (e === ADMIN_CREDS.email && p === ADMIN_CREDS.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);
  const logout = useCallback(() => setIsAuthenticated(false), []);
  return (
    <AdminAuthCtx.Provider value={{ isAuthenticated, login, logout }}>
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
  standard: "Standard",
  pro: "Pro",
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
  opening: "Apertura",
  monthly: "Mensualidad",
};

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  pending: "Pendiente",
  verified: "Verificada",
  rejected: "Rechazada",
  refunded: "Reembolsada",
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

// ── Mock sales reps (no email, fixed commission amount) ───────────────────────

const MOCK_SALES_REPS: SalesRep[] = [
  {
    id: "rep1", sellerNumber: "VEN-0001", name: "Pedro González",
    phone: "5512340001", active: true, fixedCommissionAmount: 500,
    createdAt: "2025-11-01T00:00:00Z",
  },
  {
    id: "rep2", sellerNumber: "VEN-0002", name: "Lucía Ramírez",
    phone: "5512340002", active: true, fixedCommissionAmount: 400,
    createdAt: "2025-11-15T00:00:00Z",
  },
  {
    id: "rep3", sellerNumber: "VEN-0003", name: "Carlos Vega",
    phone: "5512340003", active: false, fixedCommissionAmount: 500,
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
];

// ── Mock fortnights ───────────────────────────────────────────────────────────

const MOCK_FORTNIGHTS: Fortnight[] = [
  { id: "2025-12-1", year: 2025, month: 12, half: 1, label: "1a quincena de diciembre 2025 (1–15)", closed: true, closedAt: "2025-12-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-01-1", year: 2026, month: 1,  half: 1, label: "1a quincena de enero 2026 (1–15)",     closed: true, closedAt: "2026-01-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-05-1", year: 2026, month: 5,  half: 1, label: "1a quincena de mayo 2026 (1–15)",      closed: true, closedAt: "2026-05-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-06-1", year: 2026, month: 6,  half: 1, label: "1a quincena de junio 2026 (1–15)",     closed: true, closedAt: "2026-06-16T09:00:00Z", closedBy: "Admin" },
  { id: "2026-06-2", year: 2026, month: 6,  half: 2, label: "2a quincena de junio 2026 (16–30)",    closed: false },
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
  const today = new Date("2026-06-19T00:00:00");
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
    specialist: spec1, business: business1,
    slug: "negocio-sonrisa", subdomain: "negocio-sonrisa.templatea2.com",
    plan: "pro", isPro: true,
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
    specialist: spec2, business: business2,
    slug: "doctor-mendoza", subdomain: "doctor-mendoza.templatea2.com",
    plan: "standard", isPro: false,
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
    specialist: spec3, business: business3,
    slug: "dental-familiar", subdomain: "dental-familiar.templatea2.com",
    plan: "pro", isPro: true,
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
    specialist: spec4, business: business4,
    slug: "fisio-movimiento", subdomain: "fisio-movimiento.templatea2.com",
    plan: "standard", isPro: false,
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

  // Transfers
  addTransfer: (data: AddTransferInput) => string | null; // returns id or null if ref duplicate
  verifyOpeningTransfer: (transferId: string) => void;
  verifyMonthlyTransfer: (transferId: string) => void;
  rejectTransfer: (transferId: string) => void;
  refundTransfer: (transferId: string) => void;

  // Commissions
  authorizeCommission: (commissionId: string) => void;
  markCommissionPaid: (commissionId: string, transferRef?: string, transferDate?: string) => void;
  cancelCommission: (commissionId: string) => void;

  // Sales reps
  addSalesRep: (data: Omit<SalesRep, "id" | "sellerNumber" | "createdAt">) => void;
  updateSalesRep: (repId: string, patch: Partial<Omit<SalesRep, "id" | "sellerNumber" | "createdAt">>) => void;
  toggleSalesRep: (repId: string) => void;

  // Fortnights
  ensureFortnight: (date: string) => void;
  closeFortnight: (fortnightId: string) => void;
  reopenFortnight: (fortnightId: string) => void;

  // Legacy aliases
  users: AdminClient[];
  updateUser: (id: string, patch: Partial<AdminClient>) => void;
  togglePro: (id: string) => void;
  updateClinic: (id: string, patch: Partial<BusinessInfo>) => void;
}

const AdminStoreCtx = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<AdminClient[]>(MOCK_CLIENTS);
  const [salesReps, setSalesReps] = useState<SalesRep[]>(MOCK_SALES_REPS);
  const [transfers, setTransfers] = useState<TransferRecord[]>(MOCK_TRANSFERS);
  const [commissions, setCommissions] = useState<CommissionRecord[]>(MOCK_COMMISSIONS);
  const [fortnights, setFortnights] = useState<Fortnight[]>(MOCK_FORTNIGHTS);
  const [adminLog, setAdminLog] = useState<ActivityLogItem[]>(MOCK_ADMIN_LOG);

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
        prev.map((c) => (c.id !== id ? c : { ...c, plan, isPro: plan === "pro" })),
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
    },
    []
  );

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

  // verifyOpeningTransfer creates a client + commission from the transfer
  function verifyOpeningTransfer(transferId: string) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || transfer.type !== "opening" || transfer.status !== "pending") return;
    if (transfer.clientId) return; // already processed — prevent double-creation

    const now = new Date().toISOString();
    const clientId = "clt-" + transferId;
    const clientNumber = generateClientNumber(clients);

    // 1. Mark transfer verified
    setTransfers((prev) =>
      prev.map((t) =>
        t.id !== transferId
          ? t
          : { ...t, status: "verified" as TransferStatus, verifiedAt: now, clientId, clientNumber }
      )
    );

    // 2. Create client
    const names = (transfer.prospectName ?? "").trim().split(/\s+/);
    const slug = generateSlug(transfer.prospectiveBusinessName ?? transfer.prospectName ?? "negocio");
    const activationDate = transfer.transferDate;
    const contractType: ContractType = "six_months";
    const paymentHistory = generatePaymentHistory(activationDate, contractType, transfer.amount);
    const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
    const contractEndDate = generateContractEndDate(activationDate, contractType);

    const newClient: AdminClient = {
      id: clientId, clientNumber,
      specialist: {
        firstName: names[0] ?? "Especialista",
        lastNamePaternal: names[1] ?? "",
        lastNameMaternal: names.slice(2).join(" ") || undefined,
        publicName: transfer.prospectName ?? "Especialista",
        phone: transfer.prospectPhone,
        whatsapp: transfer.prospectPhone,
      },
      business: { name: transfer.prospectiveBusinessName ?? transfer.prospectName ?? "Negocio" },
      slug, subdomain: buildSubdomain(slug),
      plan: "standard", isPro: false,
      paymentStatus, clientStatus: "active", accessActive,
      publicPageStatus: "hidden",
      contractType, activationDate, contractEndDate, monthlyAmount: transfer.amount,
      paymentHistory,
      onboardingStatus: "not_started",
      onboardingChecklist: { ...EMPTY_CL },
      salesRepId: transfer.sellerId,
      salesRepName: transfer.sellerName,
      sellerNumber: transfer.sellerNumber,
      activityLog: [mkLog("Cliente creado", `Apertura verificada — ${transfer.referenceNumber}`)],
      documents: [], contracts: [],
      createdAt: now,
    };
    setClients((prev) => {
      if (prev.some((c) => c.id === clientId)) return prev;
      return [...prev, newClient];
    });

    // 3. Create commission (authorized immediately per spec)
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
        businessName: transfer.prospectiveBusinessName ?? "",
        amount: transfer.fixedCommissionAmount ?? 0,
        status: "authorized",
        generatedAt: now, authorizedAt: now,
        fortnightId,
      };
      return [...prev, commission];
    });

    // 4. Ensure fortnight
    const fnId = fortnightId;
    setFortnights((prev) => {
      if (prev.some((f) => f.id === fnId)) return prev;
      const label = getFortnightLabel(transfer.transferDate);
      const d = new Date(transfer.transferDate + "T00:00:00");
      const half = d.getDate() <= 15 ? 1 : 2;
      return [...prev, { id: fnId, year: d.getFullYear(), month: d.getMonth() + 1, half: half as 1 | 2, label, closed: false }];
    });

    // 5. Log
    addToAdminLog("Apertura verificada", `${transfer.referenceNumber} — ${transfer.prospectiveBusinessName}`);
    addToAdminLog("Cliente creado", `${clientNumber} — ${transfer.prospectiveBusinessName}`);
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

  function rejectTransfer(transferId: string) {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || transfer.status !== "pending") return;
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

  const togglePro = useCallback((id: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id !== id ? c : { ...c, isPro: !c.isPro, plan: !c.isPro ? "pro" : "standard" }
      )
    );
  }, []);

  const value: AdminStoreValue = {
    clients, salesReps, transfers, commissions, fortnights, adminLog,
    updateClient,
    setPaymentStatus, setClientStatus, setPlan, setAccess, setPublicPageStatus,
    setMonthStatus, markMonthPaid, regenerateHistory, renewContract,
    updateOnboardingChecklist, setNotes, setSlug, setAssignedTo, assignSalesRep,
    updateSpecialist, updateBusiness, addDocument,
    addContract, replaceContract, updateContractStatus,
    addTransfer, verifyOpeningTransfer, verifyMonthlyTransfer, rejectTransfer, refundTransfer,
    authorizeCommission, markCommissionPaid, cancelCommission,
    addSalesRep, updateSalesRep, toggleSalesRep,
    ensureFortnight, closeFortnight, reopenFortnight,
    users: clients, updateUser: updateClient, togglePro,
    updateClinic: updateBusiness,
  };

  return <AdminStoreCtx.Provider value={value}>{children}</AdminStoreCtx.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreCtx);
  if (!ctx) throw new Error("useAdminStore must be inside AdminStoreProvider");
  return ctx;
}
