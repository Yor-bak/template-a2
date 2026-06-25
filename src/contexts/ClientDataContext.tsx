"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { patients } from "@/data/patients";
import { appointments as seedAppointments } from "@/data/appointments";
import type {
  Client,
  CarePlan,
  CarePlanItem,
  ClientPayment,
  ClientFollowUp,
  ClientFile,
  ClientDataStore,
  CarePlanStatus,
  ClientPaymentMethod,
  ClientPaymentStatus,
  FollowUpPriority,
  FileCategory,
} from "@/types/clientData";

const STORAGE_KEY = "template-a2-client-data-v1";
const STORE_VERSION = "1.0.0";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

// Seed from existing patients array
function buildInitialStore(): ClientDataStore {
  const clients: Client[] = patients.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    dateOfBirth: p.dateOfBirth,
    firstVisitAt: p.firstVisitAt,
    notes: p.notes || undefined,
    tags: [],
    totalAppointments: p.totalAppointments,
    totalSpent: p.totalSpent,
    createdAt: p.firstVisitAt + "T00:00:00.000Z",
    updatedAt: p.firstVisitAt + "T00:00:00.000Z",
  }));
  return { version: STORE_VERSION, clients, carePlans: [], payments: [], followUps: [], files: [] };
}

function loadStore(): ClientDataStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialStore();
    const parsed = JSON.parse(raw) as Partial<ClientDataStore>;
    // Merge: ensure existing patients are present
    const existing: ClientDataStore = {
      version: parsed.version ?? STORE_VERSION,
      clients: parsed.clients ?? [],
      carePlans: parsed.carePlans ?? [],
      payments: parsed.payments ?? [],
      followUps: parsed.followUps ?? [],
      files: parsed.files ?? [],
    };
    // Inject any seed patients not already in store
    for (const p of patients) {
      if (!existing.clients.find((c) => c.id === p.id)) {
        existing.clients.push({
          id: p.id,
          name: p.name,
          phone: p.phone,
          dateOfBirth: p.dateOfBirth,
          firstVisitAt: p.firstVisitAt,
          notes: p.notes || undefined,
          tags: [],
          totalAppointments: p.totalAppointments,
          totalSpent: p.totalSpent,
          createdAt: p.firstVisitAt + "T00:00:00.000Z",
          updatedAt: p.firstVisitAt + "T00:00:00.000Z",
        });
      }
    }
    return existing;
  } catch {
    return buildInitialStore();
  }
}

function saveStore(store: ClientDataStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
}

// ── Context type ───────────────────────────────────────────────────────────────

interface ClientDataCtx {
  clients: Client[];
  carePlans: CarePlan[];
  payments: ClientPayment[];
  followUps: ClientFollowUp[];
  files: ClientFile[];

  // Clients
  addClient: (data: Omit<Client, "id" | "tags" | "totalAppointments" | "totalSpent" | "createdAt" | "updatedAt">) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;

  // Care Plans
  addCarePlan: (data: Omit<CarePlan, "id" | "paidAmount" | "pendingAmount" | "createdAt" | "updatedAt">) => CarePlan;
  updateCarePlan: (id: string, data: Partial<CarePlan>) => void;
  deleteCarePlan: (id: string) => void;
  getClientPlans: (clientId: string) => CarePlan[];
  updatePlanSession: (planId: string, itemId: string, completedSessions: number) => void;

  // Payments
  addPayment: (data: Omit<ClientPayment, "id" | "createdAt">) => ClientPayment;
  updatePayment: (id: string, data: Partial<ClientPayment>) => void;
  deletePayment: (id: string) => void;
  getClientPayments: (clientId: string) => ClientPayment[];

  // Follow-ups
  addFollowUp: (data: Omit<ClientFollowUp, "id" | "createdAt">) => ClientFollowUp;
  updateFollowUp: (id: string, data: Partial<ClientFollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  getClientFollowUps: (clientId: string) => ClientFollowUp[];
  completeFollowUp: (id: string) => void;

  // Files
  addFile: (data: Omit<ClientFile, "id" | "createdAt">) => ClientFile;
  updateFile: (id: string, data: Partial<ClientFile>) => void;
  deleteFile: (id: string) => void;
  getClientFiles: (clientId: string) => ClientFile[];

  // Backup
  exportBackup: () => void;
}

const Ctx = createContext<ClientDataCtx | null>(null);

export function ClientDataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<ClientDataStore>(() => {
    if (typeof window === "undefined") return buildInitialStore();
    return loadStore();
  });

