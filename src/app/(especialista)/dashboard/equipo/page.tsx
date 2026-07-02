"use client";
import { useState, type CSSProperties } from "react";
import {
  Users, UserPlus, Briefcase, DollarSign, FileText,
  ChevronDown, Pencil, Trash2, Check, X, AlertCircle,
  PlusCircle, Crown, ToggleLeft, ToggleRight,
  Eye, EyeOff, ClipboardList, Receipt, ExternalLink,
  ListChecks, BarChart2,
} from "lucide-react";
import { useEquipo } from "@/contexts/EquipoContext";
import { appointments as allAppointments } from "@/data/appointments";
import { formatCurrency } from "@/lib/utils";
import type {
  Worker, CommissionStatus, SettlementStatus,
  TaskStatus, WorkerTask, OpsTaskStatus, WorkerOpsTask,
} from "@/types/equipo";
import {
  COMPENSATION_LABELS, COMMISSION_STATUS_LABELS,
  SETTLEMENT_STATUS_LABELS, WORKER_COLORS, TASK_STATUS_LABELS,
  OPS_TASK_STATUS_LABELS,
} from "@/types/equipo";
import Link from "next/link";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Avatar({ name, color, size = 8 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, borderColor: `color-mix(in srgb, ${color} 25%, transparent)`, width: `${size * 4}px`, height: `${size * 4}px` }}
      className="rounded-full border flex items-center justify-center flex-shrink-0"
    >
      <span style={{ color }} className="text-xs font-bold">{initials}</span>
    </div>
  );
}

const taskStatusStyle = (status: TaskStatus): CSSProperties => {
  const m: Record<TaskStatus, CSSProperties> = {
    assigned:   { background: "color-mix(in srgb, var(--ds-accent) 12%, transparent)", color: "var(--ds-accent)", borderColor: "color-mix(in srgb, var(--ds-accent) 25%, transparent)" },
    completed:  { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)", borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
    incomplete: { background: "color-mix(in srgb, var(--ds-error) 12%, transparent)", color: "var(--ds-error)", borderColor: "color-mix(in srgb, var(--ds-error) 25%, transparent)" },
  };
  return m[status];
};

const opsStatusStyle = (status: OpsTaskStatus): CSSProperties => {
  const m: Record<OpsTaskStatus, CSSProperties> = {
    pending:   { background: "color-mix(in srgb, var(--ds-warning) 12%, transparent)", color: "var(--ds-warning)", borderColor: "color-mix(in srgb, var(--ds-warning) 25%, transparent)" },
    completed: { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)", borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
    overdue:   { background: "color-mix(in srgb, var(--ds-error) 12%, transparent)", color: "var(--ds-error)", borderColor: "color-mix(in srgb, var(--ds-error) 25%, transparent)" },
  };
  return m[status];
};

const statusStyle = (status: CommissionStatus): CSSProperties => {
  const m: Record<CommissionStatus, CSSProperties> = {
    pending:   { background: "color-mix(in srgb, var(--ds-warning) 12%, transparent)", color: "var(--ds-warning)", borderColor: "color-mix(in srgb, var(--ds-warning) 25%, transparent)" },
    approved:  { background: "color-mix(in srgb, var(--ds-accent) 12%, transparent)", color: "var(--ds-accent)", borderColor: "color-mix(in srgb, var(--ds-accent) 25%, transparent)" },
    paid:      { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)", borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
    cancelled: { background: "var(--ds-surface-muted)", color: "var(--ds-text-muted)", borderColor: "var(--ds-border)" },
  };
  return m[status];
};

const settlementStyle = (status: SettlementStatus): CSSProperties => {
  const m: Record<SettlementStatus, CSSProperties> = {
    open:   { background: "color-mix(in srgb, var(--ds-warning) 12%, transparent)", color: "var(--ds-warning)", borderColor: "color-mix(in srgb, var(--ds-warning) 25%, transparent)" },
    closed: { background: "color-mix(in srgb, var(--ds-accent) 12%, transparent)", color: "var(--ds-accent)", borderColor: "color-mix(in srgb, var(--ds-accent) 25%, transparent)" },
    paid:   { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)", borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
  };
  return m[status];
};

const inp = "w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)] focus:ring-2 focus:ring-[var(--ds-ring)]/30 transition-colors";

// ─── Worker modal ─────────────────────────────────────────────────────────────

interface WorkerFormData {
  name: string; email: string; phone: string; role: Worker["role"];
  specialty: string; compensationType: Worker["compensationType"];
  compensationValue: string; color: string; password: string;
}

const emptyWorkerForm = (): WorkerFormData => ({
  name: "", email: "", phone: "", role: "worker", specialty: "",
  compensationType: "fixed", compensationValue: "0",
  color: WORKER_COLORS[0], password: "",
});

