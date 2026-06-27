"use client";
import { useState, type CSSProperties } from "react";
import {
  Users, UserPlus, Briefcase, DollarSign, FileText,
  ChevronDown, Pencil, Trash2, Check, X, AlertCircle,
  PlusCircle, Crown, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useEquipo } from "@/contexts/EquipoContext";
import { appointments as allAppointments } from "@/data/appointments";
import { formatCurrency } from "@/lib/utils";
import type { Worker, CommissionStatus, SettlementStatus } from "@/types/equipo";
import {
  COMPENSATION_LABELS, COMMISSION_STATUS_LABELS,
  SETTLEMENT_STATUS_LABELS, WORKER_COLORS,
} from "@/types/equipo";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Avatar({ name, color, size = 8 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{ background: color + "22", borderColor: color + "44", width: `${size * 4}px`, height: `${size * 4}px` }}
      className="rounded-full border flex items-center justify-center flex-shrink-0"
    >
      <span style={{ color }} className="text-xs font-bold">{initials}</span>
    </div>
  );
}

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

// ─── Worker form ──────────────────────────────────────────────────────────────

interface WorkerFormData {
  name: string;
  email: string;
  phone: string;
  role: Worker["role"];
  specialty: string;
  compensationType: Worker["compensationType"];
  compensationValue: string;
  color: string;
}

const emptyForm = (): WorkerFormData => ({
  name: "", email: "", phone: "", role: "worker", specialty: "",
  compensationType: "percentage", compensationValue: "40", color: WORKER_COLORS[0],
});

function WorkerModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: WorkerFormData;
  onSave: (f: WorkerFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<WorkerFormData>(initial ?? emptyForm());
  const set = (k: keyof WorkerFormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ds-border)]">
          <h2 className="font-bold text-[var(--ds-text)]">{initial ? "Editar trabajador" : "Nuevo trabajador"}</h2>
          <button onClick={onClose} className="text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Nombre completo *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Email *</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email"
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Teléfono</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Rol</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value as Worker["role"])}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]">
                <option value="worker">Trabajador</option>
                <option value="business_admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Especialidad</label>
              <input value={form.specialty} onChange={(e) => set("specialty", e.target.value)}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">Tipo de compensación</label>
              <select value={form.compensationType} onChange={(e) => set("compensationType", e.target.value as Worker["compensationType"])}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]">
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            {form.compensationType !== "manual" && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[var(--ds-text-muted)] mb-1">
                  {form.compensationType === "percentage" ? "Porcentaje (%)" : "Monto por cita ($)"}
                </label>
                <input value={form.compensationValue} onChange={(e) => set("compensationValue", e.target.value)} type="number" min="0"
                  className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
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
          <button
            onClick={() => { if (form.name && form.email) onSave(form); }}
            className="px-4 py-2 rounded-xl bg-[var(--ds-accent)] text-white text-sm font-semibold hover:opacity-90"
          >
            Guardar
          </button>
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
    const data = {
      name: f.name,
      email: f.email,
      phone: f.phone || undefined,
      role: f.role,
      specialty: f.specialty || undefined,
      compensationType: f.compensationType,
      compensationValue: Number(f.compensationValue) || 0,
      isActive: true,
      color: f.color,
    };
    if (editing) {
      updateWorker(editing.id, data);
      setEditing(null);
    } else {
      addWorker(data);
      setShowModal(false);
    }
  }

  const active = store.workers.filter((w) => w.isActive);
  const inactive = store.workers.filter((w) => !w.isActive);

  return (
    <div>
      {/* Notice */}
      <div className="mb-4 flex items-start gap-2 bg-[var(--ds-warning)]/8 border border-[var(--ds-warning)]/20 rounded-xl px-4 py-3 text-xs text-[var(--ds-warning)]">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Modo demo.</strong> Los trabajadores y permisos se guardan localmente. En producción, la autenticación y autorización deben validarse en el servidor.
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-[var(--ds-text-muted)]">{active.length} trabajador{active.length !== 1 ? "es" : ""} activo{active.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-[var(--ds-accent)] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90"
        >
          <UserPlus className="w-4 h-4" />
          Agregar trabajador
        </button>
      </div>

      {store.workers.length === 0 ? (
        <div className="text-center py-16 text-[var(--ds-text-muted)]">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay trabajadores registrados</p>
          <p className="text-sm mt-1">Agrega al primer miembro del equipo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...active, ...inactive].map((w) => {
            const commissions = store.commissions.filter((c) => c.workerId === w.id);
            const earned = commissions.filter((c) => c.status !== "cancelled").reduce((s, c) => s + c.earnedAmount, 0);
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
                    {!w.isActive && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)]">Inactivo</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">{w.email}{w.specialty ? ` · ${w.specialty}` : ""}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--ds-text-muted)]">
                    <span>
                      {COMPENSATION_LABELS[w.compensationType]}
                      {w.compensationType === "percentage" ? `: ${w.compensationValue}%` : w.compensationType === "fixed" ? `: ${formatCurrency(w.compensationValue)}` : ""}
                    </span>
                    <span>·</span>
                    <span className="text-[var(--ds-success)] font-medium">{formatCurrency(earned)} ganado</span>
                    <span>·</span>
                    <span>{commissions.length} comisión{commissions.length !== 1 ? "es" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleWorkerActive(w.id)}
                    title={w.isActive ? "Desactivar" : "Activar"}
                    className="p-2 rounded-lg text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)] transition-colors"
                  >
                    {w.isActive ? <ToggleRight className="w-4 h-4 text-[var(--ds-success)]" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditing(w)}
                    className="p-2 rounded-lg text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(w.id)}
                    className="p-2 rounded-lg text-[var(--ds-text-muted)] hover:bg-[var(--ds-error)]/10 hover:text-[var(--ds-error)] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <WorkerModal onSave={handleSave} onClose={() => setShowModal(false)} />
      )}

      {/* Edit modal */}
      {editing && (
        <WorkerModal
          initial={{
            name: editing.name, email: editing.email, phone: editing.phone ?? "",
            role: editing.role, specialty: editing.specialty ?? "",
            compensationType: editing.compensationType,
            compensationValue: String(editing.compensationValue),
            color: editing.color,
          }}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--ds-error) 12%, transparent)" }}>
                <Trash2 className="w-5 h-5 text-[var(--ds-error)]" />
              </div>
              <div>
                <p className="font-bold text-[var(--ds-text)]">Eliminar trabajador</p>
                <p className="text-sm text-[var(--ds-text-muted)]">Esta acción eliminará también sus comisiones y asignaciones.</p>
              </div>
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

