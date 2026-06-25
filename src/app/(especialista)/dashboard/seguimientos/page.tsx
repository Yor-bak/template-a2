"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useClientData } from "@/contexts/ClientDataContext";
import {
  FOLLOW_UP_PRIORITY_LABELS, FOLLOW_UP_PRIORITY_COLORS,
  type FollowUpPriority, type FollowUpStatus,
} from "@/types/clientData";
import { formatShortDate } from "@/lib/utils";
import { Bell, Plus, CheckCircle2, Trash2, X, AlertCircle, Calendar, Clock } from "lucide-react";

const inp = "w-full border border-[var(--ds-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--ds-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 bg-[var(--ds-bg)] placeholder:text-[var(--ds-text-muted)]/40";
const lblCls = "text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide block mb-1.5";

export default function SeguimientosPage() {
  const { clients, followUps, carePlans, addFollowUp, completeFollowUp, deleteFollowUp, getClient, updateFollowUp } = useClientData();
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusView, setStatusView] = useState<"pending" | "completed" | "cancelled">("pending");

  const [form, setForm] = useState({
    clientId: "", title: "", description: "", dueDate: "",
    priority: "medium" as FollowUpPriority, relatedPlanId: "",
  });

  const clientPlans = useMemo(() =>
    form.clientId ? carePlans.filter((p) => p.clientId === form.clientId) : [],
    [form.clientId, carePlans]
  );

  function save() {
    if (!form.clientId || !form.title.trim() || !form.dueDate) return;
    addFollowUp({
      clientId: form.clientId, title: form.title, description: form.description || undefined,
      dueDate: form.dueDate, priority: form.priority, status: "pending",
      relatedPlanId: form.relatedPlanId || undefined,
    });
    setForm({ clientId: "", title: "", description: "", dueDate: "", priority: "medium", relatedPlanId: "" });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const today = new Date().toISOString().slice(0, 10);

  const { overdue, dueToday, upcoming, completed } = useMemo(() => {
    const pending = followUps.filter((f) => f.status === "pending");
    const done = followUps.filter((f) => f.status === "completed");
    const cancelled = followUps.filter((f) => f.status === "cancelled");
    return {
      overdue: pending.filter((f) => f.dueDate < today),
      dueToday: pending.filter((f) => f.dueDate === today),
      upcoming: pending.filter((f) => f.dueDate > today),
      completed: statusView === "completed" ? done : cancelled,
    };
  }, [followUps, today, statusView]);

  function FollowUpCard({ fu }: { fu: typeof followUps[0] }) {
    const client = getClient(fu.clientId);
    const plan = fu.relatedPlanId ? carePlans.find((p) => p.id === fu.relatedPlanId) : undefined;
    return (
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl px-5 py-4 shadow-sm flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${FOLLOW_UP_PRIORITY_COLORS[fu.priority]}`}>{FOLLOW_UP_PRIORITY_LABELS[fu.priority]}</span>
            <span className={`text-sm font-semibold ${fu.status === "completed" ? "line-through text-[var(--ds-text-muted)]" : "text-[var(--ds-text)]"}`}>{fu.title}</span>
          </div>
          {fu.description && <p className="text-xs text-[var(--ds-text-muted)] mb-1">{fu.description}</p>}
          <div className="flex flex-wrap gap-3 text-xs text-[var(--ds-text-muted)]">
            {client && <Link href={`/dashboard/pacientes/${client.id}`} className="hover:text-[var(--ds-primary)] hover:underline font-medium">{client.name}</Link>}
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatShortDate(fu.dueDate)}</span>
            {plan && <span>Plan: {plan.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {fu.status === "pending" && (
            <>
              <button onClick={() => completeFollowUp(fu.id)} className="text-xs text-[var(--ds-success)] border border-[var(--ds-success)]/30 px-3 py-1.5 rounded-lg hover:bg-[var(--ds-success)]/8 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />Completar
              </button>
              <button onClick={() => updateFollowUp(fu.id, { status: "cancelled" })} className="text-xs text-[var(--ds-text-muted)] border border-[var(--ds-border)] px-3 py-1.5 rounded-lg hover:bg-[var(--ds-bg)]">Cancelar</button>
            </>
          )}
          {fu.status === "completed" && <span className="text-xs text-[var(--ds-success)] font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Completado</span>}
          {fu.status === "cancelled" && <span className="text-xs text-[var(--ds-text-muted)] font-semibold">Cancelado</span>}
          <button onClick={() => deleteFollowUp(fu.id)} className="text-[var(--ds-text-muted)]/40 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  const pendingCount = overdue.length + dueToday.length + upcoming.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Seguimientos</h1>
          <p className="text-[var(--ds-text-muted)] text-sm">{pendingCount} pendientes · {followUps.filter((f) => f.status === "completed").length} completados</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-[var(--ds-success)] text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />Guardado</span>}
          <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-[var(--ds-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold">
            <Plus className="w-4 h-4" />Nuevo seguimiento
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--ds-text)]">Nuevo seguimiento</h2>
            <button onClick={() => setShowForm(false)} className="text-[var(--ds-text-muted)]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={lblCls}>Cliente *</label>
              <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value, relatedPlanId: "" }))} className={inp}>
                <option value="">Seleccionar cliente...</option>
                {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Título *</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej. Llamar para confirmar cita" className={inp} /></div>
            <div><label className={lblCls}>Fecha *</label><input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className={inp} /></div>
            <div><label className={lblCls}>Prioridad</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as FollowUpPriority }))} className={inp}>
                {(["low", "medium", "high"] as FollowUpPriority[]).map((k) => (<option key={k} value={k}>{FOLLOW_UP_PRIORITY_LABELS[k]}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Plan relacionado</label>
              <select value={form.relatedPlanId} onChange={(e) => setForm((f) => ({ ...f, relatedPlanId: e.target.value }))} className={inp} disabled={!form.clientId}>
                <option value="">Sin plan</option>
                {clientPlans.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Descripción</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inp} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)]">Cancelar</button>
            <button onClick={save} disabled={!form.clientId || !form.title.trim() || !form.dueDate} className="bg-[var(--ds-primary)] text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar seguimiento</button>
          </div>
        </div>
      )}

      {pendingCount === 0 && followUps.filter((f) => f.status !== "pending").length === 0 && (
        <div className="text-center py-16 text-[var(--ds-text-muted)]">
          <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
          <p className="font-semibold text-sm">No hay seguimientos pendientes.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-[var(--ds-primary)] hover:underline">Crear primer seguimiento</button>
        </div>
      )}

      {/* Vencidos */}
      {overdue.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-red-600 text-sm uppercase tracking-wide">Vencidos ({overdue.length})</h2>
          </div>
          <div className="space-y-3">
            {overdue.map((fu) => <FollowUpCard key={fu.id} fu={fu} />)}
          </div>
        </div>
      )}

      {/* Hoy */}
      {dueToday.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[var(--ds-warning)]" />
            <h2 className="font-bold text-[var(--ds-warning)] text-sm uppercase tracking-wide">Para hoy ({dueToday.length})</h2>
          </div>
          <div className="space-y-3">
            {dueToday.map((fu) => <FollowUpCard key={fu.id} fu={fu} />)}
          </div>
        </div>
      )}

      {/* Próximos */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[var(--ds-primary)]" />
            <h2 className="font-bold text-[var(--ds-text)] text-sm uppercase tracking-wide">Próximos ({upcoming.length})</h2>
          </div>
          <div className="space-y-3">
            {upcoming.map((fu) => <FollowUpCard key={fu.id} fu={fu} />)}
          </div>
        </div>
      )}

      {/* Completados / Cancelados */}
      {followUps.filter((f) => f.status !== "pending").length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-2">
              <button onClick={() => setStatusView("completed")} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${statusView === "completed" ? "bg-[var(--ds-success)]/15 text-[var(--ds-success)] border-[var(--ds-success)]/30" : "border-[var(--ds-border)] text-[var(--ds-text-muted)]"}`}>
                Completados ({followUps.filter((f) => f.status === "completed").length})
              </button>
              <button onClick={() => setStatusView("cancelled")} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${statusView === "cancelled" ? "bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)] border-[var(--ds-border)]" : "border-[var(--ds-border)] text-[var(--ds-text-muted)]"}`}>
                Cancelados ({followUps.filter((f) => f.status === "cancelled").length})
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {completed.map((fu) => <FollowUpCard key={fu.id} fu={fu} />)}
          </div>
        </div>
      )}
    </div>
  );
}
