"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useClientData } from "@/contexts/ClientDataContext";
import {
  CARE_PLAN_STATUS_LABELS, CARE_PLAN_STATUS_COLORS,
  type CarePlanStatus, type CarePlanItem,
} from "@/types/clientData";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { ClipboardList, Plus, Search, ChevronRight, X, CheckCircle2 } from "lucide-react";

const inp = "w-full border border-[var(--ds-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--ds-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 bg-[var(--ds-bg)] placeholder:text-[var(--ds-text-muted)]/40";
const lblCls = "text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide block mb-1.5";

export default function PlanesPage() {
  const { clients, carePlans, addCarePlan, getClient } = useClientData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CarePlanStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    clientId: "", name: "", description: "", status: "draft" as CarePlanStatus,
    startDate: "", estimatedEndDate: "", discount: "", internalNotes: "",
    items: [] as Array<{ name: string; quantity: string; unitPrice: string; numberOfSessions: string }>,
  });

  const subtotal = useMemo(() =>
    form.items.reduce((s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0), 0),
    [form.items]
  );
  const total = Math.max(0, subtotal - (parseFloat(form.discount) || 0));

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { name: "", quantity: "1", unitPrice: "", numberOfSessions: "" }] }));
  }

  function save() {
    if (!form.clientId || !form.name.trim() || form.items.length === 0) return;
    const items: CarePlanItem[] = form.items.map((it, i) => ({
      id: `item-${Date.now()}-${i}`,
      name: it.name,
      quantity: parseFloat(it.quantity) || 1,
      unitPrice: parseFloat(it.unitPrice) || 0,
      numberOfSessions: it.numberOfSessions ? parseInt(it.numberOfSessions) : undefined,
      completedSessions: 0,
    }));
    const discount = parseFloat(form.discount) || undefined;
    addCarePlan({
      clientId: form.clientId, name: form.name, description: form.description || undefined,
      status: form.status, startDate: form.startDate || undefined, estimatedEndDate: form.estimatedEndDate || undefined,
      items, subtotal, discount, total, initialPayment: undefined,
      internalNotes: form.internalNotes || undefined, clientNotes: undefined,
    });
    setForm({ clientId: "", name: "", description: "", status: "draft", startDate: "", estimatedEndDate: "", discount: "", internalNotes: "", items: [] });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const filtered = useMemo(() => {
    return carePlans.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const client = getClient(p.clientId);
        const clientName = client?.name.toLowerCase() ?? "";
        if (!p.name.toLowerCase().includes(search.toLowerCase()) && !clientName.includes(search.toLowerCase())) return false;
      }
      return true;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [carePlans, search, statusFilter, getClient]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Planes de atención</h1>
          <p className="text-[var(--ds-text-muted)] text-sm">{carePlans.length} planes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-[var(--ds-success)] text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />Guardado</span>}
          <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-[var(--ds-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold">
            <Plus className="w-4 h-4" />Nuevo plan
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--ds-text)]">Nuevo plan de atención</h2>
            <button onClick={() => setShowForm(false)} className="text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={lblCls}>Cliente *</label>
              <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} className={inp}>
                <option value="">Seleccionar cliente...</option>
                {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Nombre del plan *</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Tratamiento de ortodoncia" className={inp} /></div>
            <div><label className={lblCls}>Estado</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CarePlanStatus }))} className={inp}>
                {(Object.keys(CARE_PLAN_STATUS_LABELS) as CarePlanStatus[]).map((k) => (<option key={k} value={k}>{CARE_PLAN_STATUS_LABELS[k]}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Descuento ($)</label><input type="number" min="0" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} className={inp} /></div>
            <div><label className={lblCls}>Fecha inicio</label><input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inp} /></div>
            <div><label className={lblCls}>Fecha estimada fin</label><input type="date" value={form.estimatedEndDate} onChange={(e) => setForm((f) => ({ ...f, estimatedEndDate: e.target.value }))} className={inp} /></div>
            <div className="sm:col-span-2"><label className={lblCls}>Descripción</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inp} /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={lblCls}>Servicios / Conceptos *</label>
              <button onClick={addItem} className="text-xs text-[var(--ds-primary)] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Agregar</button>
            </div>
            {form.items.length === 0 && <p className="text-xs text-[var(--ds-text-muted)] italic">Agrega al menos un concepto.</p>}
            {form.items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                <input value={it.name} onChange={(e) => setForm((f) => { const items = [...f.items]; items[i] = { ...items[i], name: e.target.value }; return { ...f, items }; })} placeholder="Servicio o concepto" className={`${inp} col-span-4`} />
                <input type="number" min="1" value={it.quantity} onChange={(e) => setForm((f) => { const items = [...f.items]; items[i] = { ...items[i], quantity: e.target.value }; return { ...f, items }; })} placeholder="Cant." className={`${inp} col-span-2`} />
                <input type="number" min="0" value={it.unitPrice} onChange={(e) => setForm((f) => { const items = [...f.items]; items[i] = { ...items[i], unitPrice: e.target.value }; return { ...f, items }; })} placeholder="Precio" className={`${inp} col-span-3`} />
                <input type="number" min="0" value={it.numberOfSessions} onChange={(e) => setForm((f) => { const items = [...f.items]; items[i] = { ...items[i], numberOfSessions: e.target.value }; return { ...f, items }; })} placeholder="Sesiones" className={`${inp} col-span-2`} />
                <button onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} className="col-span-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {form.items.length > 0 && (
              <div className="text-right text-sm mt-2 space-y-0.5">
                <p className="text-[var(--ds-text-muted)]">Subtotal: <strong className="text-[var(--ds-text)]">{formatCurrency(subtotal)}</strong></p>
                {parseFloat(form.discount) > 0 && <p className="text-red-500">Descuento: -{formatCurrency(parseFloat(form.discount))}</p>}
                <p>Total: <strong className="text-[var(--ds-primary)]">{formatCurrency(total)}</strong></p>
              </div>
            )}
          </div>

          <div><label className={lblCls}>Notas internas</label><textarea value={form.internalNotes} onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value }))} rows={2} className={`${inp} resize-none`} /></div>

          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)]">Cancelar</button>
            <button onClick={save} disabled={!form.clientId || !form.name.trim() || form.items.length === 0} className="bg-[var(--ds-primary)] text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar plan</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-text-muted)]/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o cliente..." className="w-full pl-9 pr-4 py-2.5 border border-[var(--ds-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 bg-[var(--ds-surface)] text-[var(--ds-text)] placeholder:text-[var(--ds-text-muted)]/40" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", ...Object.keys(CARE_PLAN_STATUS_LABELS)] as Array<"all" | CarePlanStatus>).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${statusFilter === s ? "bg-[var(--ds-primary)] text-white border-[var(--ds-primary)]" : "border-[var(--ds-border)] text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)]"}`}>
              {s === "all" ? "Todos" : CARE_PLAN_STATUS_LABELS[s as CarePlanStatus]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[var(--ds-text-muted)]">
            <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
            <p className="font-semibold text-sm">{carePlans.length === 0 ? "No hay planes de atención." : "No se encontraron planes con ese filtro."}</p>
            {carePlans.length === 0 && (
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-[var(--ds-primary)] hover:underline">Crear primer plan</button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--ds-border)]">
            {filtered.map((plan) => {
              const client = getClient(plan.clientId);
              return (
                <div key={plan.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--ds-bg)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CARE_PLAN_STATUS_COLORS[plan.status]}`}>{CARE_PLAN_STATUS_LABELS[plan.status]}</span>
                      <p className="font-bold text-[var(--ds-text)] truncate">{plan.name}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-[var(--ds-text-muted)]">
                      {client && <Link href={`/dashboard/pacientes/${client.id}`} className="hover:text-[var(--ds-primary)] hover:underline">{client.name}</Link>}
                      {plan.startDate && <span>Inicio: {formatShortDate(plan.startDate)}</span>}
                      <span>{plan.items.length} concepto{plan.items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="font-bold text-[var(--ds-text)]">{formatCurrency(plan.total)}</p>
                    {plan.pendingAmount > 0 && <p className="text-xs text-[var(--ds-warning)]">Pendiente: {formatCurrency(plan.pendingAmount)}</p>}
                    {plan.paidAmount > 0 && <p className="text-xs text-[var(--ds-success)]">Pagado: {formatCurrency(plan.paidAmount)}</p>}
                  </div>
                  {client && (
                    <Link href={`/dashboard/pacientes/${client.id}?tab=planes`} className="text-[var(--ds-text-muted)]/30 hover:text-[var(--ds-accent)] flex-shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
