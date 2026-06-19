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
  ClientType,
  ActivityLogItem,
  ClientDocument,
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
  inactive: "Inactivo",
  trial: "Trial",
  suspended: "Suspendido",
  cancelled: "Cancelado",
};

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  dentist: "Dentista",
  physiotherapist: "Fisioterapeuta",
  nutritionist: "Nutriólogo",
  psychologist: "Psicólogo",
  veterinarian: "Veterinario",
  other: "Otro",
};

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  not_started: "Sin configurar",
  in_progress: "En proceso",
  ready: "Lista",
};

export const DOC_TYPE_LABELS: Record<ClientDocument["type"], string> = {
  payment_receipt: "Comprobante de pago",
  signed_contract: "Contrato firmado",
  clinic_logo: "Logo de clínica",
  professional_license: "Cédula profesional",
  other: "Otro",
};

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

export function generateContractEndDate(
  activationDate: string,
  contractType: ContractType
): string {
  const start = new Date(activationDate + "T00:00:00");
  const months = contractType === "one_year" ? 12 : 6;
  const end = new Date(start.getFullYear(), start.getMonth() + months, 0);
  return end.toISOString().split("T")[0];
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

// ── Mock data ─────────────────────────────────────────────────────────────────

const EMPTY_CL: OnboardingChecklist = {
  basicData: false, services: false, address: false,
  paymentMethods: false, templateSelected: false, colorsSelected: false, testimonials: false,
};
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
  const today = new Date("2026-06-18T00:00:00");
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
      monthLabel,
      dueDate,
      status,
      amount,
      paidAt: isPaid
        ? new Date(d.getFullYear(), d.getMonth(), 5).toISOString().split("T")[0]
        : undefined,
    };
  });
}

