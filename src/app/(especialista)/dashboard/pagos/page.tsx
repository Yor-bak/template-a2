"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useClientData } from "@/contexts/ClientDataContext";
import {
  PAYMENT_METHOD_LABELS, CLIENT_PAYMENT_STATUS_LABELS, CLIENT_PAYMENT_STATUS_COLORS,
  type ClientPaymentMethod, type ClientPaymentStatus,
} from "@/types/clientData";
import { exportToCSV } from "@/lib/exportUtils";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { CreditCard, Plus, Search, Download, Trash2, ExternalLink, X, CheckCircle2 } from "lucide-react";

const inp = "w-full border border-[var(--ds-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--ds-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 bg-[var(--ds-bg)] placeholder:text-[var(--ds-text-muted)]/40";
const lblCls = "text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide block mb-1.5";

export default function PagosPage() {
  const { clients, payments, carePlans, addPayment, deletePayment, getClient } = useClientData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientPaymentStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<ClientPaymentMethod | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    clientId: "", carePlanId: "", concept: "", amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "cash" as ClientPaymentMethod,
    status: "paid" as ClientPaymentStatus,
    reference: "", receiptUrl: "", notes: "",
  });

  const clientPlans = useMemo(() =>
    form.clientId ? carePlans.filter((p) => p.clientId === form.clientId) : [],
    [form.clientId, carePlans]
  );

  function save() {
    if (!form.clientId || !form.concept.trim() || !form.amount) return;
    addPayment({
      clientId: form.clientId, carePlanId: form.carePlanId || undefined,
      concept: form.concept, amount: parseFloat(form.amount),
      paymentDate: form.paymentDate, paymentMethod: form.paymentMethod,
      status: form.status, reference: form.reference || undefined,
      receiptUrl: form.receiptUrl || undefined, notes: form.notes || undefined,
    });
    setForm({ clientId: "", carePlanId: "", concept: "", amount: "", paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: "cash", status: "paid", reference: "", receiptUrl: "", notes: "" });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (methodFilter !== "all" && p.paymentMethod !== methodFilter) return false;
      if (search) {
        const client = getClient(p.clientId);
        const name = client?.name.toLowerCase() ?? "";
        if (!p.concept.toLowerCase().includes(search.toLowerCase()) && !name.includes(search.toLowerCase())) return false;
      }
      return true;
    }).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [payments, search, statusFilter, methodFilter, getClient]);

  const totalPaid = filtered.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = filtered.filter((p) => p.status === "pending" || p.status === "partial").reduce((s, p) => s + p.amount, 0);

  function handleExport() {
    exportToCSV("pagos", [
      ["Fecha", "Cliente", "Concepto", "Método", "Estado", "Monto", "Referencia"],
      ...filtered.map((p) => {
        const client = getClient(p.clientId);
        return [p.paymentDate, client?.name ?? "", p.concept, PAYMENT_METHOD_LABELS[p.paymentMethod], CLIENT_PAYMENT_STATUS_LABELS[p.status], p.amount, p.reference ?? ""];
      }),
    ]);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Pagos</h1>
          <p className="text-[var(--ds-text-muted)] text-sm">{payments.length} pagos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-[var(--ds-success)] text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />Guardado</span>}
          <button onClick={handleExport} className="inline-flex items-center gap-2 border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-3 py-2 rounded-xl text-sm font-medium hover:bg-[var(--ds-bg)]">
            <Download className="w-4 h-4" />CSV
          </button>
          <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-4 py-2 rounded-xl text-sm font-bold">
            <Plus className="w-4 h-4" />Registrar pago
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--ds-success)]/8 border border-[var(--ds-success)]/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-[var(--ds-success)]">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-[var(--ds-success)]/80 mt-1">Cobrado</p>
        </div>
        <div className="bg-[var(--ds-warning)]/8 border border-[var(--ds-warning)]/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-[var(--ds-warning)]">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-[var(--ds-warning)]/80 mt-1">Pendiente</p>
        </div>
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-[var(--ds-text)]">{filtered.length}</p>
          <p className="text-xs text-[var(--ds-text-muted)] mt-1">Movimientos</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--ds-text)]">Registrar pago</h2>
            <button onClick={() => setShowForm(false)} className="text-[var(--ds-text-muted)]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={lblCls}>Cliente *</label>
              <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value, carePlanId: "" }))} className={inp}>
                <option value="">Seleccionar cliente...</option>
                {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Plan relacionado</label>
              <select value={form.carePlanId} onChange={(e) => setForm((f) => ({ ...f, carePlanId: e.target.value }))} className={inp} disabled={!form.clientId}>
                <option value="">Sin plan</option>
                {clientPlans.map((p) => (<option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.pendingAmount)} pendiente</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Concepto *</label><input value={form.concept} onChange={(e) => setForm((f) => ({ ...f, concept: e.target.value }))} placeholder="Ej. Anticipo, pago de sesión..." className={inp} /></div>
            <div><label className={lblCls}>Monto *</label><input type="number" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className={inp} /></div>
            <div><label className={lblCls}>Fecha</label><input type="date" value={form.paymentDate} onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} className={inp} /></div>
            <div><label className={lblCls}>Método</label>
              <select value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as ClientPaymentMethod }))} className={inp}>
                {(Object.keys(PAYMENT_METHOD_LABELS) as ClientPaymentMethod[]).map((k) => (<option key={k} value={k}>{PAYMENT_METHOD_LABELS[k]}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Estado</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ClientPaymentStatus }))} className={inp}>
                {(["pending", "partial", "paid", "refunded", "cancelled"] as ClientPaymentStatus[]).map((k) => (<option key={k} value={k}>{CLIENT_PAYMENT_STATUS_LABELS[k]}</option>))}
              </select>
            </div>
            <div><label className={lblCls}>Referencia</label><input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} placeholder="Folio, # transferencia..." className={inp} /></div>
            <div className="sm:col-span-2"><label className={lblCls}>URL comprobante</label><input value={form.receiptUrl} onChange={(e) => setForm((f) => ({ ...f, receiptUrl: e.target.value }))} placeholder="https://..." className={inp} /></div>
            <div className="sm:col-span-2"><label className={lblCls}>Notas</label><textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={`${inp} resize-none`} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)]">Cancelar</button>
            <button onClick={save} disabled={!form.clientId || !form.concept.trim() || !form.amount} className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar pago</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-text-muted)]/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por concepto o cliente..." className="w-full pl-9 pr-4 py-2.5 border border-[var(--ds-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 bg-[var(--ds-surface)] text-[var(--ds-text)] placeholder:text-[var(--ds-text-muted)]/40" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ClientPaymentStatus | "all")} className="border border-[var(--ds-border)] rounded-xl px-3 py-2 text-sm text-[var(--ds-text)] bg-[var(--ds-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40">
          <option value="all">Todos los estados</option>
          {(Object.keys(CLIENT_PAYMENT_STATUS_LABELS) as ClientPaymentStatus[]).map((k) => (<option key={k} value={k}>{CLIENT_PAYMENT_STATUS_LABELS[k]}</option>))}
        </select>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as ClientPaymentMethod | "all")} className="border border-[var(--ds-border)] rounded-xl px-3 py-2 text-sm text-[var(--ds-text)] bg-[var(--ds-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40">
          <option value="all">Todos los métodos</option>
          {(Object.keys(PAYMENT_METHOD_LABELS) as ClientPaymentMethod[]).map((k) => (<option key={k} value={k}>{PAYMENT_METHOD_LABELS[k]}</option>))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[var(--ds-text-muted)]">
            <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
            <p className="font-semibold text-sm">{payments.length === 0 ? "No tienes pagos registrados." : "No se encontraron pagos con ese filtro."}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--ds-border)]">
            {filtered.map((pay) => {
              const client = getClient(pay.clientId);
              const plan = pay.carePlanId ? carePlans.find((p) => p.id === pay.carePlanId) : undefined;
              return (
                <div key={pay.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--ds-bg)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--ds-text)] text-sm">{pay.concept}</p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {client && <Link href={`/dashboard/pacientes/${client.id}`} className="text-xs text-[var(--ds-primary)] hover:underline">{client.name}</Link>}
                      {plan && <span className="text-xs text-[var(--ds-text-muted)]">· {plan.name}</span>}
                      <span className="text-xs text-[var(--ds-text-muted)]">{formatShortDate(pay.paymentDate)}</span>
                      <span className="text-xs text-[var(--ds-text-muted)]">{PAYMENT_METHOD_LABELS[pay.paymentMethod]}</span>
                      {pay.reference && <span className="text-xs text-[var(--ds-text-muted)]">Ref: {pay.reference}</span>}
                    </div>
                    {pay.receiptUrl && <a href={pay.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--ds-primary)] hover:underline flex items-center gap-1 mt-1"><ExternalLink className="w-3 h-3" />Ver comprobante</a>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CLIENT_PAYMENT_STATUS_COLORS[pay.status]}`}>{CLIENT_PAYMENT_STATUS_LABELS[pay.status]}</span>
                    <span className="font-bold text-[var(--ds-text)]">{formatCurrency(pay.amount)}</span>
                    <button onClick={() => deletePayment(pay.id)} className="text-[var(--ds-text-muted)]/40 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