  useEffect(() => {
    saveStore(store);
  }, [store]);

  // ── helpers ──────────────────────────────────────────────────────────────────

  const mut = useCallback((fn: (s: ClientDataStore) => ClientDataStore) => {
    setStore((prev) => fn(prev));
  }, []);

  // ── Clients ──────────────────────────────────────────────────────────────────

  const addClient = useCallback((data: Omit<Client, "id" | "tags" | "totalAppointments" | "totalSpent" | "createdAt" | "updatedAt">): Client => {
    const client: Client = {
      ...data,
      id: `c${Date.now()}`,
      tags: [],
      totalAppointments: 0,
      totalSpent: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mut((s) => ({ ...s, clients: [...s.clients, client] }));
    return client;
  }, [mut]);

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    mut((s) => ({
      ...s,
      clients: s.clients.map((c) => c.id === id ? { ...c, ...data, updatedAt: nowIso() } : c),
    }));
  }, [mut]);

  const deleteClient = useCallback((id: string) => {
    mut((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) }));
  }, [mut]);

  const getClient = useCallback((id: string) => store.clients.find((c) => c.id === id), [store.clients]);

  // ── Care Plans ───────────────────────────────────────────────────────────────

  const addCarePlan = useCallback((data: Omit<CarePlan, "id" | "paidAmount" | "pendingAmount" | "createdAt" | "updatedAt">): CarePlan => {
    const plan: CarePlan = {
      ...data,
      id: `plan-${uid()}`,
      paidAmount: 0,
      pendingAmount: data.total,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mut((s) => ({ ...s, carePlans: [...s.carePlans, plan] }));
    return plan;
  }, [mut]);

  const updateCarePlan = useCallback((id: string, data: Partial<CarePlan>) => {
    mut((s) => ({
      ...s,
      carePlans: s.carePlans.map((p) => p.id === id ? { ...p, ...data, updatedAt: nowIso() } : p),
    }));
  }, [mut]);

  const deleteCarePlan = useCallback((id: string) => {
    mut((s) => ({ ...s, carePlans: s.carePlans.filter((p) => p.id !== id) }));
  }, [mut]);

  const getClientPlans = useCallback((clientId: string) => store.carePlans.filter((p) => p.clientId === clientId), [store.carePlans]);

  const updatePlanSession = useCallback((planId: string, itemId: string, completedSessions: number) => {
    mut((s) => ({
      ...s,
      carePlans: s.carePlans.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          items: p.items.map((it) => it.id === itemId ? { ...it, completedSessions } : it),
          updatedAt: nowIso(),
        };
      }),
    }));
  }, [mut]);

  // ── Payments ─────────────────────────────────────────────────────────────────

  const addPayment = useCallback((data: Omit<ClientPayment, "id" | "createdAt">): ClientPayment => {
    const payment: ClientPayment = { ...data, id: `pay-${uid()}`, createdAt: nowIso() };
    mut((s) => {
      const payments = [...s.payments, payment];
      // Recalculate plan balance if related
      let carePlans = s.carePlans;
      if (data.carePlanId) {
        carePlans = carePlans.map((p) => {
          if (p.id !== data.carePlanId) return p;
          const planPayments = payments.filter((py) => py.carePlanId === p.id && py.status !== "refunded" && py.status !== "cancelled");
          const paidAmount = planPayments.reduce((sum, py) => sum + py.amount, 0);
          return { ...p, paidAmount, pendingAmount: Math.max(0, p.total - paidAmount), updatedAt: nowIso() };
        });
      }
      return { ...s, payments, carePlans };
    });
    return payment;
  }, [mut]);

  const updatePayment = useCallback((id: string, data: Partial<ClientPayment>) => {
    mut((s) => {
      const payments = s.payments.map((p) => p.id === id ? { ...p, ...data } : p);
      // Recalculate affected plans
      const affectedPlanIds = new Set<string>();
      s.payments.forEach((p) => { if (p.id === id && p.carePlanId) affectedPlanIds.add(p.carePlanId); });
      const updated = { ...data };
      if ("carePlanId" in updated && updated.carePlanId) affectedPlanIds.add(updated.carePlanId as string);
      let carePlans = s.carePlans;
      for (const planId of affectedPlanIds) {
        carePlans = carePlans.map((p) => {
          if (p.id !== planId) return p;
          const planPayments = payments.filter((py) => py.carePlanId === p.id && py.status !== "refunded" && py.status !== "cancelled");
          const paidAmount = planPayments.reduce((sum, py) => sum + py.amount, 0);
          return { ...p, paidAmount, pendingAmount: Math.max(0, p.total - paidAmount), updatedAt: nowIso() };
        });
      }
      return { ...s, payments, carePlans };
    });
  }, [mut]);

  const deletePayment = useCallback((id: string) => {
    mut((s) => {
      const toDelete = s.payments.find((p) => p.id === id);
      const payments = s.payments.filter((p) => p.id !== id);
      let carePlans = s.carePlans;
      if (toDelete?.carePlanId) {
        carePlans = carePlans.map((p) => {
          if (p.id !== toDelete.carePlanId) return p;
          const planPayments = payments.filter((py) => py.carePlanId === p.id && py.status !== "refunded" && py.status !== "cancelled");
          const paidAmount = planPayments.reduce((sum, py) => sum + py.amount, 0);
          return { ...p, paidAmount, pendingAmount: Math.max(0, p.total - paidAmount), updatedAt: nowIso() };
        });
      }
      return { ...s, payments, carePlans };
    });
  }, [mut]);

  const getClientPayments = useCallback((clientId: string) => store.payments.filter((p) => p.clientId === clientId), [store.payments]);

  // ── Follow-ups ───────────────────────────────────────────────────────────────

  const addFollowUp = useCallback((data: Omit<ClientFollowUp, "id" | "createdAt">): ClientFollowUp => {
    const fu: ClientFollowUp = { ...data, id: `fu-${uid()}`, createdAt: nowIso() };
    mut((s) => ({ ...s, followUps: [...s.followUps, fu] }));
    return fu;
  }, [mut]);

  const updateFollowUp = useCallback((id: string, data: Partial<ClientFollowUp>) => {
    mut((s) => ({ ...s, followUps: s.followUps.map((f) => f.id === id ? { ...f, ...data } : f) }));
  }, [mut]);

  const deleteFollowUp = useCallback((id: string) => {
    mut((s) => ({ ...s, followUps: s.followUps.filter((f) => f.id !== id) }));
  }, [mut]);

  const getClientFollowUps = useCallback((clientId: string) => store.followUps.filter((f) => f.clientId === clientId), [store.followUps]);

  const completeFollowUp = useCallback((id: string) => {
    mut((s) => ({
      ...s,
      followUps: s.followUps.map((f) => f.id === id ? { ...f, status: "completed" as const, completedAt: nowIso() } : f),
    }));
  }, [mut]);

  // ── Files ────────────────────────────────────────────────────────────────────

  const addFile = useCallback((data: Omit<ClientFile, "id" | "createdAt">): ClientFile => {
    const file: ClientFile = { ...data, id: `file-${uid()}`, createdAt: nowIso() };
    mut((s) => ({ ...s, files: [...s.files, file] }));
    return file;
  }, [mut]);

  const updateFile = useCallback((id: string, data: Partial<ClientFile>) => {
    mut((s) => ({ ...s, files: s.files.map((f) => f.id === id ? { ...f, ...data } : f) }));
  }, [mut]);

  const deleteFile = useCallback((id: string) => {
    mut((s) => ({ ...s, files: s.files.filter((f) => f.id !== id) }));
  }, [mut]);

  const getClientFiles = useCallback((clientId: string) => store.files.filter((f) => f.clientId === clientId), [store.files]);

  // ── Backup ───────────────────────────────────────────────────────────────────

  const exportBackup = useCallback(() => {
    const backup = {
      version: "1.0.0",
      exportedAt: nowIso(),
      data: {
        clients: store.clients,
        clinicalRecords: [],
        carePlans: store.carePlans,
        payments: store.payments,
        followUps: store.followUps,
        appointments: seedAppointments,
        services: [],
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respaldo-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [store]);

  const value: ClientDataCtx = {
    clients: store.clients,
    carePlans: store.carePlans,
    payments: store.payments,
    followUps: store.followUps,
    files: store.files,
    addClient, updateClient, deleteClient, getClient,
    addCarePlan, updateCarePlan, deleteCarePlan, getClientPlans, updatePlanSession,
    addPayment, updatePayment, deletePayment, getClientPayments,
    addFollowUp, updateFollowUp, deleteFollowUp, getClientFollowUps, completeFollowUp,
    addFile, updateFile, deleteFile, getClientFiles,
    exportBackup,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClientData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClientData must be used within ClientDataProvider");
  return ctx;
}