const MOCK_CLIENTS: AdminClient[] = [
  {
    id: "c1", clientNumber: "TA2-0001",
    clinicName: "Clínica Dental Sonrisa", specialistName: "Dra. Mariana López",
    clientType: "dentist",
    phone: "5512345678", clinicAddress: "Av. Insurgentes Sur 1234, Col. Del Valle, CDMX",
    googleMapsUrl: "https://maps.google.com/?q=Av.+Insurgentes+Sur+1234",
    slug: "clinica-sonrisa", subdomain: "clinica-sonrisa.templatea2.com",
    plan: "pro", isPro: true,
    paymentStatus: "paid", clientStatus: "active", accessActive: true,
    publicPageStatus: "published",
    contractType: "one_year", activationDate: "2026-01-01", contractEndDate: "2026-12-31",
    monthlyAmount: 599,
    paymentHistory: mockHistory("2026-01-01", "one_year", 599, 5),
    onboardingStatus: "ready", onboardingChecklist: FULL_CL,
    assignedTo: "Pedro",
    internalNotes: "Cliente premium. Pago puntual. Quiere módulo de reseñas en julio.",
    activityLog: [
      { id: "a1", date: "2026-06-01T10:00:00Z", action: "Pago registrado", detail: "Mayo 2026 — $599 MXN", actor: "Pedro" },
      { id: "a2", date: "2026-01-15T09:00:00Z", action: "Página publicada", actor: "Admin" },
      { id: "a3", date: "2026-01-01T08:00:00Z", action: "Cliente creado", detail: "Contrato 1 año", actor: "Admin" },
    ],
    documents: [
      { id: "d1", name: "Contrato firmado", type: "signed_contract", uploadedAt: "2026-01-02" },
      { id: "d2", name: "Comprobante enero", type: "payment_receipt", uploadedAt: "2026-01-05" },
    ],
    createdAt: "2025-12-20T00:00:00Z", updatedAt: "2026-06-01T00:00:00Z",
    lastPaymentAt: "2026-06-01", nextPaymentDueAt: "2026-07-01",
  },
  {
    id: "c2", clientNumber: "TA2-0002",
    clinicName: "Consultorio Dr. Mendoza", specialistName: "Dr. Carlos Mendoza",
    clientType: "physiotherapist",
    phone: "5598765432", clinicAddress: "Calle Durango 88, Col. Roma Norte, CDMX",
    slug: "doctor-mendoza", subdomain: "doctor-mendoza.templatea2.com",
    plan: "free", isPro: false,
    paymentStatus: "pending", clientStatus: "trial", accessActive: true,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2026-05-01", contractEndDate: "2026-10-31",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-05-01", "six_months", 299, 1),
    onboardingStatus: "in_progress", onboardingChecklist: PARTIAL_CL,
    assignedTo: "Soporte",
    internalNotes: "Interesado en Pro. Pendiente configurar template y métodos de pago.",
    activityLog: [
      { id: "a4", date: "2026-05-01T11:00:00Z", action: "Cliente creado", detail: "Contrato 6 meses — Trial", actor: "Admin" },
    ],
    documents: [
      { id: "d3", name: "Logo consultorio", type: "clinic_logo", uploadedAt: "2026-05-10" },
    ],
    createdAt: "2026-04-28T00:00:00Z", updatedAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "c3", clientNumber: "TA2-0003",
    clinicName: "Centro Dental Familiar", specialistName: "Dra. Sofía Ríos",
    clientType: "dentist",
    phone: "5511223344", clinicAddress: "Av. Universidad 450, Coyoacán, CDMX",
    slug: "dental-familiar", subdomain: "dental-familiar.templatea2.com",
    plan: "pro", isPro: true,
    paymentStatus: "overdue", clientStatus: "suspended", accessActive: false,
    publicPageStatus: "hidden",
    contractType: "six_months", activationDate: "2025-12-01", contractEndDate: "2026-05-31",
    monthlyAmount: 599,
    paymentHistory: mockHistory("2025-12-01", "six_months", 599, 2),
    onboardingStatus: "not_started", onboardingChecklist: EMPTY_CL,
    assignedTo: "Ventas",
    internalNotes: "4 meses sin pagar. Acceso bloqueado. Contactar esta semana.",
    activityLog: [
      { id: "a5", date: "2026-05-01T09:00:00Z", action: "Acceso bloqueado", detail: "Pago vencido — 4 meses", actor: "Sistema" },
      { id: "a6", date: "2026-04-01T09:00:00Z", action: "Cliente suspendido", actor: "Admin" },
      { id: "a7", date: "2025-12-01T08:00:00Z", action: "Cliente creado", detail: "Contrato 6 meses", actor: "Admin" },
    ],
    documents: [
      { id: "d4", name: "Cédula profesional", type: "professional_license", uploadedAt: "2025-12-05" },
    ],
    createdAt: "2025-11-15T00:00:00Z", updatedAt: "2026-05-01T00:00:00Z",
    lastPaymentAt: "2026-01-05",
  },
  {
    id: "c4", clientNumber: "TA2-0004",
    clinicName: "Fisioterapia Movimiento", specialistName: "Lic. Jorge Salinas",
    clientType: "physiotherapist",
    phone: "5566778899", clinicAddress: "Blvd. Ávila Camacho 32, Naucalpan, EdoMex",
    slug: "fisio-movimiento", subdomain: "fisio-movimiento.templatea2.com",
    plan: "free", isPro: false,
    paymentStatus: "pending", clientStatus: "active", accessActive: true,
    publicPageStatus: "published",
    contractType: "six_months", activationDate: "2026-01-01", contractEndDate: "2026-06-30",
    monthlyAmount: 299,
    paymentHistory: mockHistory("2026-01-01", "six_months", 299, 5),
    onboardingStatus: "ready", onboardingChecklist: FULL_CL,
    assignedTo: "Pedro",
    internalNotes: "Contrato vence fin de junio. Ofrecer renovación urgente.",
    activityLog: [
      { id: "a8", date: "2026-06-01T10:00:00Z", action: "Pago registrado", detail: "Mayo 2026 — $299 MXN", actor: "Pedro" },
      { id: "a9", date: "2026-01-10T08:00:00Z", action: "Página publicada", actor: "Admin" },
      { id: "a10", date: "2026-01-01T08:00:00Z", action: "Cliente creado", detail: "Contrato 6 meses", actor: "Admin" },
    ],
    documents: [],
    createdAt: "2025-12-29T00:00:00Z", updatedAt: "2026-06-01T00:00:00Z",
    lastPaymentAt: "2026-06-01", nextPaymentDueAt: "2026-07-01",
  },
];

// ── NewClientInput ────────────────────────────────────────────────────────────

export type NewClientInput = Omit<
  AdminClient,
  | "id"
  | "clientNumber"
  | "createdAt"
  | "updatedAt"
  | "subdomain"
  | "accessActive"
  | "paymentStatus"
  | "paymentHistory"
  | "contractEndDate"
  | "onboardingStatus"
  | "activityLog"
  | "documents"
  | "lastPaymentAt"
  | "nextPaymentDueAt"