function WorkerModal({ initial, isEditing = false, onSave, onClose }: {
  initial?: WorkerFormData; isEditing?: boolean;
  onSave: (f: WorkerFormData) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<WorkerFormData>(initial ?? emptyWorkerForm());
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof WorkerFormData, string>>>({});
  const set = (k: keyof WorkerFormData, v: string) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); };

  function validate() {
    const e: Partial<Record<keyof WorkerFormData, string>> = {};
    if (!form.name.trim()) e.name = "Requerido";
    if (!form.email.trim()) e.email = "Requerido";
    if (!isEditing && !form.password.trim()) e.password = "La contraseña es obligatoria al crear";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ds-border)]">
          <h2 className="font-bold text-[var(--ds-text)]">{isEditing ? "Editar trabajador" : "Nuevo trabajador"}</h2>
          <button onClick={onClose} className="text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Nombre completo *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className={`${inp} ${errors.name ? "border-[var(--ds-error)]" : ""}`} />
              {errors.name && <p className="text-xs text-[var(--ds-error)] mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Correo *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                className={`${inp} ${errors.email ? "border-[var(--ds-error)]" : ""}`} />
              {errors.email && <p className="text-xs text-[var(--ds-error)] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Teléfono</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">
                {isEditing ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña *"}
              </label>
              <div className="relative">
                <input value={form.password} onChange={(e) => set("password", e.target.value)}
                  type={showPwd ? "text" : "password"} autoComplete="new-password"
                  className={`${inp} pr-10 ${errors.password ? "border-[var(--ds-error)]" : ""}`} />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-text-muted)]"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[var(--ds-error)] mt-1">{errors.password}</p>}
              <p className="text-[11px] text-[var(--ds-text-muted)] mt-1">Usado para el portal del trabajador.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Rol</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value as Worker["role"])} className={inp}>
                <option value="worker">Trabajador</option>
                <option value="business_admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Especialidad</label>
              <input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Comisión por cita</label>
              <select value={form.compensationType} onChange={(e) => set("compensationType", e.target.value as Worker["compensationType"])} className={inp}>
                <option value="fixed">Monto fijo por cita</option>
                <option value="manual">Sin comisión automática</option>
              </select>
            </div>
            {form.compensationType === "fixed" && (
              <div>
                <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Monto de comisión ($)</label>
                <input type="number" min="0" step="0.01" value={form.compensationValue} onChange={(e) => set("compensationValue", e.target.value)} className={inp} placeholder="Ej. 250.00" />
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-2">Color en calendario</label>
              <div className="flex gap-2 flex-wrap">
                {WORKER_COLORS.map((c) => (
                  <button key={c} onClick={() => set("color", c)}
                    style={{ background: c, outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--ds-border)]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-sm hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
          <button onClick={() => { if (validate()) onSave(form); }} className="px-4 py-2 rounded-xl bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] text-sm font-semibold hover:opacity-90">Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Trabajadores ────────────────────────────────────────────────────────

function TrabajadoresTab() {
  const { store, addWorker, updateWorker, toggleWorkerActive, deleteWorker } = useEquipo();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleSave(f: WorkerFormData) {
    const base = { name: f.name, email: f.email, phone: f.phone || undefined, role: f.role, specialty: f.specialty || undefined, compensationType: f.compensationType, compensationValue: Number(f.compensationValue) || 0, isActive: true, color: f.color };
    if (editing) {
      updateWorker(editing.id, f.password.trim() ? { ...base, password: f.password.trim() } : base);
      setEditing(null);
    } else {
      addWorker({ ...base, password: f.password.trim() || undefined });
      setShowModal(false);
    }
  }

  const active = store.workers.filter((w) => w.isActive);
  const inactive = store.workers.filter((w) => !w.isActive);

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 bg-[var(--ds-warning)]/8 border border-[var(--ds-warning)]/20 rounded-xl px-4 py-3 text-xs text-[var(--ds-warning)]">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span><strong>Modo demo.</strong> Autenticación y permisos almacenados localmente. En producción deben validarse en servidor.</span>
      </div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--ds-text-muted)]">{active.length} activo{active.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
          <UserPlus className="w-4 h-4" /> Agregar trabajador
        </button>
      </div>
      {store.workers.length === 0 ? (
        <div className="text-center py-16 text-[var(--ds-text-muted)]">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin trabajadores</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...active, ...inactive].map((w) => {
            const earned = store.commissions.filter((c) => c.workerId === w.id && c.status !== "cancelled").reduce((s, c) => s + c.earnedAmount, 0);
            const taskCount = store.tasks.filter((t) => t.workerId === w.id).length;
            return (
              <div key={w.id} className={`bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4 flex items-start gap-4 ${!w.isActive ? "opacity-60" : ""}`}>
                <Avatar name={w.name} color={w.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[var(--ds-text)] text-sm">{w.name}</p>
                    {w.role === "business_admin" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "color-mix(in srgb, var(--ds-warning) 12%, transparent)", color: "var(--ds-warning)" }}>
                        <Crown className="w-3 h-3" /> Admin
                      </span>
                    )}
                    {!w.isActive && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)]">Inactivo</span>}
                  </div>
                  <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">{w.email}{w.specialty ? ` · ${w.specialty}` : ""}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--ds-text-muted)]">
                    <span>{COMPENSATION_LABELS[w.compensationType]}{w.compensationType === "percentage" ? `: ${w.compensationValue}%` : w.compensationType === "fixed" ? `: ${formatCurrency(w.compensationValue)}` : ""}</span>
                    <span>·</span>
                    <span className="text-[var(--ds-success)] font-medium">{formatCurrency(earned)} ganado</span>
                    <span>·</span>
                    <span>{taskCount} cliente{taskCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleWorkerActive(w.id)} aria-label={w.isActive ? "Desactivar trabajador" : "Activar trabajador"} className="p-2 rounded-lg text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">
                    {w.isActive ? <ToggleRight className="w-4 h-4 text-[var(--ds-success)]" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditing(w)} className="p-2 rounded-lg text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]" aria-label={`Editar trabajador ${w.name}`}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete(w.id)} className="p-2 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] hover:bg-[var(--ds-error)]/10" aria-label={`Eliminar trabajador ${w.name}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && <WorkerModal onSave={handleSave} onClose={() => setShowModal(false)} />}
      {editing && (
        <WorkerModal isEditing initial={{ name: editing.name, email: editing.email, phone: editing.phone ?? "", role: editing.role, specialty: editing.specialty ?? "", compensationType: editing.compensationType, compensationValue: String(editing.compensationValue), color: editing.color, password: "" }}
          onSave={handleSave} onClose={() => setEditing(null)} />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--ds-error) 12%, transparent)" }}>
                <Trash2 className="w-5 h-5 text-[var(--ds-error)]" />
              </div>
              <div><p className="font-bold text-[var(--ds-text)]">Eliminar trabajador</p><p className="text-sm text-[var(--ds-text-muted)]">Elimina también comisiones, clientes asignados y tareas.</p></div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-[var(--ds-border)] text-sm text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
              <button onClick={() => { deleteWorker(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 rounded-xl bg-[var(--ds-error)] text-white text-sm font-semibold hover:opacity-90">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Asignaciones de citas ───────────────────────────────────────────────

function AsignacionesTab() {
  const { store, assignWorker } = useEquipo();
  const [filterWorker, setFilterWorker] = useState<string>("all");
  const workers = store.workers.filter((w) => w.isActive);

  const displayed = filterWorker === "all"
    ? allAppointments
    : filterWorker === "unassigned"
    ? allAppointments.filter((a) => !store.assignments[a.id])
    : allAppointments.filter((a) => store.assignments[a.id] === filterWorker);

  return (
    <div>
      <p className="text-xs text-[var(--ds-text-muted)] mb-4">Vincula citas existentes con un trabajador responsable.</p>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[{ id: "all", label: "Todas" }, { id: "unassigned", label: "Sin asignar" }, ...workers.map((w) => ({ id: w.id, label: w.name.split(" ").slice(0, 2).join(" ") }))].map((f) => (
          <button key={f.id} onClick={() => setFilterWorker(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterWorker === f.id ? "bg-[var(--ds-accent)]/12 text-[var(--ds-accent)] border-[var(--ds-accent)]/30" : "bg-[var(--ds-surface)] text-[var(--ds-text-muted)] border-[var(--ds-border)] hover:bg-[var(--ds-surface-muted)]"}`}>
            {f.label}
          </button>
        ))}
      </div>
      {workers.length === 0 ? (
        <p className="text-sm text-center text-[var(--ds-text-muted)] py-10">Primero agrega trabajadores.</p>
      ) : (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--ds-bg)] border-b border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold">Paciente</th>
                <th className="text-left px-4 py-3 font-semibold">Servicio</th>
                <th className="text-right px-4 py-3 font-semibold">Monto</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="text-left px-4 py-3 font-semibold">Trabajador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-border)]">
              {displayed.map((apt) => {
                const assignedId = store.assignments[apt.id];
                const worker = workers.find((w) => w.id === assignedId);
                return (
                  <tr key={apt.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)] whitespace-nowrap">{apt.desiredDate} {apt.desiredTime ?? ""}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--ds-text)] text-sm">{apt.patientName}</p>
                      {apt.patientPhone && <p className="text-[11px] text-[var(--ds-text-muted)]">{apt.patientPhone}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">{apt.serviceName}</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-[var(--ds-text)]">{apt.estimatedAmount ? formatCurrency(apt.estimatedAmount) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">{apt.status}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select value={assignedId ?? ""} onChange={(e) => assignWorker(apt.id, e.target.value || null)}
                          className="appearance-none w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-lg px-3 py-1.5 text-xs pr-7 focus:outline-none focus:border-[var(--ds-accent)]"
                          style={worker ? { borderColor: worker.color + "66" } : {}}>
                          <option value="">Sin asignar</option>
                          {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--ds-text-muted)] pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayed.length === 0 && <div className="text-center py-10 text-[var(--ds-text-muted)] text-sm">Sin citas para este filtro.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Clientes asignados ──────────────────────────────────────────────────

function ClientesTab() {
  const { store, addTask, updateTask, setTaskStatus, deleteTask } = useEquipo();
  const [filterWorker, setFilterWorker] = useState("all");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<WorkerTask | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const workers = store.workers;
  const tasks = store.tasks.filter((t) => {
    if (filterWorker !== "all" && t.workerId !== filterWorker) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  interface ClientForm { workerId: string; clientName: string; clientPhone: string; serviceName: string; serviceAmount: string; dueDate: string; notes: string; status: TaskStatus; }
  const emptyForm = (): ClientForm => ({ workerId: "", clientName: "", clientPhone: "", serviceName: "", serviceAmount: "", dueDate: "", notes: "", status: "assigned" });
  const [form, setForm] = useState<ClientForm>(emptyForm());
  const setF = (k: keyof ClientForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function handleSave() {
    if (!form.workerId || !form.clientName || !form.serviceName) return;
    const data = { workerId: form.workerId, clientName: form.clientName, clientPhone: form.clientPhone || undefined, serviceName: form.serviceName, serviceAmount: Number(form.serviceAmount) || undefined, dueDate: form.dueDate || undefined, notes: form.notes || undefined, status: form.status };
    if (editing) { updateTask(editing.id, data); setEditing(null); }
    else { addTask(data); setShowModal(false); setForm(emptyForm()); }
  }

  function startEdit(t: WorkerTask) {
    setEditing(t);
    setForm({ workerId: t.workerId, clientName: t.clientName, clientPhone: t.clientPhone ?? "", serviceName: t.serviceName, serviceAmount: t.serviceAmount ? String(t.serviceAmount) : "", dueDate: t.dueDate ?? "", notes: t.notes ?? "", status: t.status });
  }

  const modal = (isEdit: boolean) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ds-border)]">
          <h2 className="font-bold text-[var(--ds-text)]">{isEdit ? "Editar cliente asignado" : "Asignar cliente"}</h2>
          <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-[var(--ds-text-muted)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Trabajador *</label>
            <select value={form.workerId} onChange={(e) => setF("workerId", e.target.value)} className={inp}>
              <option value="">Seleccionar…</option>
              {workers.filter((w) => w.isActive).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Cliente *</label><input value={form.clientName} onChange={(e) => setF("clientName", e.target.value)} className={inp} /></div>
            <div><label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Teléfono</label><input value={form.clientPhone} onChange={(e) => setF("clientPhone", e.target.value)} className={inp} /></div>
            <div><label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Servicio *</label><input value={form.serviceName} onChange={(e) => setF("serviceName", e.target.value)} className={inp} /></div>
            <div><label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Monto ($)</label><input type="number" min="0" value={form.serviceAmount} onChange={(e) => setF("serviceAmount", e.target.value)} className={inp} /></div>
            <div><label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Fecha</label><input type="date" value={form.dueDate} onChange={(e) => setF("dueDate", e.target.value)} className={inp} /></div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Estado</label>
              <select value={form.status} onChange={(e) => setF("status", e.target.value as TaskStatus)} className={inp}>
                {(["assigned", "completed", "incomplete"] as TaskStatus[]).map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Notas</label><textarea rows={2} value={form.notes} onChange={(e) => setF("notes", e.target.value)} className={inp} /></div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--ds-border)]">
          <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2 rounded-xl border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-sm hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] text-sm font-semibold hover:opacity-90">Guardar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <p className="text-xs text-[var(--ds-text-muted)] mb-4">Clientes directamente asignados a un trabajador para su atención.</p>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select value={filterWorker} onChange={(e) => setFilterWorker(e.target.value)} className="appearance-none border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text)] rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none">
              <option value="all">Todos los trabajadores</option>
              {workers.map((w) => <option key={w.id} value={w.id}>{w.name.split(" ").slice(0, 2).join(" ")}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--ds-text-muted)] pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")} className="appearance-none border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text)] rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none">
              <option value="all">Todos los estados</option>
              {(["assigned", "completed", "incomplete"] as TaskStatus[]).map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--ds-text-muted)] pointer-events-none" />
          </div>
        </div>
        <button onClick={() => { setForm(emptyForm()); setShowModal(true); }} className="inline-flex items-center gap-2 bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
          <PlusCircle className="w-4 h-4" /> Asignar cliente
        </button>
      </div>
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-[var(--ds-text-muted)]">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm">Sin clientes asignados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const worker = workers.find((w) => w.id === task.workerId);
            const invoice = task.invoiceId ? store.invoices.find((inv) => inv.id === task.invoiceId) : null;
            return (
              <div key={task.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {worker && <Avatar name={worker.name} color={worker.color} size={7} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--ds-text)] text-sm">{task.clientName}</p>
                      {task.clientPhone && <span className="text-[11px] text-[var(--ds-text-muted)]">{task.clientPhone}</span>}
                      <span style={taskStatusStyle(task.status)} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border">{TASK_STATUS_LABELS[task.status]}</span>
                      {invoice && (
                        <Link href={`/trabajador/factura/${invoice.id}`} target="_blank"
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
                          style={{ background: "color-mix(in srgb, var(--ds-accent) 12%, transparent)", color: "var(--ds-accent)", borderColor: "color-mix(in srgb, var(--ds-accent) 25%, transparent)" }}>
                          <Receipt className="w-3 h-3" /> {invoice.folio}
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">
                      {task.serviceName}{task.serviceAmount ? ` · ${formatCurrency(task.serviceAmount)}` : ""}{task.dueDate ? ` · ${task.dueDate}` : ""}
                    </p>
                    {worker && <p className="text-[11px] text-[var(--ds-text-muted)]">→ {worker.name}</p>}
                    {task.notes && <p className="text-[11px] text-[var(--ds-text-muted)] italic mt-1">"{task.notes}"</p>}
                    {task.completedAt && <p className="text-[11px] text-[var(--ds-success)] mt-1">Completado: {new Date(task.completedAt).toLocaleDateString("es-MX")}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {task.status !== "completed" && (
                      <button onClick={() => setTaskStatus(task.id, "completed")} aria-label="Marcar tarea completada" className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-success)] hover:bg-[var(--ds-success)]/10">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => startEdit(task)} className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]" aria-label="Editar tarea"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(task.id)} className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] hover:bg-[var(--ds-error)]/10" aria-label="Eliminar tarea"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && modal(false)}
      {editing && modal(true)}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <p className="font-bold text-[var(--ds-text)] mb-2">Eliminar asignación</p>
            <p className="text-sm text-[var(--ds-text-muted)] mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-[var(--ds-border)] text-sm text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
              <button onClick={() => { deleteTask(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 rounded-xl bg-[var(--ds-error)] text-white text-sm font-semibold hover:opacity-90">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Tareas operativas + Seguimiento ─────────────────────────────────────

function TareasTab() {
  const { store, addOpsTask, updateOpsTask, setOpsTaskStatus, deleteOpsTask } = useEquipo();
  const [view, setView] = useState<"gestion" | "seguimiento">("gestion");
  const [filterWorker, setFilterWorker] = useState("all");
  const [filterStatus, setFilterStatus] = useState<OpsTaskStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<WorkerOpsTask | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const workers = store.workers;

  interface OpsForm { workerId: string; title: string; description: string; dueDate: string; status: OpsTaskStatus; }
  const emptyForm = (): OpsForm => ({ workerId: "", title: "", description: "", dueDate: "", status: "pending" });
  const [form, setForm] = useState<OpsForm>(emptyForm());
  const setF = (k: keyof OpsForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function handleSave() {
    if (!form.workerId || !form.title.trim()) return;
    const data = { workerId: form.workerId, title: form.title.trim(), description: form.description || undefined, dueDate: form.dueDate || undefined, status: form.status };
    if (editing) { updateOpsTask(editing.id, data); setEditing(null); }
    else { addOpsTask(data); setShowModal(false); setForm(emptyForm()); }
  }

  function startEdit(t: WorkerOpsTask) {
    setEditing(t);
    setForm({ workerId: t.workerId, title: t.title, description: t.description ?? "", dueDate: t.dueDate ?? "", status: t.status });
  }

  const filtered = store.opsTasks.filter((t) => {
    if (filterWorker !== "all" && t.workerId !== filterWorker) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => {
    const order: Record<OpsTaskStatus, number> = { pending: 0, overdue: 1, completed: 2 };
    return order[a.status] - order[b.status] || (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
  });

  const countPending   = store.opsTasks.filter((t) => t.status === "pending").length;
  const countCompleted = store.opsTasks.filter((t) => t.status === "completed").length;
  const countOverdue   = store.opsTasks.filter((t) => t.status === "overdue").length;

  const modal = (isEdit: boolean) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ds-border)]">
          <h2 className="font-bold text-[var(--ds-text)]">{isEdit ? "Editar tarea" : "Nueva tarea"}</h2>
          <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-[var(--ds-text-muted)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Trabajador *</label>
            <select value={form.workerId} onChange={(e) => setF("workerId", e.target.value)} className={inp}>
              <option value="">Seleccionar…</option>
              {workers.filter((w) => w.isActive).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Título *</label>
            <input value={form.title} onChange={(e) => setF("title", e.target.value)} className={inp} placeholder="Ej. Preparar materiales…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Descripción</label>
            <textarea rows={2} value={form.description} onChange={(e) => setF("description", e.target.value)} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Fecha límite</label>
              <input type="date" value={form.dueDate} onChange={(e) => setF("dueDate", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Estado</label>
              <select value={form.status} onChange={(e) => setF("status", e.target.value as OpsTaskStatus)} className={inp}>
                {(["pending", "completed", "overdue"] as OpsTaskStatus[]).map((s) => <option key={s} value={s}>{OPS_TASK_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--ds-border)]">
          <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2 rounded-xl border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-sm hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] text-sm font-semibold hover:opacity-90">Guardar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Sub-view toggle */}
      <div className="flex items-center gap-1 mb-5 bg-[var(--ds-surface-muted)] p-1 rounded-xl w-fit">
        {([["gestion", "Gestión"], ["seguimiento", "Seguimiento"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === id ? "bg-[var(--ds-surface)] text-[var(--ds-text)] shadow-sm" : "text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Pendientes", value: countPending, color: "var(--ds-warning)" },
          { label: "Completadas", value: countCompleted, color: "var(--ds-success)" },
          { label: "Vencidas", value: countOverdue, color: "var(--ds-error)" },
        ].map((c) => (
          <div key={c.label} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3 text-center">
            <p className="text-xl font-extrabold" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px] text-[var(--ds-text-muted)] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + create */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select value={filterWorker} onChange={(e) => setFilterWorker(e.target.value)} className="appearance-none border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text)] rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none">
              <option value="all">Todos los trabajadores</option>
              {workers.map((w) => <option key={w.id} value={w.id}>{w.name.split(" ").slice(0, 2).join(" ")}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--ds-text-muted)] pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as OpsTaskStatus | "all")} className="appearance-none border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text)] rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none">
              <option value="all">Todos los estados</option>
              {(["pending", "completed", "overdue"] as OpsTaskStatus[]).map((s) => <option key={s} value={s}>{OPS_TASK_STATUS_LABELS[s]}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--ds-text-muted)] pointer-events-none" />
          </div>
        </div>
        {view === "gestion" && (
          <button onClick={() => { setForm(emptyForm()); setShowModal(true); }} className="inline-flex items-center gap-2 bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
            <PlusCircle className="w-4 h-4" /> Nueva tarea
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-[var(--ds-text-muted)]">
          <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Sin tareas{filterWorker !== "all" || filterStatus !== "all" ? " para este filtro" : ""}</p>
        </div>
      ) : view === "seguimiento" ? (
        /* Seguimiento table */
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--ds-bg)] border-b border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Tarea</th>
                <th className="text-left px-4 py-3 font-semibold">Trabajador</th>
                <th className="text-left px-4 py-3 font-semibold">Fecha límite</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="text-left px-4 py-3 font-semibold">Finalizada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-border)]">
              {filtered.map((t) => {
                const worker = workers.find((w) => w.id === t.workerId);
                return (
                  <tr key={t.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--ds-text)] text-sm">{t.title}</p>
                      {t.description && <p className="text-[11px] text-[var(--ds-text-muted)] truncate max-w-[200px]">{t.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {worker ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={worker.name} color={worker.color} size={6} />
                          <span className="text-xs truncate max-w-[90px]">{worker.name.split(" ").slice(0, 2).join(" ")}</span>
                        </div>
                      ) : <span className="text-xs text-[var(--ds-text-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">{t.dueDate ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span style={opsStatusStyle(t.status)} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border">{OPS_TASK_STATUS_LABELS[t.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">
                      {t.completedAt ? new Date(t.completedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Gestión cards */
        <div className="space-y-3">
          {filtered.map((t) => {
            const worker = workers.find((w) => w.id === t.workerId);
            return (
              <div key={t.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {worker && <Avatar name={worker.name} color={worker.color} size={7} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--ds-text)] text-sm">{t.title}</p>
                      <span style={opsStatusStyle(t.status)} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border">{OPS_TASK_STATUS_LABELS[t.status]}</span>
                    </div>
                    {t.description && <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">{t.description}</p>}
                    <p className="text-[11px] text-[var(--ds-text-muted)] mt-0.5">
                      {worker?.name}{t.dueDate ? ` · Fecha límite: ${t.dueDate}` : ""}
                    </p>
                    {t.completedAt && <p className="text-[11px] text-[var(--ds-success)] mt-1">Completada: {new Date(t.completedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {t.status !== "completed" && (
                      <button onClick={() => setOpsTaskStatus(t.id, "completed")} aria-label="Marcar tarea operativa completada" className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-success)] hover:bg-[var(--ds-success)]/10"><Check className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]" aria-label="Editar tarea operativa"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(t.id)} className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] hover:bg-[var(--ds-error)]/10" aria-label="Eliminar tarea operativa"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && modal(false)}
      {editing && modal(true)}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <p className="font-bold text-[var(--ds-text)] mb-2">Eliminar tarea</p>
            <p className="text-sm text-[var(--ds-text-muted)] mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-[var(--ds-border)] text-sm text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
              <button onClick={() => { deleteOpsTask(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 rounded-xl bg-[var(--ds-error)] text-white text-sm font-semibold hover:opacity-90">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Comisiones ──────────────────────────────────────────────────────────

function ComisionesTab() {
  const { store, addCommission, updateCommissionStatus, deleteCommission } = useEquipo();
  const [filterWorker, setFilterWorker] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ workerId: "", appointmentId: "", patientName: "", serviceName: "", serviceAmount: "", compensationType: "fixed" as Worker["compensationType"], compensationValue: "", earnedAmount: "", notes: "" });

  const workers = store.workers;
  const commissions = filterWorker === "all" ? store.commissions : store.commissions.filter((c) => c.workerId === filterWorker);
  function workerOf(id: string) { return workers.find((w) => w.id === id); }

  function handleAddCommission() {
    if (!form.workerId || !form.patientName || !form.serviceName) return;
    const worker = workerOf(form.workerId);
    if (!worker) return;
    const serviceAmount = Number(form.serviceAmount) || 0;
    let earnedAmount = Number(form.earnedAmount) || 0;
    if (form.compensationType === "percentage") earnedAmount = (serviceAmount * (Number(form.compensationValue) || 0)) / 100;
    else if (form.compensationType === "fixed") earnedAmount = Number(form.compensationValue) || 0;
    addCommission({ workerId: form.workerId, appointmentId: form.appointmentId || `manual-${Date.now()}`, appointmentDate: new Date().toISOString().slice(0, 10), patientName: form.patientName, serviceName: form.serviceName, serviceAmount, compensationType: form.compensationType, compensationValue: Number(form.compensationValue) || 0, earnedAmount, status: "pending", notes: form.notes || undefined });
    setShowForm(false);
    setForm({ workerId: "", appointmentId: "", patientName: "", serviceName: "", serviceAmount: "", compensationType: "fixed", compensationValue: "", earnedAmount: "", notes: "" });
  }

  const totalPending  = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.earnedAmount, 0);
  const totalApproved = commissions.filter((c) => c.status === "approved").reduce((s, c) => s + c.earnedAmount, 0);
  const totalPaid     = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.earnedAmount, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[{ label: "Pendiente", value: totalPending, color: "var(--ds-warning)" }, { label: "Aprobado", value: totalApproved, color: "var(--ds-accent)" }, { label: "Pagado", value: totalPaid, color: "var(--ds-success)" }].map((c) => (
          <div key={c.label} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3">
            <p className="text-xs text-[var(--ds-text-muted)]">{c.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: c.color }}>{formatCurrency(c.value)}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {[{ id: "all", label: "Todos" }, ...workers.map((w) => ({ id: w.id, label: w.name.split(" ").slice(0, 2).join(" ") }))].map((f) => (
            <button key={f.id} onClick={() => setFilterWorker(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterWorker === f.id ? "bg-[var(--ds-accent)]/12 text-[var(--ds-accent)] border-[var(--ds-accent)]/30" : "bg-[var(--ds-surface)] text-[var(--ds-text-muted)] border-[var(--ds-border)] hover:bg-[var(--ds-surface-muted)]"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90">
          <PlusCircle className="w-3.5 h-3.5" /> Registrar comisión
        </button>
      </div>
      {showForm && (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-[var(--ds-text)] text-sm mb-3">Nueva comisión</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Trabajador *</label><select value={form.workerId} onChange={(e) => setForm((p) => ({ ...p, workerId: e.target.value }))} className={inp}><option value="">Seleccionar…</option>{workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Paciente *</label><input value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} className={inp} /></div>
            <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Servicio *</label><input value={form.serviceName} onChange={(e) => setForm((p) => ({ ...p, serviceName: e.target.value }))} className={inp} /></div>
            <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Monto ($)</label><input type="number" value={form.serviceAmount} onChange={(e) => setForm((p) => ({ ...p, serviceAmount: e.target.value }))} className={inp} /></div>
            <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Tipo</label><select value={form.compensationType} onChange={(e) => setForm((p) => ({ ...p, compensationType: e.target.value as Worker["compensationType"] }))} className={inp}><option value="fixed">Monto fijo</option><option value="manual">Manual</option></select></div>
            {form.compensationType === "manual" ? (
              <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Monto comisión ($)</label><input type="number" value={form.earnedAmount} onChange={(e) => setForm((p) => ({ ...p, earnedAmount: e.target.value }))} className={inp} /></div>
            ) : (
              <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Monto comisión ($)</label><input type="number" step="0.01" value={form.compensationValue} onChange={(e) => setForm((p) => ({ ...p, compensationValue: e.target.value }))} className={inp} placeholder="Ej. 250.00" /></div>
            )}
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
            <button onClick={handleAddCommission} className="px-3 py-1.5 rounded-lg bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] text-xs font-semibold hover:opacity-90">Guardar</button>
          </div>
        </div>
      )}
      {commissions.length === 0 ? (
        <div className="text-center py-12 text-[var(--ds-text-muted)]"><DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Sin comisiones</p></div>
      ) : (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-[var(--ds-bg)] border-b border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-semibold">Fecha</th><th className="text-left px-4 py-3 font-semibold">Trabajador</th><th className="text-left px-4 py-3 font-semibold">Paciente / Servicio</th><th className="text-right px-4 py-3 font-semibold">Servicio</th><th className="text-right px-4 py-3 font-semibold">Comisión</th><th className="text-left px-4 py-3 font-semibold">Estado</th><th className="px-4 py-3" />
            </tr></thead>
            <tbody className="divide-y divide-[var(--ds-border)]">
              {commissions.map((c) => {
                const worker = workerOf(c.workerId);
                return (
                  <tr key={c.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">{c.appointmentDate}</td>
                    <td className="px-4 py-3">{worker ? <div className="flex items-center gap-2"><Avatar name={worker.name} color={worker.color} size={6} /><span className="text-xs truncate max-w-[80px]">{worker.name.split(" ").slice(0, 2).join(" ")}</span></div> : <span className="text-xs text-[var(--ds-text-muted)]">—</span>}</td>
                    <td className="px-4 py-3"><p className="text-xs font-medium text-[var(--ds-text)]">{c.patientName}</p><p className="text-[11px] text-[var(--ds-text-muted)]">{c.serviceName}</p></td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--ds-text-muted)]">{formatCurrency(c.serviceAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--ds-success)] text-sm">{formatCurrency(c.earnedAmount)}</td>
                    <td className="px-4 py-3">
                      <select value={c.status} onChange={(e) => updateCommissionStatus(c.id, e.target.value as CommissionStatus)} style={statusStyle(c.status)} className="text-[11px] font-semibold px-2 py-1 rounded-lg border appearance-none focus:outline-none cursor-pointer">
                        {(["pending", "approved", "paid", "cancelled"] as CommissionStatus[]).map((s) => <option key={s} value={s}>{COMMISSION_STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3"><button onClick={() => deleteCommission(c.id)} className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] hover:bg-[var(--ds-error)]/10" aria-label="Eliminar comisión"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Liquidaciones ───────────────────────────────────────────────────────

function LiquidacionesTab() {
  const { store, createSettlement, updateSettlementStatus, deleteSettlement, updateCommissionStatus } = useEquipo();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ workerId: "", periodLabel: "", periodStart: "", periodEnd: "" });
  const workers = store.workers;
  function workerOf(id: string) { return workers.find((w) => w.id === id); }

  function handleCreate() {
    if (!form.workerId || !form.periodLabel) return;
    const eligible = store.commissions.filter((c) => c.workerId === form.workerId && c.status === "approved" && !c.settlementId);
    const totalEarned = eligible.reduce((s, c) => s + c.earnedAmount, 0);
    const settlement = createSettlement({ workerId: form.workerId, periodLabel: form.periodLabel, periodStart: form.periodStart, periodEnd: form.periodEnd, commissionIds: eligible.map((c) => c.id), totalEarned, status: "open" });
    eligible.forEach((c) => updateCommissionStatus(c.id, "approved", c.notes));
    void settlement;
    setShowForm(false);
    setForm({ workerId: "", periodLabel: "", periodStart: "", periodEnd: "" });
  }

  function markPaid(id: string) {
    const s = store.settlements.find((x) => x.id === id);
    if (!s) return;
    updateSettlementStatus(id, "paid", new Date().toISOString());
    s.commissionIds.forEach((cid) => updateCommissionStatus(cid, "paid"));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--ds-text-muted)]">{store.settlements.length} liquidación{store.settlements.length !== 1 ? "es" : ""}</p>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
          <FileText className="w-4 h-4" /> Nueva liquidación
        </button>
      </div>
      {showForm && (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 mb-5">
          <h3 className="font-semibold text-[var(--ds-text)] text-sm mb-4">Crear liquidación</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Trabajador *</label>
              <select value={form.workerId} onChange={(e) => setForm((p) => ({ ...p, workerId: e.target.value }))} className={inp}>
                <option value="">Seleccionar…</option>
                {workers.map((w) => { const eligible = store.commissions.filter((c) => c.workerId === w.id && c.status === "approved" && !c.settlementId); return <option key={w.id} value={w.id}>{w.name} ({eligible.length} comisiones aprobadas)</option>; })}
              </select>
              {form.workerId && (() => { const eligible = store.commissions.filter((c) => c.workerId === form.workerId && c.status === "approved" && !c.settlementId); const total = eligible.reduce((s, c) => s + c.earnedAmount, 0); return eligible.length > 0 ? <p className="text-xs text-[var(--ds-success)] mt-1">Incluirá {eligible.length} comisión{eligible.length !== 1 ? "es" : ""} — {formatCurrency(total)}</p> : <p className="text-xs text-[var(--ds-warning)] mt-1">Sin comisiones aprobadas.</p>; })()}
            </div>
            <div className="col-span-2"><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Período *</label><input placeholder="Jun 2026 — 1ª quincena" value={form.periodLabel} onChange={(e) => setForm((p) => ({ ...p, periodLabel: e.target.value }))} className={inp} /></div>
            <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Inicio</label><input type="date" value={form.periodStart} onChange={(e) => setForm((p) => ({ ...p, periodStart: e.target.value }))} className={inp} /></div>
            <div><label className="block text-xs text-[var(--ds-text-muted)] mb-1">Fin</label><input type="date" value={form.periodEnd} onChange={(e) => setForm((p) => ({ ...p, periodEnd: e.target.value }))} className={inp} /></div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
            <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-[var(--ds-accent)] text-[var(--ds-accent-foreground)] text-xs font-semibold hover:opacity-90">Crear</button>
          </div>
        </div>
      )}
      {store.settlements.length === 0 ? (
        <div className="text-center py-16 text-[var(--ds-text-muted)]"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium text-sm">Sin liquidaciones</p></div>
      ) : (
        <div className="space-y-3">
          {store.settlements.map((s) => {
            const worker = workerOf(s.workerId);
            return (
              <div key={s.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">{worker && <Avatar name={worker.name} color={worker.color} />}<div><p className="font-semibold text-[var(--ds-text)] text-sm">{worker?.name ?? "—"}</p><p className="text-xs text-[var(--ds-text-muted)]">{s.periodLabel}</p><p className="text-[11px] text-[var(--ds-text-muted)]">{s.commissionIds.length} comisión{s.commissionIds.length !== 1 ? "es" : ""}</p></div></div>
                  <div className="text-right"><p className="text-xl font-bold text-[var(--ds-success)]">{formatCurrency(s.totalEarned)}</p><span style={settlementStyle(s.status)} className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1">{SETTLEMENT_STATUS_LABELS[s.status]}</span></div>
                </div>
                {s.paidAt && <p className="text-[11px] text-[var(--ds-text-muted)] mt-2">Pagado: {new Date(s.paidAt).toLocaleDateString("es-MX")}</p>}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--ds-border)]">
                  {s.status === "open" && <button onClick={() => updateSettlementStatus(s.id, "closed")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]"><X className="w-3.5 h-3.5" />Cerrar período</button>}
                  {(s.status === "open" || s.status === "closed") && <button onClick={() => markPaid(s.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ds-success)] text-white text-xs font-semibold hover:opacity-90"><Check className="w-3.5 h-3.5" />Marcar como pagada</button>}
                  <button onClick={() => deleteSettlement(s.id)} className="ml-auto p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] hover:bg-[var(--ds-error)]/10" aria-label="Eliminar liquidación"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Recibos ─────────────────────────────────────────────────────────────

function RecibosTab() {
  const { store } = useEquipo();
  const invoices = [...store.invoices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  function workerOf(id: string) { return store.workers.find((w) => w.id === id); }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--ds-text-muted)]">
        <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-sm">Sin recibos generados</p>
        <p className="text-xs mt-1">Los recibos aparecen cuando un trabajador los genera desde su portal</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="bg-[var(--ds-bg)] border-b border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide">
          <th className="text-left px-4 py-3 font-semibold">Folio</th><th className="text-left px-4 py-3 font-semibold">Trabajador</th><th className="text-left px-4 py-3 font-semibold">Cliente</th><th className="text-left px-4 py-3 font-semibold">Servicio</th><th className="text-right px-4 py-3 font-semibold">Monto</th><th className="text-left px-4 py-3 font-semibold">Fecha</th><th className="px-4 py-3" />
        </tr></thead>
        <tbody className="divide-y divide-[var(--ds-border)]">
          {invoices.map((inv) => {
            const worker = workerOf(inv.workerId);
            return (
              <tr key={inv.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-[var(--ds-accent)]">{inv.folio}</span></td>
                <td className="px-4 py-3">{worker ? <div className="flex items-center gap-2"><Avatar name={worker.name} color={worker.color} size={6} /><span className="text-xs truncate max-w-[90px]">{worker.name.split(" ").slice(0, 2).join(" ")}</span></div> : <span className="text-xs text-[var(--ds-text-muted)]">{inv.workerName}</span>}</td>
                <td className="px-4 py-3 text-xs text-[var(--ds-text)]">{inv.clientName}</td>
                <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">{inv.serviceName}</td>
                <td className="px-4 py-3 text-right font-bold text-[var(--ds-success)] text-sm">{formatCurrency(inv.amount)}</td>
                <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)] whitespace-nowrap">{new Date(inv.createdAt).toLocaleDateString("es-MX")}</td>
                <td className="px-4 py-3"><Link href={`/trabajador/factura/${inv.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-[var(--ds-accent)] hover:opacity-80"><ExternalLink className="w-3.5 h-3.5" />Ver</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = "trabajadores" | "asignaciones" | "clientes" | "tareas" | "comisiones" | "liquidaciones" | "recibos";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "trabajadores",  label: "Trabajadores",  icon: Users },
  { id: "asignaciones",  label: "Asignaciones",  icon: Briefcase },
  { id: "clientes",      label: "Clientes",       icon: ClipboardList },
  { id: "tareas",        label: "Tareas",          icon: ListChecks },
  { id: "comisiones",    label: "Comisiones",     icon: DollarSign },
  { id: "liquidaciones", label: "Liquidaciones",  icon: FileText },
  { id: "recibos",       label: "Recibos",        icon: Receipt },
];

export default function EquipoPage() {
  const [tab, setTab] = useState<TabId>("trabajadores");
  const { store } = useEquipo();

  const pendingTasks = store.opsTasks.filter((t) => t.status === "pending").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Equipo</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--ds-warning) 15%, transparent)", color: "var(--ds-warning)", border: "1px solid color-mix(in srgb, var(--ds-warning) 30%, transparent)" }}>
            <Crown className="w-3 h-3" /> Premium
          </span>
        </div>
        <p className="text-[var(--ds-text-muted)] text-sm">Gestiona trabajadores, clientes asignados, tareas operativas, comisiones y liquidaciones.</p>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2 text-sm">
          <span className="text-[var(--ds-text-muted)]">Activos </span>
          <span className="font-bold text-[var(--ds-text)]">{store.workers.filter((w) => w.isActive).length}</span>
          <span className="text-[var(--ds-text-muted)]"> / {store.workers.length}</span>
        </div>
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2 text-sm">
          <span className="text-[var(--ds-text-muted)]">Clientes asignados </span>
          <span className="font-bold text-[var(--ds-accent)]">{store.tasks.length}</span>
        </div>
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2 text-sm">
          <span className="text-[var(--ds-text-muted)]">Tareas pendientes </span>
          <span className="font-bold text-[var(--ds-warning)]">{pendingTasks}</span>
        </div>
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2 text-sm">
          <span className="text-[var(--ds-text-muted)]">Por pagar </span>
          <span className="font-bold text-[var(--ds-success)]">{formatCurrency(store.commissions.filter((c) => c.status === "approved").reduce((s, c) => s + c.earnedAmount, 0))}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--ds-surface-muted)] p-1 rounded-xl overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 relative ${tab === t.id ? "bg-[var(--ds-surface)] text-[var(--ds-text)] shadow-sm" : "text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"}`}>
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
            {t.id === "tareas" && pendingTasks > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--ds-warning)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingTasks > 9 ? "9+" : pendingTasks}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "trabajadores"  && <TrabajadoresTab />}
      {tab === "asignaciones"  && <AsignacionesTab />}
      {tab === "clientes"      && <ClientesTab />}
      {tab === "tareas"        && <TareasTab />}
      {tab === "comisiones"    && <ComisionesTab />}
      {tab === "liquidaciones" && <LiquidacionesTab />}
      {tab === "recibos"       && <RecibosTab />}
    </div>
  );
}
