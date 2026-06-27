"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  EquipoStore, Worker, WorkerCommission, WorkerSettlement,
  CommissionStatus, SettlementStatus, AssignmentMap,
} from "@/types/equipo";
import { WORKER_COLORS } from "@/types/equipo";

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "template-a2-equipo-v1";

function buildEmpty(): EquipoStore {
  return { workers: [], commissions: [], settlements: [], assignments: {} };
}

function loadStore(): EquipoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStore();
    return JSON.parse(raw) as EquipoStore;
  } catch {
    return buildEmpty();
  }
}

function seedStore(): EquipoStore {
  const workers: Worker[] = [
    {
      id: "w1",
      name: "Dra. Sofía Ramírez",
      email: "sofia@clinica.com",
      phone: "555-1001",
      role: "worker",
      specialty: "Odontología general",
      compensationType: "percentage",
      compensationValue: 40,
      isActive: true,
      color: WORKER_COLORS[0],
      createdAt: "2026-01-15T09:00:00Z",
    },
    {
      id: "w2",
      name: "Dr. Pablo Herrera",
      email: "pablo@clinica.com",
      phone: "555-1002",
      role: "worker",
      specialty: "Ortodoncia",
      compensationType: "fixed",
      compensationValue: 500,
      isActive: true,
      color: WORKER_COLORS[1],
      createdAt: "2026-02-01T09:00:00Z",
    },
  ];

  const commissions: WorkerCommission[] = [
    {
      id: "c1",
      workerId: "w1",
      appointmentId: "apt-1",
      appointmentDate: "2026-06-10",
      patientName: "Carlos Mendoza",
      serviceName: "Limpieza dental",
      serviceAmount: 500,
      compensationType: "percentage",
      compensationValue: 40,
      earnedAmount: 200,
      status: "pending",
      createdAt: "2026-06-10T12:00:00Z",
    },
    {
      id: "c2",
      workerId: "w1",
      appointmentId: "apt-2",
      appointmentDate: "2026-06-12",
      patientName: "Ana García",
      serviceName: "Blanqueamiento dental",
      serviceAmount: 1800,
      compensationType: "percentage",
      compensationValue: 40,
      earnedAmount: 720,
      status: "approved",
      createdAt: "2026-06-12T14:00:00Z",
    },
    {
      id: "c3",
      workerId: "w2",
      appointmentId: "apt-3",
      appointmentDate: "2026-06-14",
      patientName: "Laura Jiménez",
      serviceName: "Ortodoncia",
      serviceAmount: 3500,
      compensationType: "fixed",
      compensationValue: 500,
      earnedAmount: 500,
      status: "paid",
      settlementId: "s1",
      createdAt: "2026-06-14T10:00:00Z",
    },
  ];

  const settlements: WorkerSettlement[] = [
    {
      id: "s1",
      workerId: "w2",
      periodLabel: "Jun 2026 — 1ª quincena",
      periodStart: "2026-06-01",
      periodEnd: "2026-06-15",
      commissionIds: ["c3"],
      totalEarned: 500,
      status: "paid",
      paidAt: "2026-06-16T09:00:00Z",
      createdAt: "2026-06-16T08:00:00Z",
    },
  ];

  const assignments: AssignmentMap = {
    "apt-1": "w1",
    "apt-2": "w1",
    "apt-3": "w2",
  };

  return { workers, commissions, settlements, assignments };
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface EquipoContextValue {
  store: EquipoStore;
  // Workers
  addWorker: (w: Omit<Worker, "id" | "createdAt">) => Worker;
  updateWorker: (id: string, patch: Partial<Omit<Worker, "id" | "createdAt">>) => void;
  toggleWorkerActive: (id: string) => void;
  deleteWorker: (id: string) => void;
  // Assignments
  assignWorker: (appointmentId: string, workerId: string | null) => void;
  // Commissions
  addCommission: (c: Omit<WorkerCommission, "id" | "createdAt">) => WorkerCommission;
  updateCommissionStatus: (id: string, status: CommissionStatus, notes?: string) => void;
  deleteCommission: (id: string) => void;
  // Settlements
  createSettlement: (s: Omit<WorkerSettlement, "id" | "createdAt">) => WorkerSettlement;
  updateSettlementStatus: (id: string, status: SettlementStatus, paidAt?: string) => void;
  deleteSettlement: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const EquipoContext = createContext<EquipoContextValue | null>(null);

export function useEquipo(): EquipoContextValue {
  const ctx = useContext(EquipoContext);
  if (!ctx) throw new Error("useEquipo must be used inside EquipoProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EquipoProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<EquipoStore>(() => {
    if (typeof window === "undefined") return buildEmpty();
    return loadStore();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const mut = useCallback((fn: (s: EquipoStore) => EquipoStore) => {
    setStore((prev) => fn(prev));
  }, []);

  const uid = () => crypto.randomUUID();
  const now = () => new Date().toISOString();

  // Workers
  const addWorker = useCallback((w: Omit<Worker, "id" | "createdAt">): Worker => {
    const worker: Worker = { ...w, id: uid(), createdAt: now() };
    mut((s) => ({ ...s, workers: [...s.workers, worker] }));
    return worker;
  }, [mut]);

  const updateWorker = useCallback((id: string, patch: Partial<Omit<Worker, "id" | "createdAt">>) => {
    mut((s) => ({
      ...s,
      workers: s.workers.map((w) => w.id === id ? { ...w, ...patch } : w),
    }));
  }, [mut]);

  const toggleWorkerActive = useCallback((id: string) => {
    mut((s) => ({
      ...s,
      workers: s.workers.map((w) => w.id === id ? { ...w, isActive: !w.isActive } : w),
    }));
  }, [mut]);

  const deleteWorker = useCallback((id: string) => {
    mut((s) => ({
      ...s,
      workers: s.workers.filter((w) => w.id !== id),
      commissions: s.commissions.filter((c) => c.workerId !== id),
      assignments: Object.fromEntries(
        Object.entries(s.assignments).filter(([, wid]) => wid !== id)
      ),
    }));
  }, [mut]);

  // Assignments
  const assignWorker = useCallback((appointmentId: string, workerId: string | null) => {
    mut((s) => {
      const assignments = { ...s.assignments };
      if (workerId === null) {
        delete assignments[appointmentId];
      } else {
        assignments[appointmentId] = workerId;
      }
      return { ...s, assignments };
    });
  }, [mut]);

  // Commissions
  const addCommission = useCallback((c: Omit<WorkerCommission, "id" | "createdAt">): WorkerCommission => {
    const commission: WorkerCommission = { ...c, id: uid(), createdAt: now() };
    mut((s) => ({ ...s, commissions: [...s.commissions, commission] }));
    return commission;
  }, [mut]);

  const updateCommissionStatus = useCallback((id: string, status: CommissionStatus, notes?: string) => {
    mut((s) => ({
      ...s,
      commissions: s.commissions.map((c) =>
        c.id === id ? { ...c, status, ...(notes !== undefined ? { notes } : {}) } : c
      ),
    }));
  }, [mut]);

  const deleteCommission = useCallback((id: string) => {
    mut((s) => ({ ...s, commissions: s.commissions.filter((c) => c.id !== id) }));
  }, [mut]);

  // Settlements
  const createSettlement = useCallback((s: Omit<WorkerSettlement, "id" | "createdAt">): WorkerSettlement => {
    const settlement: WorkerSettlement = { ...s, id: uid(), createdAt: now() };
    mut((store) => ({ ...store, settlements: [...store.settlements, settlement] }));
    return settlement;
  }, [mut]);

  const updateSettlementStatus = useCallback((id: string, status: SettlementStatus, paidAt?: string) => {
    mut((s) => ({
      ...s,
      settlements: s.settlements.map((st) =>
        st.id === id ? { ...st, status, ...(paidAt ? { paidAt } : {}) } : st
      ),
    }));
  }, [mut]);

  const deleteSettlement = useCallback((id: string) => {
    mut((s) => ({ ...s, settlements: s.settlements.filter((st) => st.id !== id) }));
  }, [mut]);

  return (
    <EquipoContext.Provider value={{
      store,
      addWorker, updateWorker, toggleWorkerActive, deleteWorker,
      assignWorker,
      addCommission, updateCommissionStatus, deleteCommission,
      createSettlement, updateSettlementStatus, deleteSettlement,
    }}>
      {children}
    </EquipoContext.Provider>
  );
}