>;

// ── Store ─────────────────────────────────────────────────────────────────────

interface AdminStoreValue {
  clients: AdminClient[];
  addClient: (data: NewClientInput) => void;
  updateClient: (id: string, patch: Partial<AdminClient>) => void;
  setPaymentStatus: (id: string, status: PaymentStatus) => void;
  setClientStatus: (id: string, status: ClientStatus) => void;
  setPlan: (id: string, plan: UserPlan) => void;
  setPro: (id: string, isPro: boolean) => void;
  setAccess: (id: string, active: boolean) => void;
  setPublicPageStatus: (id: string, status: PublicPageStatus) => void;
  setMonthStatus: (clientId: string, monthId: string, status: MonthlyPaymentStatus) => void;
  markMonthPaid: (clientId: string, monthId: string) => void;
  regenerateHistory: (clientId: string, activationDate: string, contractType: ContractType) => void;
  renewContract: (clientId: string, contractType: ContractType) => void;
  updateOnboardingChecklist: (id: string, patch: Partial<OnboardingChecklist>) => void;
  setNotes: (id: string, notes: string) => void;
  setSlug: (id: string, slug: string) => void;
  setAssignedTo: (id: string, assignedTo: string) => void;
  addDocument: (clientId: string, doc: Omit<ClientDocument, "id">) => void;
  // Legacy aliases
  users: AdminClient[];
  updateUser: (id: string, patch: Partial<AdminClient>) => void;
  togglePro: (id: string) => void;
}