// ─── Tab: Asignaciones ────────────────────────────────────────────────────────

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
      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[
          { id: "all", label: "Todas" },
          { id: "unassigned", label: "Sin asignar" },
          ...workers.map((w) => ({ id: w.id, label: w.name.split(" ").slice(0, 2).join(" ") })),
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterWorker(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterWorker === f.id
                ? "bg-[var(--ds-accent)]/12 text-[var(--ds-accent)] border-[var(--ds-accent)]/30"
                : "bg-[var(--ds-surface)] text-[var(--ds-text-muted)] border-[var(--ds-border)] hover:bg-[var(--ds-surface-muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-10 text-[var(--ds-text-muted)] text-sm">
          <p>Primero agrega trabajadores en la pestaña <strong>Trabajadores</strong>.</p>
        </div>
      ) : (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--ds-bg)] border-b border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold">Paciente</th>
                <th className="text-left px-4 py-3 font-semibold">Servicio</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="text-left px-4 py-3 font-semibold">Trabajador asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-border)]">
              {displayed.map((apt) => {
                const assignedId = store.assignments[apt.id];
                const worker = workers.find((w) => w.id === assignedId);
                return (
                  <tr key={apt.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)] whitespace-nowrap">{apt.desiredDate}</td>
                    <td className="px-4 py-3 font-medium text-[var(--ds-text)]">{apt.patientName}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">{apt.serviceName}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)]">{apt.status}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={assignedId ?? ""}
                          onChange={(e) => assignWorker(apt.id, e.target.value || null)}
                          className="appearance-none w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-lg px-3 py-1.5 text-xs pr-7 focus:outline-none focus:border-[var(--ds-accent)]"
                          style={worker ? { borderColor: worker.color + "66" } : {}}
                        >
                          <option value="">Sin asignar</option>
                          {workers.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--ds-text-muted)] pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayed.length === 0 && (
            <div className="text-center py-10 text-[var(--ds-text-muted)] text-sm">Sin citas para este filtro.</div>
          )}
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
  const [form, setForm] = useState({
    workerId: "", appointmentId: "", patientName: "", serviceName: "",
    serviceAmount: "", compensationType: "percentage" as Worker["compensationType"],
    compensationValue: "", earnedAmount: "", notes: "",
  });

  const workers = store.workers;
  const commissions = filterWorker === "all"
    ? store.commissions
    : store.commissions.filter((c) => c.workerId === filterWorker);

  function workerOf(id: string) { return workers.find((w) => w.id === id); }

  function handleAddCommission() {
    if (!form.workerId || !form.patientName || !form.serviceName) return;
    const worker = workerOf(form.workerId);
    if (!worker) return;
    const serviceAmount = Number(form.serviceAmount) || 0;
    let earnedAmount = Number(form.earnedAmount) || 0;
    if (form.compensationType === "percentage") {
      earnedAmount = (serviceAmount * (Number(form.compensationValue) || 0)) / 100;
    } else if (form.compensationType === "fixed") {
      earnedAmount = Number(form.compensationValue) || 0;
    }
    addCommission({
      workerId: form.workerId,
      appointmentId: form.appointmentId || `manual-${Date.now()}`,
      appointmentDate: new Date().toISOString().slice(0, 10),
      patientName: form.patientName,
      serviceName: form.serviceName,
      serviceAmount,
      compensationType: form.compensationType,
      compensationValue: Number(form.compensationValue) || 0,
      earnedAmount,
      status: "pending",
      notes: form.notes || undefined,
    });
    setShowForm(false);
    setForm({ workerId: "", appointmentId: "", patientName: "", serviceName: "", serviceAmount: "", compensationType: "percentage", compensationValue: "", earnedAmount: "", notes: "" });
  }

  const totalPending = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.earnedAmount, 0);
  const totalApproved = commissions.filter((c) => c.status === "approved").reduce((s, c) => s + c.earnedAmount, 0);
  const totalPaid = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.earnedAmount, 0);

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Pendiente", value: totalPending, color: "var(--ds-warning)" },
          { label: "Aprobado", value: totalApproved, color: "var(--ds-accent)" },
          { label: "Pagado", value: totalPaid, color: "var(--ds-success)" },
        ].map((c) => (
          <div key={c.label} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3">
            <p className="text-xs text-[var(--ds-text-muted)]">{c.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: c.color }}>{formatCurrency(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {[{ id: "all", label: "Todos" }, ...workers.map((w) => ({ id: w.id, label: w.name.split(" ").slice(0, 2).join(" ") }))].map((f) => (
            <button key={f.id} onClick={() => setFilterWorker(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterWorker === f.id
                  ? "bg-[var(--ds-accent)]/12 text-[var(--ds-accent)] border-[var(--ds-accent)]/30"
                  : "bg-[var(--ds-surface)] text-[var(--ds-text-muted)] border-[var(--ds-border)] hover:bg-[var(--ds-surface-muted)]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 bg-[var(--ds-accent)] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90">
          <PlusCircle className="w-3.5 h-3.5" />
          Registrar comisión
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-[var(--ds-text)] text-sm mb-3">Nueva comisión manual</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Trabajador *</label>
              <select value={form.workerId} onChange={(e) => setForm((p) => ({ ...p, workerId: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]">
                <option value="">Seleccionar…</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Paciente *</label>
              <input value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Servicio *</label>
              <input value={form.serviceName} onChange={(e) => setForm((p) => ({ ...p, serviceName: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Monto del servicio ($)</label>
              <input type="number" value={form.serviceAmount} onChange={(e) => setForm((p) => ({ ...p, serviceAmount: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Tipo de compensación</label>
              <select value={form.compensationType} onChange={(e) => setForm((p) => ({ ...p, compensationType: e.target.value as Worker["compensationType"] }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]">
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Fijo</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            {form.compensationType === "manual" ? (
              <div>
                <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Monto a pagar ($)</label>
                <input type="number" value={form.earnedAmount} onChange={(e) => setForm((p) => ({ ...p, earnedAmount: e.target.value }))}
                  className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-[var(--ds-text-muted)] mb-1">
                  {form.compensationType === "percentage" ? "%" : "$ por cita"}
                </label>
                <input type="number" value={form.compensationValue} onChange={(e) => setForm((p) => ({ ...p, compensationValue: e.target.value }))}
                  className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
            <button onClick={handleAddCommission} className="px-3 py-1.5 rounded-lg bg-[var(--ds-accent)] text-white text-xs font-semibold hover:opacity-90">Guardar</button>
          </div>
        </div>
      )}

      {/* Table */}
      {commissions.length === 0 ? (
        <div className="text-center py-12 text-[var(--ds-text-muted)]">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin comisiones registradas</p>
        </div>
      ) : (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--ds-bg)] border-b border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold">Trabajador</th>
                <th className="text-left px-4 py-3 font-semibold">Paciente / Servicio</th>
                <th className="text-right px-4 py-3 font-semibold">Servicio</th>
                <th className="text-right px-4 py-3 font-semibold">Comisión</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-border)]">
              {commissions.map((c) => {
                const worker = workerOf(c.workerId);
                return (
                  <tr key={c.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-muted)] whitespace-nowrap">{c.appointmentDate}</td>
                    <td className="px-4 py-3">
                      {worker ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={worker.name} color={worker.color} size={6} />
                          <span className="text-xs font-medium text-[var(--ds-text)] truncate max-w-[100px]">{worker.name.split(" ").slice(0, 2).join(" ")}</span>
                        </div>
                      ) : <span className="text-xs text-[var(--ds-text-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-[var(--ds-text)]">{c.patientName}</p>
                      <p className="text-[11px] text-[var(--ds-text-muted)]">{c.serviceName}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--ds-text-muted)]">{formatCurrency(c.serviceAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--ds-success)] text-sm">{formatCurrency(c.earnedAmount)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={(e) => updateCommissionStatus(c.id, e.target.value as CommissionStatus)}
                        style={statusStyle(c.status)}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg border appearance-none focus:outline-none cursor-pointer"
                      >
                        {(["pending", "approved", "paid", "cancelled"] as CommissionStatus[]).map((s) => (
                          <option key={s} value={s}>{COMMISSION_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteCommission(c.id)} className="p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] hover:bg-[var(--ds-error)]/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
  const [form, setForm] = useState({
    workerId: "", periodLabel: "", periodStart: "", periodEnd: "",
  });

  const workers = store.workers;

  function workerOf(id: string) { return workers.find((w) => w.id === id); }

  function handleCreate() {
    if (!form.workerId || !form.periodLabel) return;
    const eligible = store.commissions.filter(
      (c) => c.workerId === form.workerId && c.status === "approved" && !c.settlementId
    );
    const totalEarned = eligible.reduce((s, c) => s + c.earnedAmount, 0);
    const settlement = createSettlement({
      workerId: form.workerId,
      periodLabel: form.periodLabel,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      commissionIds: eligible.map((c) => c.id),
      totalEarned,
      status: "open",
    });
    eligible.forEach((c) => {
      updateCommissionStatus(c.id, "approved", c.notes);
    });
    void settlement;
    setShowForm(false);
    setForm({ workerId: "", periodLabel: "", periodStart: "", periodEnd: "" });
  }

  function markPaid(id: string) {
    const settlement = store.settlements.find((s) => s.id === id);
    if (!settlement) return;
    updateSettlementStatus(id, "paid", new Date().toISOString());
    settlement.commissionIds.forEach((cid) => updateCommissionStatus(cid, "paid"));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--ds-text-muted)]">{store.settlements.length} liquidación{store.settlements.length !== 1 ? "es" : ""}</p>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[var(--ds-accent)] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
          <FileText className="w-4 h-4" />
          Nueva liquidación
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 mb-5">
          <h3 className="font-semibold text-[var(--ds-text)] text-sm mb-4">Crear liquidación</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Trabajador *</label>
              <select value={form.workerId} onChange={(e) => setForm((p) => ({ ...p, workerId: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]">
                <option value="">Seleccionar trabajador…</option>
                {workers.map((w) => {
                  const eligible = store.commissions.filter((c) => c.workerId === w.id && c.status === "approved" && !c.settlementId);
                  return <option key={w.id} value={w.id}>{w.name} ({eligible.length} comisiones aprobadas)</option>;
                })}
              </select>
              {form.workerId && (() => {
                const eligible = store.commissions.filter((c) => c.workerId === form.workerId && c.status === "approved" && !c.settlementId);
                const total = eligible.reduce((s, c) => s + c.earnedAmount, 0);
                return eligible.length > 0 ? (
                  <p className="text-xs text-[var(--ds-success)] mt-1">Incluirá {eligible.length} comisión{eligible.length !== 1 ? "es" : ""} — total: {formatCurrency(total)}</p>
                ) : (
                  <p className="text-xs text-[var(--ds-warning)] mt-1">Sin comisiones aprobadas disponibles para este trabajador.</p>
                );
              })()}
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Período *</label>
              <input placeholder="e.g. Jun 2026 — 1ª quincena" value={form.periodLabel} onChange={(e) => setForm((p) => ({ ...p, periodLabel: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Inicio</label>
              <input type="date" value={form.periodStart} onChange={(e) => setForm((p) => ({ ...p, periodStart: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--ds-text-muted)] mb-1">Fin</label>
              <input type="date" value={form.periodEnd} onChange={(e) => setForm((p) => ({ ...p, periodEnd: e.target.value }))}
                className="w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-accent)]" />
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]">Cancelar</button>
            <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-[var(--ds-accent)] text-white text-xs font-semibold hover:opacity-90">Crear</button>
          </div>
        </div>
      )}

      {/* List */}
      {store.settlements.length === 0 ? (
        <div className="text-center py-16 text-[var(--ds-text-muted)]">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm">Sin liquidaciones</p>
          <p className="text-xs mt-1">Crea una liquidación para agrupar y pagar comisiones aprobadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {store.settlements.map((s) => {
            const worker = workerOf(s.workerId);
            return (
              <div key={s.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {worker && <Avatar name={worker.name} color={worker.color} />}
                    <div>
                      <p className="font-semibold text-[var(--ds-text)] text-sm">{worker?.name ?? "—"}</p>
                      <p className="text-xs text-[var(--ds-text-muted)]">{s.periodLabel}</p>
                      <p className="text-[11px] text-[var(--ds-text-muted)] mt-0.5">{s.commissionIds.length} comisión{s.commissionIds.length !== 1 ? "es" : ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[var(--ds-success)]">{formatCurrency(s.totalEarned)}</p>
                    <span style={settlementStyle(s.status)} className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1">
                      {SETTLEMENT_STATUS_LABELS[s.status]}
                    </span>
                  </div>
                </div>
                {s.paidAt && (
                  <p className="text-[11px] text-[var(--ds-text-muted)] mt-2">Pagado: {new Date(s.paidAt).toLocaleDateString("es-MX")}</p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--ds-border)]">
                  {s.status === "open" && (
                    <button
                      onClick={() => updateSettlementStatus(s.id, "closed")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)]"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cerrar período
                    </button>
                  )}
                  {(s.status === "open" || s.status === "closed") && (
                    <button
                      onClick={() => markPaid(s.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ds-success)] text-white text-xs font-semibold hover:opacity-90"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar como pagada
                    </button>
                  )}
                  <button
                    onClick={() => deleteSettlement(s.id)}
                    className="ml-auto p-1.5 rounded-lg text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] hover:bg-[var(--ds-error)]/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = "trabajadores" | "asignaciones" | "comisiones" | "liquidaciones";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "trabajadores", label: "Trabajadores", icon: Users },
  { id: "asignaciones", label: "Asignaciones", icon: Briefcase },
  { id: "comisiones", label: "Comisiones", icon: DollarSign },
  { id: "liquidaciones", label: "Liquidaciones", icon: FileText },
];

export default function EquipoPage() {
  const [tab, setTab] = useState<TabId>("trabajadores");
  const { store } = useEquipo();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Equipo</h1>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "color-mix(in srgb, var(--ds-warning) 15%, transparent)", color: "var(--ds-warning)", border: "1px solid color-mix(in srgb, var(--ds-warning) 30%, transparent)" }}
          >
            <Crown className="w-3 h-3" /> Premium
          </span>
        </div>
        <p className="text-[var(--ds-text-muted)] text-sm">Gestiona trabajadores, asignaciones de citas, comisiones y liquidaciones.</p>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2 text-sm">
          <span className="text-[var(--ds-text-muted)]">Activos </span>
          <span className="font-bold text-[var(--ds-text)]">{store.workers.filter((w) => w.isActive).length}</span>
          <span className="text-[var(--ds-text-muted)]"> / {store.workers.length}</span>
        </div>
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2 text-sm">
          <span className="text-[var(--ds-text-muted)]">Comisiones pendientes </span>
          <span className="font-bold text-[var(--ds-warning)]">{store.commissions.filter((c) => c.status === "pending").length}</span>
        </div>
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2 text-sm">
          <span className="text-[var(--ds-text-muted)]">Por pagar </span>
          <span className="font-bold text-[var(--ds-success)]">
            {formatCurrency(store.commissions.filter((c) => c.status === "approved").reduce((s, c) => s + c.earnedAmount, 0))}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--ds-surface-muted)] p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-[var(--ds-surface)] text-[var(--ds-text)] shadow-sm"
                : "text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "trabajadores" && <TrabajadoresTab />}
      {tab === "asignaciones" && <AsignacionesTab />}
      {tab === "comisiones" && <ComisionesTab />}
      {tab === "liquidaciones" && <LiquidacionesTab />}
    </div>
  );
}
