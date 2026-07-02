"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  EquipoStore, Worker, WorkerCommission, WorkerSettlement,
  CommissionStatus, SettlementStatus, AssignmentMap,
  WorkerTask, WorkerInvoice, TaskStatus,
  WorkerOpsTask, OpsTaskStatus,
} from "@/types/equipo";
import { WORKER_COLORS } from "@/types/equipo";

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "template-a2-equipo-v1";

function buildEmpty(): EquipoStore {
  return { workers: [], commissions: [], settlements: [], assignments: {}, tasks: [], opsTasks: [], invoices: [] };
}

function loadStore(): EquipoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStore();
    const parsed = { ...buildEmpty(), ...(JSON.parse(raw) as Partial<EquipoStore>) } as EquipoStore;
    // Migrate: assign seed passwords to known workers that don't have one yet.
    const seed = seedStore();
    const seedPwd = new Map(seed.workers.map((w) => [w.id, w.password]));
    parsed.workers = parsed.workers.map((w) =>
      w.password ? w : { ...w, password: seedPwd.get(w.id) }
    );
    return parsed;
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
      password: "trabajo123",
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
      password: "trabajo123",
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

  const tasks: WorkerTask[] = [
    {
      id: "t1", workerId: "w1", clientName: "Carlos Mendoza", clientPhone: "55 1111 2222",
      serviceName: "Limpieza dental", serviceAmount: 500, status: "assigned",
      notes: "Paciente con sensibilidad, usar pasta desensibilizante.",
      dueDate: "2026-06-22", assignedAt: "2026-06-18T10:00:00Z",
    },
    {
      id: "t2", workerId: "w1", clientName: "Ana García", clientPhone: "55 3333 4444",
      serviceName: "Blanqueamiento dental", serviceAmount: 1800, status: "completed",
      dueDate: "2026-06-19", assignedAt: "2026-06-15T09:00:00Z", completedAt: "2026-06-19T13:30:00Z",
    },
    {
      id: "t3", workerId: "w2", clientName: "Laura Jiménez", clientPhone: "55 5555 6666",
      serviceName: "Ajuste de ortodoncia", serviceAmount: 900, status: "incomplete",
      notes: "El paciente no se presentó a la cita.",
      dueDate: "2026-06-17", assignedAt: "2026-06-14T11:00:00Z",
    },
  ];

  const opsTasks: WorkerOpsTask[] = [];
  const invoices: WorkerInvoice[] = [];

  return { workers, commissions, settlements, assignments, tasks, opsTasks, invoices };
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
  // Tasks (delegated by the specialist to a worker)
  addTask: (t: Omit<WorkerTask, "id" | "assignedAt" | "status"> & { status?: TaskStatus }) => WorkerTask;
  updateTask: (id: string, patch: Partial<Omit<WorkerTask, "id" | "assignedAt">>) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  // Invoices (receipts generated by a worker for a completed task)
  createInvoiceForTask: (taskId: string) => WorkerInvoice | null;
  // Operational tasks (title/description, distinct from client assignments)
  addOpsTask: (t: Omit<WorkerOpsTask, "id" | "createdAt" | "status"> & { status?: OpsTaskStatus }) => WorkerOpsTask;
  updateOpsTask: (id: string, patch: Partial<Omit<WorkerOpsTask, "id" | "createdAt">>) => void;
  setOpsTaskStatus: (id: string, status: OpsTaskStatus) => void;
  deleteOpsTask: (id: string) => void;
  // Worker portal auth (local, MVP). Returns the matching active worker or null.
  authenticateWorker: (email: string, password: string) => Worker | null;
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

  // Cross-tab sync: when another tab writes to localStorage, reload store here.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || e.newValue === null) return;
      try {
        const next = { ...buildEmpty(), ...(JSON.parse(e.newValue) as Partial<EquipoStore>) } as EquipoStore;
        setStore(next);
      } catch { /* ignore */ }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
      tasks: s.tasks.filter((t) => t.workerId !== id),
      opsTasks: s.opsTasks.filter((t) => t.workerId !== id),
      invoices: s.invoices.filter((inv) => inv.workerId !== id),
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

  // Tasks
  const addTask = useCallback((t: Omit<WorkerTask, "id" | "assignedAt" | "status"> & { status?: TaskStatus }): WorkerTask => {
    const task: WorkerTask = { ...t, status: t.status ?? "assigned", id: uid(), assignedAt: now() };
    mut((s) => ({ ...s, tasks: [...s.tasks, task] }));
    return task;
  }, [mut]);

  const updateTask = useCallback((id: string, patch: Partial<Omit<WorkerTask, "id" | "assignedAt">>) => {
    mut((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, [mut]);

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    mut((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, status, completedAt: status === "completed" ? (t.completedAt ?? now()) : undefined }
          : t
      ),
    }));
  }, [mut]);

  const deleteTask = useCallback((id: string) => {
    mut((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, [mut]);

  // Invoices
  const createInvoiceForTask = useCallback((taskId: string): WorkerInvoice | null => {
    let created: WorkerInvoice | null = null;
    mut((s) => {
      const task = s.tasks.find((t) => t.id === taskId);
      if (!task || task.invoiceId) return s; // no task, or already invoiced
      const worker = s.workers.find((w) => w.id === task.workerId);
      const folio = `REC-${String(s.invoices.length + 1).padStart(6, "0")}`;
      const invoice: WorkerInvoice = {
        id: uid(),
        folio,
        taskId,
        workerId: task.workerId,
        workerName: worker?.name ?? "Trabajador",
        clientName: task.clientName,
        serviceName: task.serviceName,
        amount: task.serviceAmount ?? 0,
        createdAt: now(),
      };
      created = invoice;
      return {
        ...s,
        invoices: [...s.invoices, invoice],
        tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, invoiceId: invoice.id } : t)),
      };
    });
    return created;
  }, [mut]);

  // Operational tasks
  const addOpsTask = useCallback((t: Omit<WorkerOpsTask, "id" | "createdAt" | "status"> & { status?: OpsTaskStatus }): WorkerOpsTask => {
    const task: WorkerOpsTask = { ...t, status: t.status ?? "pending", id: uid(), createdAt: now() };
    mut((s) => ({ ...s, opsTasks: [...s.opsTasks, task] }));
    return task;
  }, [mut]);

  const updateOpsTask = useCallback((id: string, patch: Partial<Omit<WorkerOpsTask, "id" | "createdAt">>) => {
    mut((s) => ({ ...s, opsTasks: s.opsTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, [mut]);

  const setOpsTaskStatus = useCallback((id: string, status: OpsTaskStatus) => {
    mut((s) => ({
      ...s,
      opsTasks: s.opsTasks.map((t) =>
        t.id === id
          ? { ...t, status, completedAt: status === "completed" ? (t.completedAt ?? now()) : undefined }
          : t
      ),
    }));
  }, [mut]);

  const deleteOpsTask = useCallback((id: string) => {
    mut((s) => ({ ...s, opsTasks: s.opsTasks.filter((t) => t.id !== id) }));
  }, [mut]);

  // Worker portal auth (local)
  const authenticateWorker = useCallback((email: string, password: string): Worker | null => {
    const e = email.trim().toLowerCase();
    const match = store.workers.find(
      (w) => w.isActive && w.email.trim().toLowerCase() === e && (w.password ?? "") === password && password.length > 0
    );
    return match ?? null;
  }, [store.workers]);

  return (
    <EquipoContext.Provider value={{
      store,
      addWorker, updateWorker, toggleWorkerActive, deleteWorker,
      assignWorker,
      addCommission, updateCommissionStatus, deleteCommission,
      createSettlement, updateSettlementStatus, deleteSettlement,
      addTask, updateTask, setTaskStatus, deleteTask,
      createInvoiceForTask,
      addOpsTask, updateOpsTask, setOpsTaskStatus, deleteOpsTask,
      authenticateWorker,
    }}>
      {children}
    </EquipoContext.Provider>
  );
}