const AdminStoreCtx = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<AdminClient[]>(MOCK_CLIENTS);

  const addClient = useCallback((data: NewClientInput) => {
    setClients((prev) => {
      const now = new Date().toISOString();
      const clientNumber = generateClientNumber(prev);
      const subdomain = buildSubdomain(data.slug);
      const paymentHistory = generatePaymentHistory(
        data.activationDate,
        data.contractType,
        data.monthlyAmount
      );
      const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
      const contractEndDate = generateContractEndDate(data.activationDate, data.contractType);
      const onboardingStatus = calcOnboardingStatus(data.onboardingChecklist);
      const newClient: AdminClient = {
        ...data,
        id: crypto.randomUUID(),
        clientNumber,
        createdAt: now,
        updatedAt: now,
        subdomain,
        paymentStatus,
        accessActive,
        paymentHistory,
        contractEndDate,
        onboardingStatus,
        activityLog: [mkLog("Cliente creado", CONTRACT_TYPE_LABELS[data.contractType])],
        documents: [],
      };
      return [...prev, newClient];
    });
  }, []);

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
        id,
        "Estado de pago cambiado",
        PAYMENT_STATUS_LABELS[status]
      )
    );
  }, []);

  const setClientStatus = useCallback((id: string, status: ClientStatus) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, clientStatus: status })),
        id,
        "Estado del cliente cambiado",
        CLIENT_STATUS_LABELS[status]
      )
    );
  }, []);

  const setPlan = useCallback((id: string, plan: UserPlan) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, plan, isPro: plan === "pro" })),
        id,
        `Plan cambiado a ${plan === "pro" ? "Pro" : "Free"}`
      )
    );
  }, []);

  const setPro = useCallback((id: string, isPro: boolean) => {
    setClients((prev) =>
      withLog(
        prev.map((c) =>
          c.id !== id ? c : { ...c, isPro, plan: isPro ? "pro" : "free" }
        ),
        id,
        isPro ? "Pro activado" : "Pro desactivado"
      )
    );
  }, []);

  const setAccess = useCallback((id: string, active: boolean) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, accessActive: active })),
        id,
        active ? "Acceso activado" : "Acceso bloqueado"
      )
    );
  }, []);

  const setPublicPageStatus = useCallback(
    (id: string, status: PublicPageStatus) => {
      setClients((prev) =>
        withLog(
          prev.map((c) => (c.id !== id ? c : { ...c, publicPageStatus: status })),
          id,
          status === "published" ? "Página publicada" : "Página oculta"
        )
      );
    },
    []
  );

  const setMonthStatus = useCallback(
    (clientId: string, monthId: string, status: MonthlyPaymentStatus) => {
      setClients((prev) => {
        let monthLabel = "";
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const paymentHistory = c.paymentHistory.map((p) => {
            if (p.id !== monthId) return p;
            monthLabel = p.monthLabel;
            return {
              ...p,
              status,
              paidAt:
                status === "paid"
                  ? new Date().toISOString().split("T")[0]
                  : undefined,
            };
          });
          const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
          return { ...c, paymentHistory, paymentStatus, accessActive };
        });
        return withLog(
          mapped,
          clientId,
          status === "paid" ? "Pago registrado" : "Estado de pago actualizado",
          monthLabel || undefined
        );
      });
    },
    []
  );

  const markMonthPaid = useCallback(
    (clientId: string, monthId: string) =>
      setMonthStatus(clientId, monthId, "paid"),
    [setMonthStatus]
  );

  const regenerateHistory = useCallback(
    (clientId: string, activationDate: string, contractType: ContractType) => {
      setClients((prev) => {
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const paymentHistory = generatePaymentHistory(
            activationDate,
            contractType,
            c.monthlyAmount,
            c.paymentHistory
          );
          const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
          const contractEndDate = generateContractEndDate(activationDate, contractType);
          return {
            ...c,
            activationDate,
            contractType,
            paymentHistory,
            paymentStatus,
            accessActive,
            contractEndDate,
          };
        });
        return withLog(
          mapped,
          clientId,
          "Contrato actualizado",
          CONTRACT_TYPE_LABELS[contractType]
        );
      });
    },
    []
  );

  const renewContract = useCallback(
    (clientId: string, contractType: ContractType) => {
      setClients((prev) => {
        const today = new Date().toISOString().split("T")[0];
        const mapped = prev.map((c) => {
          if (c.id !== clientId) return c;
          const paymentHistory = generatePaymentHistory(today, contractType, c.monthlyAmount);
          const { paymentStatus, accessActive } = recalcPaymentStatus(paymentHistory);
          const contractEndDate = generateContractEndDate(today, contractType);
          return {
            ...c,
            activationDate: today,
            contractType,
            contractEndDate,
            paymentHistory,
            paymentStatus,
            accessActive,
          };
        });
        return withLog(
          mapped,
          clientId,
          "Contrato renovado",
          `${CONTRACT_TYPE_LABELS[contractType]} desde hoy`
        );
      });
    },
    []
  );

  const updateOnboardingChecklist = useCallback(
    (id: string, patch: Partial<OnboardingChecklist>) => {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const onboardingChecklist = { ...c.onboardingChecklist, ...patch };
          const onboardingStatus = calcOnboardingStatus(onboardingChecklist);
          return {
            ...c,
            onboardingChecklist,
            onboardingStatus,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const setNotes = useCallback((id: string, notes: string) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, internalNotes: notes })),
        id,
        "Notas internas actualizadas"
      )
    );
  }, []);

  const setSlug = useCallback((id: string, slug: string) => {
    const subdomain = buildSubdomain(slug);
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, slug, subdomain })),
        id,
        "Subdominio actualizado",
        subdomain
      )
    );
  }, []);

  const setAssignedTo = useCallback((id: string, assignedTo: string) => {
    setClients((prev) =>
      withLog(
        prev.map((c) => (c.id !== id ? c : { ...c, assignedTo })),
        id,
        "Responsable asignado",
        assignedTo
      )
    );
  }, []);

  const addDocument = useCallback(
    (clientId: string, doc: Omit<ClientDocument, "id">) => {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          const newDoc: ClientDocument = {
            ...doc,
            id: crypto.randomUUID(),
            uploadedAt: new Date().toISOString().split("T")[0],
          };
          return {
            ...c,
            documents: [...c.documents, newDoc],
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const togglePro = useCallback((id: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id !== id
          ? c
          : { ...c, isPro: !c.isPro, plan: !c.isPro ? "pro" : "free" }
      )
    );
  }, []);

  const value: AdminStoreValue = {
    clients,
    addClient,
    updateClient,
    setPaymentStatus,
    setClientStatus,
    setPlan,
    setPro,
    setAccess,
    setPublicPageStatus,
    setMonthStatus,
    markMonthPaid,
    regenerateHistory,
    renewContract,
    updateOnboardingChecklist,
    setNotes,
    setSlug,
    setAssignedTo,
    addDocument,
    users: clients,
    updateUser: updateClient,
    togglePro,
  };

  return (
    <AdminStoreCtx.Provider value={value}>{children}</AdminStoreCtx.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreCtx);
  if (!ctx) throw new Error("useAdminStore must be inside AdminStoreProvider");
  return ctx;
}
