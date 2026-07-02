"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import type {
  MonthlyFixedExpense,
  OtherFinancialMovement,
  MonthlyTaxRecord,
  InvoiceRecord,
  InvoiceStatus,
  FixedExpenseFrequency,
  FixedExpenseStatus,
  OtherIncomeCategory,
  OtherExpenseCategory,
  PaymentMethod,
  BankAccountConfig,
} from "@/types/user";
import {
  useAdminStore,
  MONTH_NAMES,
  getAnnualFinancialSummary,
  getMonthlyFinancialBreakdown,
  getVerifiedMonthlyIncome,
  getPaidCommissions,
  getActiveFixedExpensesByMonth,
  getFixedExpensesTotalByMonth,
  getOtherIncomeByMonth,
  getOtherExpensesByMonth,
  expenseAppliesToMonth,
} from "@/store/adminStore";
import { S, SectionTitle, Divider, fmtDate, StatGrid, StatCell, TabBar, TabButton } from "./adminUi";

// ── Types ─────────────────────────────────────────────────────────────────────
void getActiveFixedExpensesByMonth; // used indirectly

// ── Format helpers ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `$${n.toLocaleString("es-MX")}`;
}

function fmtOpt(n: number | null | undefined): string {
  return n == null ? "—" : fmt(n);
}

const FREQ_LABELS: Record<FixedExpenseFrequency, string> = {
  monthly:   "Mensual",
  bimonthly: "Bimestral",
  quarterly:  "Trimestral",
  annual:    "Anual",
};

const FREQ_OPTIONS: { value: FixedExpenseFrequency; label: string }[] = [
  { value: "monthly",   label: "Mensual"    },
  { value: "bimonthly", label: "Bimestral"  },
  { value: "quarterly", label: "Trimestral" },
  { value: "annual",    label: "Anual"      },
];

const STATUS_LABELS: Record<FixedExpenseStatus, string> = {
  pending:  "Pendiente",
  paid:     "Pagado",
  overdue:  "Vencido",
};

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "transfer", label: "Transferencia" },
  { value: "cash",     label: "Efectivo"      },
  { value: "card",     label: "Tarjeta"       },
  { value: "check",    label: "Cheque"        },
  { value: "other",    label: "Otro"          },
];

const OTHER_INCOME_CATS: { value: OtherIncomeCategory; label: string }[] = [
  { value: "customization", label: "Personalización" },
  { value: "installation",  label: "Instalación"     },
  { value: "training",      label: "Capacitación"    },
  { value: "extraordinary", label: "Extraordinario"  },
  { value: "other",         label: "Otro"            },
];

const OTHER_EXPENSE_CATS: { value: OtherExpenseCategory; label: string }[] = [
  { value: "equipment",     label: "Equipo"            },
  { value: "advertising",   label: "Publicidad"        },
  { value: "repair",        label: "Reparación"        },
  { value: "refund",        label: "Devolución"        },
  { value: "extraordinary", label: "Extraordinario"    },
  { value: "other",         label: "Otro"              },
];

// ── Shared micro-components ───────────────────────────────────────────────────

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-none overflow-hidden border-[0.5px] border-[var(--border)] bg-[var(--bg-base)]">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">{children}</table>
      </div>
    </div>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-[10px] font-medium text-[var(--text-faint)] uppercase tracking-[0.08em] whitespace-nowrap text-left">
      {children}
    </th>
  );
}

function EmptyRow({ cols, msg }: { cols: number; msg?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-10 text-center text-[var(--text-muted)] text-xs">
        {msg ?? "Sin registros"}
      </td>
    </tr>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`text-[11px] font-medium transition-colors whitespace-nowrap pb-[3px] border-b focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
      active
        ? "text-[var(--text-primary)] border-[var(--accent)]"
        : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
    }`}>
      {label}
    </button>
  );
}

function StatusDot({ status }: { status: FixedExpenseStatus }) {
  const colors: Record<FixedExpenseStatus, string> = {
    pending: "text-[var(--text-muted)]",
    paid:    "text-[var(--accent)]",
    overdue: "text-[var(--danger)]",
  };
  return <span className={`text-[10px] font-medium ${colors[status]}`}>{STATUS_LABELS[status]}</span>;
}

// ── Month filter ──────────────────────────────────────────────────────────────

function MonthFilter({ year, month, onChange }: { year: number; month: number | null; onChange: (m: number | null) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Chip label={`Todo ${year}`} active={month === null} onClick={() => onChange(null)} />
      {MONTH_NAMES.map((name, i) => (
        <Chip key={i} label={name.slice(0, 3)} active={month === i + 1} onClick={() => onChange(i + 1)} />
      ))}
    </div>
  );
}

// ── Tab: Resumen ──────────────────────────────────────────────────────────────

function ResumenTab({ year }: { year: number }) {
  const store = useAdminStore();
  const now = new Date();
  const curM = now.getMonth() + 1;

  const summary = useMemo(
    () => getAnnualFinancialSummary(store.transfers, store.commissions, year),
    [store.transfers, store.commissions, year]
  );

  const monthlyIncomeOnly = useMemo(
    () => getVerifiedMonthlyIncome(store.transfers, year).reduce((s, t) => s + t.amount, 0),
    [store.transfers, year]
  );

  const annualFixed = useMemo(
    () => Array.from({ length: 12 }, (_, i) => getFixedExpensesTotalByMonth(store.fixedExpenses, year, i + 1))
      .reduce((s, v) => s + v, 0),
    [store.fixedExpenses, year]
  );

  const curMonthFixed = getFixedExpensesTotalByMonth(store.fixedExpenses, year, curM);
  const curMonthOtherExp = getOtherExpensesByMonth(store.otherMovements, year, curM)
    .reduce((s, m) => s + m.amount, 0);

  const annualOtherInc = useMemo(
    () => Array.from({ length: 12 }, (_, i) => getOtherIncomeByMonth(store.otherMovements, year, i + 1))
      .reduce((s, arr) => s + arr.reduce((a, m) => a + m.amount, 0), 0),
    [store.otherMovements, year]
  );

  const breakdown = useMemo(
    () => getMonthlyFinancialBreakdown(store.transfers, store.commissions, year),
    [store.transfers, store.commissions, year]
  );

  return (
    <div className="space-y-6">
      <p className="text-[10px] text-[var(--text-muted)] italic">
        Estimación financiera interna. No sustituye cálculo contable o fiscal.
      </p>

      {/* 3 cards (Comisiones pendientes moved to Vendedores) */}
      <StatGrid cols={3}>
        <StatCell
          label="Mensualidades confirmadas"
          value={fmt(monthlyIncomeOnly)}
          sub={`${summary.monthlyCount} pagos · ${year}`}
          tone="accent"
        />
        <StatCell
          label="Otros ingresos"
          value={fmt(annualOtherInc)}
          sub="ingresos manuales"
        />
        <StatCell
          label="Gastos del mes"
          value={fmt(curMonthFixed + curMonthOtherExp)}
          sub={`${MONTH_NAMES[curM - 1]} · fijos + egresos`}
          tone={(curMonthFixed + curMonthOtherExp) > 0 ? "danger" : undefined}
        />
      </StatGrid>

      {/* Monthly breakdown */}
      <div>
        <SectionTitle>Desglose mensual {year}</SectionTitle>
        <TableWrap>
          <thead>
            <tr className="border-b-[0.5px] border-[var(--border)]">
              {["Mes", "Mensualidades", "Otros ingr.", "Com. pagada", "Gastos fijos", "Util. neta est."].map((h) => <TH key={h}>{h}</TH>)}
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row) => {
              const otherInc = getOtherIncomeByMonth(store.otherMovements, year, row.month).reduce((s, m) => s + m.amount, 0);
              const fixed    = getFixedExpensesTotalByMonth(store.fixedExpenses, year, row.month);
              const netEst   = row.monthlyIncome + otherInc - row.paidCommissions - fixed;
              const hasAct   = row.monthlyIncome > 0 || row.paidCommissions > 0 || fixed > 0;
              return (
                <tr key={row.month} className={`border-b-[0.5px] border-[var(--border)] last:border-b-0 ${hasAct ? "" : "opacity-40"}`}>
                  <td className="px-4 py-2 font-medium text-[var(--text-primary)] whitespace-nowrap">{row.monthLabel}</td>
                  <td className="px-4 py-2 tabular-nums text-[var(--text-primary)]">{row.monthlyIncome > 0 ? fmt(row.monthlyIncome) : "—"}</td>
                  <td className="px-4 py-2 tabular-nums text-[var(--text-muted)]">{otherInc > 0 ? fmt(otherInc) : "—"}</td>
                  <td className="px-4 py-2 tabular-nums text-[var(--danger)]">{row.paidCommissions > 0 ? fmt(row.paidCommissions) : "—"}</td>
                  <td className="px-4 py-2 tabular-nums text-[var(--danger)]">{fixed > 0 ? fmt(fixed) : "—"}</td>
                  <td className="px-4 py-2 tabular-nums font-semibold text-[var(--accent)]">{hasAct ? fmt(netEst) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </div>

      <div className="text-[10px] text-[var(--text-muted)]">
        Aperturas del año: {summary.openingCount} · {fmt(summary.openingIncome)} — excluidas del resumen de mensualidades.
        Comisiones pagadas: {fmt(getPaidCommissions(store.commissions, year).reduce((s, c) => s + c.amount, 0))}.
        Gastos fijos anuales: {fmt(annualFixed)}.
      </div>
    </div>
  );
}

// ── Tab: Ingresos ─────────────────────────────────────────────────────────────

function IngresosTab({ year, month }: { year: number; month: number | null }) {
  const store = useAdminStore();
  const [subView, setSubView] = useState<"mensualidades" | "otros">("mensualidades");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const emptyForm = () => ({ name: "", category: "other" as OtherIncomeCategory, description: "", amount: "", movementDate: new Date().toISOString().split("T")[0], method: "transfer" as PaymentMethod, reference: "" });
  const [form, setForm] = useState(emptyForm());

  const monthlyItems = useMemo(() => {
    return getVerifiedMonthlyIncome(store.transfers, year, month ?? undefined)
      .sort((a, b) => (b.verifiedAt ?? b.createdAt).localeCompare(a.verifiedAt ?? a.createdAt));
  }, [store.transfers, year, month]);

  const otherItems = useMemo(() => {
    const arr: OtherFinancialMovement[] = [];
    if (month !== null) {
      arr.push(...getOtherIncomeByMonth(store.otherMovements, year, month));
    } else {
      for (let m = 1; m <= 12; m++) arr.push(...getOtherIncomeByMonth(store.otherMovements, year, m));
    }
    return arr.sort((a, b) => b.movementDate.localeCompare(a.movementDate));
  }, [store.otherMovements, year, month]);

  function handleSave() {
    const amount = parseFloat(form.amount);
    if (!form.name || isNaN(amount)) return;
    const data = { type: "other_income" as const, name: form.name, category: form.category, description: form.description || undefined, amount, movementDate: form.movementDate, method: form.method, reference: form.reference || undefined };
    if (editId) {
      store.updateOtherMovement(editId, data);
      setEditId(null);
    } else {
      store.addOtherMovement(data);
    }
    setForm(emptyForm());
    setShowForm(false);
  }

  function startEdit(m: OtherFinancialMovement) {
    setEditId(m.id);
    setForm({ name: m.name, category: (m.category ?? "other") as OtherIncomeCategory, description: m.description ?? "", amount: String(m.amount), movementDate: m.movementDate, method: (m.method ?? "transfer") as PaymentMethod, reference: m.reference ?? "" });
    setSubView("otros");
    setShowForm(true);
  }

  const monthlyTotal = monthlyItems.reduce((s, t) => s + t.amount, 0);
  const otherTotal   = otherItems.reduce((s, m) => s + m.amount, 0);

  const incomeForm = (
    <div className="rounded-[var(--radius-surface)] p-4 mb-4 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] space-y-3">
      <p className="text-[11px] font-semibold text-[var(--text-primary)]">{editId ? "Editar ingreso" : "Nuevo ingreso"}</p>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={S.label}>Concepto *</label><input className={S.input} value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} /></div>
        <div>
          <label className={S.label}>Categoría</label>
          <select className={S.input} value={form.category} onChange={(e) => setForm((v) => ({ ...v, category: e.target.value as OtherIncomeCategory }))}>
            {OTHER_INCOME_CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div><label className={S.label}>Monto (MXN) *</label><input className={S.input} type="number" value={form.amount} onChange={(e) => setForm((v) => ({ ...v, amount: e.target.value }))} /></div>
        <div><label className={S.label}>Fecha</label><input className={S.input} type="date" value={form.movementDate} onChange={(e) => setForm((v) => ({ ...v, movementDate: e.target.value }))} /></div>
        <div>
          <label className={S.label}>Método de pago</label>
          <select className={S.input} value={form.method} onChange={(e) => setForm((v) => ({ ...v, method: e.target.value as PaymentMethod }))}>
            {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div><label className={S.label}>Referencia</label><input className={S.input} value={form.reference} onChange={(e) => setForm((v) => ({ ...v, reference: e.target.value }))} /></div>
        <div className="col-span-2"><label className={S.label}>Descripción</label><input className={S.input} value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} /></div>
      </div>
      <div className="flex gap-2">
        <button className={S.btnPrimary} onClick={handleSave}>Guardar</button>
        <button className={S.btnGhost} onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}>Cancelar</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Chip label="Mensualidades" active={subView === "mensualidades"} onClick={() => setSubView("mensualidades")} />
          <Chip label="Otros ingresos" active={subView === "otros"} onClick={() => setSubView("otros")} />
        </div>
        {subView === "otros" && (
          <button className={S.btnGhost} onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm()); }}>
            {showForm && !editId ? "Cancelar" : "+ Nuevo ingreso"}
          </button>
        )}
      </div>

      {subView === "mensualidades" && (
        <>
          <p className="text-[11px] text-[var(--text-muted)]">
            Mensualidades confirmadas · Total: <span className="font-semibold text-[var(--accent)]">{fmt(monthlyTotal)}</span>
          </p>
          <TableWrap>
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                {["Fecha", "Cliente", "N° cliente", "Periodo", "Referencia", "Monto"].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {monthlyItems.length === 0 && <EmptyRow cols={6} />}
              {monthlyItems.map((t) => {
                const client = store.clients.find((c) => c.id === (t.clientId ?? t.specialistId));
                return (
                  <tr key={t.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]">
                    <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{fmtDate(t.verifiedAt ? t.verifiedAt.split("T")[0] : t.transferDate)}</td>
                    <td className="px-4 py-2.5 text-[var(--text-primary)]">{client?.business.name ?? t.prospectiveBusinessName ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[var(--accent)] text-[10px]">{t.clientNumber ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[var(--text-muted)]">{t.paymentMonth ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{t.referenceNumber}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--text-primary)]">{fmt(t.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </>
      )}

      {subView === "otros" && (
        <>
          {(showForm || editId) && incomeForm}
          <p className="text-[11px] text-[var(--text-muted)]">
            Otros ingresos · Total: <span className="font-semibold text-[var(--accent)]">{fmt(otherTotal)}</span>
          </p>
          <TableWrap>
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                {["Fecha", "Concepto", "Categoría", "Descripción", "Método", "Referencia", "Monto", ""].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {otherItems.length === 0 && <EmptyRow cols={8} />}
              {otherItems.map((m) => (
                <tr key={m.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{fmtDate(m.movementDate)}</td>
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{m.name}</td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">{OTHER_INCOME_CATS.find((c) => c.value === m.category)?.label ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)] max-w-[140px]"><p className="truncate">{m.description ?? "—"}</p></td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">{METHOD_OPTIONS.find((o) => o.value === m.method)?.label ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{m.reference ?? "—"}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--accent)]">{fmt(m.amount)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]" onClick={() => startEdit(m)}>Editar</button>
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => store.deleteOtherMovement(m.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </>
      )}
    </div>
  );
}

// ── Tab: Comisiones ───────────────────────────────────────────────────────────

interface PayModal {
  ids: string[];
  sellerName: string;
  total: number;
  step: 1 | 2;
  paidAt: string;
  method: PaymentMethod;
  reference: string;
  note: string;
  confirmed: boolean;
}

export function ComisionesTab({ year, month }: { year: number; month: number | null }) {
  const store = useAdminStore();
  const [filterStatus, setFilterStatus] = useState<"pending" | "paid" | "all">("pending");
  const [filterSeller, setFilterSeller] = useState<string>("all");
  const [payModal, setPayModal] = useState<PayModal | null>(null);
  const [expandedSeller, setExpandedSeller] = useState<string | null>(null);

  const allCommissions = useMemo(() => {
    return store.commissions.filter((c) => {
      const d = new Date(c.paidAt ?? c.authorizedAt ?? c.generatedAt);
      if (d.getFullYear() !== year) return false;
      if (month !== null && d.getMonth() + 1 !== month) return false;
      return true;
    });
  }, [store.commissions, year, month]);

  const filtered = useMemo(() => {
    let r = allCommissions;
    if (filterStatus === "pending") r = r.filter((c) => c.status === "authorized");
    else if (filterStatus === "paid") r = r.filter((c) => c.status === "paid");
    if (filterSeller !== "all") r = r.filter((c) => c.salesRepId === filterSeller);
    return r.sort((a, b) => (b.paidAt ?? b.authorizedAt ?? b.generatedAt).localeCompare(a.paidAt ?? a.authorizedAt ?? a.generatedAt));
  }, [allCommissions, filterStatus, filterSeller]);

  // Group by seller
  const bySeller = useMemo(() => {
    const map = new Map<string, { rep: typeof store.salesReps[0] | undefined; items: typeof filtered }>();
    for (const c of filtered) {
      if (!map.has(c.salesRepId)) {
        map.set(c.salesRepId, { rep: store.salesReps.find((r) => r.id === c.salesRepId), items: [] });
      }
      map.get(c.salesRepId)!.items.push(c);
    }
    return [...map.entries()].sort((a, b) => {
      const aName = a[1].rep?.name ?? a[1].items[0]?.sellerNumber ?? "";
      const bName = b[1].rep?.name ?? b[1].items[0]?.sellerNumber ?? "";
      return aName.localeCompare(bName);
    });
  }, [filtered, store.salesReps]);

  const sellers = useMemo(() => {
    const ids = new Set(allCommissions.map((c) => c.salesRepId));
    return [...ids].map((id) => ({ id, rep: store.salesReps.find((r) => r.id === id), num: allCommissions.find((c) => c.salesRepId === id)?.sellerNumber ?? "" }));
  }, [allCommissions, store.salesReps]);

  const pendingTotal = allCommissions.filter((c) => c.status === "authorized").reduce((s, c) => s + c.amount, 0);
  const paidTotal    = allCommissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);

  function openPayModal(ids: string[], sellerName: string, total: number) {
    setPayModal({ ids, sellerName, total, step: 1, paidAt: new Date().toISOString().split("T")[0], method: "transfer", reference: "", note: "", confirmed: false });
  }

  function confirmPay() {
    if (!payModal || !payModal.confirmed) return;
    setPayModal((p) => p ? { ...p, step: 2 } : null);
  }

  function finalizePay() {
    if (!payModal) return;
    store.markCommissionsPaid(payModal.ids, { paidAt: payModal.paidAt, method: payModal.method, reference: payModal.reference || undefined, note: payModal.note || undefined });
    setPayModal(null);
  }

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="flex items-center gap-3 flex-wrap text-[11px] text-[var(--text-muted)]">
        {pendingTotal > 0 && <span>Por pagar: <span className="font-semibold text-[var(--danger)]">{fmt(pendingTotal)}</span></span>}
        {paidTotal > 0 && <span>Pagado: <span className="font-semibold text-[var(--accent)]">{fmt(paidTotal)}</span></span>}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Chip label="Pendientes" active={filterStatus === "pending"} onClick={() => setFilterStatus("pending")} />
        <Chip label="Pagadas"    active={filterStatus === "paid"}    onClick={() => setFilterStatus("paid")} />
        <Chip label="Todas"      active={filterStatus === "all"}     onClick={() => setFilterStatus("all")} />
        <div className="w-px h-4 bg-[var(--border)]" />
        <Chip label="Todos los vendedores" active={filterSeller === "all"} onClick={() => setFilterSeller("all")} />
        {sellers.map((s) => (
          <Chip key={s.id} label={s.rep?.name ?? s.num} active={filterSeller === s.id} onClick={() => setFilterSeller(s.id)} />
        ))}
      </div>

      {/* By seller */}
      {bySeller.length === 0 && (
        <p className="text-xs text-[var(--text-muted)] text-center py-10">Sin comisiones para este filtro.</p>
      )}
      <div className="space-y-3">
        {bySeller.map(([sellerId, { rep, items }]) => {
          const pending = items.filter((c) => c.status === "authorized");
          const sellerName = rep?.name ?? items[0]?.sellerNumber ?? "—";
          const sellerNum  = items[0]?.sellerNumber ?? "—";
          const pendingAmt = pending.reduce((s, c) => s + c.amount, 0);
          const isExpanded = expandedSeller === sellerId;

          return (
            <div key={sellerId} className="rounded-[var(--radius-surface)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              {/* Seller header */}
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors" onClick={() => setExpandedSeller(isExpanded ? null : sellerId)}>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-[var(--text-primary)] text-sm">{sellerName}</p>
                    <p className="text-[10px] font-mono text-[var(--accent)]">{sellerNum}</p>
                  </div>
                  {pendingAmt > 0 && (
                    <span className="text-[11px] font-semibold text-[var(--danger)]">{fmt(pendingAmt)} pendiente</span>
                  )}
                  <span className="text-[10px] text-[var(--text-muted)]">{items.length} comisión{items.length !== 1 ? "es" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  {pending.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openPayModal(pending.map((c) => c.id), sellerName, pendingAmt); }}
                      className={`${S.btnAccent} !text-[10px] !px-2.5 !py-1`}
                    >
                      Pagar {fmt(pendingAmt)}
                    </button>
                  )}
                  <span className="text-[var(--text-muted)] text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Detail */}
              {isExpanded && (
                <div className="border-t-[0.5px] border-[var(--border)]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-[0.5px] border-[var(--border)]">
                        {["Cliente", "N° cliente", "Fecha", "Monto venta", "Comisión", "Estado", "Fecha pago", ""].map((h) => <TH key={h}>{h}</TH>)}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((c) => (
                        <tr key={c.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]">
                          <td className="px-4 py-2.5 text-[var(--text-primary)]">{c.businessName}</td>
                          <td className="px-4 py-2.5 font-mono text-[10px] text-[var(--accent)]">{c.clientNumber}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{fmtDate((c.authorizedAt ?? c.generatedAt).split("T")[0])}</td>
                          <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">—</td>
                          <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--text-primary)]">{fmt(c.amount)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-medium ${c.status === "paid" ? "text-[var(--accent)]" : c.status === "authorized" ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
                              {c.status === "paid" ? "Pagada" : c.status === "authorized" ? "Pendiente de pago" : c.status === "cancelled" ? "Cancelada" : c.status === "waiting_first_monthly_payment" ? "Esperando 1ª mensualidad" : c.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{c.paidAt ? fmtDate(c.paidAt.split("T")[0]) : "—"}</td>
                          <td className="px-4 py-2.5">
                            {c.status === "authorized" && (
                              <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]"
                                onClick={() => openPayModal([c.id], sellerName, c.amount)}>
                                Pagar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly history matrix */}
      <div>
        <SectionTitle>Historial mensual por vendedor</SectionTitle>
        <TableWrap>
          <thead>
            <tr className="border-b-[0.5px] border-[var(--border)]">
              <TH>Vendedor</TH>
              {MONTH_NAMES.map((m) => <TH key={m}>{m.slice(0, 3)}</TH>)}
              <TH>Pendiente</TH>
            </tr>
          </thead>
          <tbody>
            {store.salesReps.map((rep) => {
              const repComms = store.commissions.filter((c) => c.salesRepId === rep.id && new Date(c.paidAt ?? c.authorizedAt ?? c.generatedAt).getFullYear() === year);
              const byMonth = MONTH_NAMES.map((_, i) => repComms.filter((c) => { const d = new Date(c.paidAt ?? c.authorizedAt ?? c.generatedAt); return d.getMonth() === i; }).reduce((s, c) => s + c.amount, 0));
              const pending = repComms.filter((c) => c.status === "authorized").reduce((s, c) => s + c.amount, 0);
              if (repComms.length === 0) return null;
              return (
                <tr key={rep.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-[var(--text-primary)]">{rep.name}</p>
                    <p className="text-[10px] font-mono text-[var(--accent)]">{rep.sellerNumber}</p>
                  </td>
                  {byMonth.map((amt, i) => (
                    <td key={i} className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{amt > 0 ? fmt(amt) : "—"}</td>
                  ))}
                  <td className="px-4 py-2.5 tabular-nums font-semibold text-[var(--danger)]">{pending > 0 ? fmt(pending) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </div>

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] shadow-[0_1px_3px_rgba(0,0,0,.35)] overflow-hidden">
            <div className="px-5 py-4 border-b-[0.5px] border-[var(--border)]">
              <p className="font-semibold text-[var(--text-primary)]">
                {payModal.step === 1 ? "Registrar pago de comisión" : "Confirmar pago definitivo"}
              </p>
            </div>
            <div className="p-5 space-y-4">
              {payModal.step === 1 ? (
                <>
                  <p className="text-sm text-[var(--text-primary)]">
                    Vas a registrar el pago de <span className="font-bold text-[var(--accent)]">{fmt(payModal.total)}</span> a <span className="font-medium">{payModal.sellerName}</span>.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={S.label}>Fecha de pago</label><input className={S.input} type="date" value={payModal.paidAt} onChange={(e) => setPayModal((p) => p ? { ...p, paidAt: e.target.value } : null)} /></div>
                    <div>
                      <label className={S.label}>Método</label>
                      <select className={S.input} value={payModal.method} onChange={(e) => setPayModal((p) => p ? { ...p, method: e.target.value as PaymentMethod } : null)}>
                        {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div><label className={S.label}>Referencia o folio</label><input className={S.input} value={payModal.reference} onChange={(e) => setPayModal((p) => p ? { ...p, reference: e.target.value } : null)} /></div>
                    <div><label className={S.label}>Nota</label><input className={S.input} value={payModal.note} onChange={(e) => setPayModal((p) => p ? { ...p, note: e.target.value } : null)} /></div>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={payModal.confirmed} onChange={(e) => setPayModal((p) => p ? { ...p, confirmed: e.target.checked } : null)} className="mt-0.5" />
                    <span className="text-xs text-[var(--text-primary)]">Confirmo que la transferencia al vendedor ya fue realizada.</span>
                  </label>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-primary)]">
                    ¿Confirmas definitivamente este pago?<br />
                    Esta acción moverá las comisiones al historial.
                  </p>
                  <div className="rounded-[var(--radius-control)] px-4 py-3 bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
                    <p>Vendedor: <span className="font-medium text-[var(--text-primary)]">{payModal.sellerName}</span></p>
                    <p>Monto: <span className="font-semibold text-[var(--accent)]">{fmt(payModal.total)}</span></p>
                    <p>Fecha: {payModal.paidAt} · {METHOD_OPTIONS.find((o) => o.value === payModal.method)?.label}</p>
                    {payModal.reference && <p>Referencia: {payModal.reference}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t-[0.5px] border-[var(--border)] flex justify-end gap-2">
              <button className={S.btnGhost} onClick={() => setPayModal(null)}>Cancelar</button>
              {payModal.step === 1 ? (
                <button className={S.btnPrimary} onClick={confirmPay} disabled={!payModal.confirmed} style={{ opacity: payModal.confirmed ? 1 : 0.4 }}>
                  Continuar
                </button>
              ) : (
                <button className={S.btnPrimary} onClick={finalizePay}>Confirmar pago</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Gastos ───────────────────────────────────────────────────────────────

function GastosTab({ year, month }: { year: number; month: number | null }) {
  const store = useAdminStore();
  const [subView, setSubView] = useState<"fijos" | "egresos">("fijos");

  // ── Fixed expenses ────────────────────────────────────────────────────────
  const [showFixedForm, setShowFixedForm] = useState(false);
  const [editFixedId, setEditFixedId] = useState<string | null>(null);
  const emptyFixed = () => ({ name: "", category: "", description: "", amount: "", frequency: "monthly" as FixedExpenseFrequency, nextDueDate: "", startDate: new Date().toISOString().split("T")[0] });
  const [fixedForm, setFixedForm] = useState(emptyFixed());
  const [payingFixed, setPayingFixed] = useState<string | null>(null);
  const emptyPay = () => ({ paidAt: new Date().toISOString().split("T")[0], amount: "", method: "transfer" as PaymentMethod, reference: "", note: "" });
  const [payForm, setPayForm] = useState(emptyPay());

  const activeMonth = month ?? new Date().getMonth() + 1;
  const fixedForMonth = useMemo(
    () => store.fixedExpenses.filter((e) => expenseAppliesToMonth(e, year, activeMonth)),
    [store.fixedExpenses, year, activeMonth]
  );
  const fixedTotal = fixedForMonth.reduce((s, e) => s + e.amount, 0);

  function handleSaveFixed() {
    const amount = parseFloat(fixedForm.amount);
    if (!fixedForm.name || isNaN(amount)) return;
    const data = { name: fixedForm.name, category: fixedForm.category || undefined, description: fixedForm.description || undefined, amount, frequency: fixedForm.frequency, status: "pending" as FixedExpenseStatus, nextDueDate: fixedForm.nextDueDate || undefined, active: true, startDate: fixedForm.startDate };
    if (editFixedId) {
      store.updateFixedExpense(editFixedId, data);
      setEditFixedId(null);
    } else {
      store.addFixedExpense(data);
    }
    setFixedForm(emptyFixed());
    setShowFixedForm(false);
  }

  function startEditFixed(e: MonthlyFixedExpense) {
    setEditFixedId(e.id);
    setFixedForm({ name: e.name, category: e.category ?? "", description: e.description ?? "", amount: String(e.amount), frequency: e.frequency, nextDueDate: e.nextDueDate ?? "", startDate: e.startDate });
    setShowFixedForm(true);
  }

  function handleMarkPaid(id: string) {
    const amount = parseFloat(payForm.amount);
    if (isNaN(amount)) return;
    store.markFixedExpensePaid(id, { paidAt: payForm.paidAt, amount, method: payForm.method, reference: payForm.reference || undefined, note: payForm.note || undefined });
    setPayingFixed(null);
    setPayForm(emptyPay());
  }

  // ── Egresos ───────────────────────────────────────────────────────────────
  const [showEgresoForm, setShowEgresoForm] = useState(false);
  const [editEgresoId, setEditEgresoId] = useState<string | null>(null);
  const emptyEgreso = () => ({ name: "", category: "other" as OtherExpenseCategory, description: "", amount: "", movementDate: new Date().toISOString().split("T")[0], method: "transfer" as PaymentMethod, reference: "" });
  const [egresoForm, setEgresoForm] = useState(emptyEgreso());

  const otherExpItems = useMemo(() => {
    const arr: OtherFinancialMovement[] = [];
    if (month !== null) {
      arr.push(...getOtherExpensesByMonth(store.otherMovements, year, month));
    } else {
      for (let m = 1; m <= 12; m++) arr.push(...getOtherExpensesByMonth(store.otherMovements, year, m));
    }
    return arr.sort((a, b) => b.movementDate.localeCompare(a.movementDate));
  }, [store.otherMovements, year, month]);
  const egresoTotal = otherExpItems.reduce((s, m) => s + m.amount, 0);

  function handleSaveEgreso() {
    const amount = parseFloat(egresoForm.amount);
    if (!egresoForm.name || isNaN(amount)) return;
    const data = { type: "other_expense" as const, name: egresoForm.name, category: egresoForm.category, description: egresoForm.description || undefined, amount, movementDate: egresoForm.movementDate, method: egresoForm.method, reference: egresoForm.reference || undefined };
    if (editEgresoId) {
      store.updateOtherMovement(editEgresoId, data);
      setEditEgresoId(null);
    } else {
      store.addOtherMovement(data);
    }
    setEgresoForm(emptyEgreso());
    setShowEgresoForm(false);
  }

  function startEditEgreso(m: OtherFinancialMovement) {
    setEditEgresoId(m.id);
    setEgresoForm({ name: m.name, category: (m.category ?? "other") as OtherExpenseCategory, description: m.description ?? "", amount: String(m.amount), movementDate: m.movementDate, method: (m.method ?? "transfer") as PaymentMethod, reference: m.reference ?? "" });
    setSubView("egresos");
    setShowEgresoForm(true);
  }

  const fixedForm2 = (
    <div className="rounded-[var(--radius-surface)] p-4 mb-4 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] space-y-3">
      <p className="text-[11px] font-semibold text-[var(--text-primary)]">{editFixedId ? "Editar gasto fijo" : "Nuevo gasto fijo"}</p>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={S.label}>Nombre *</label><input className={S.input} value={fixedForm.name} onChange={(e) => setFixedForm((v) => ({ ...v, name: e.target.value }))} /></div>
        <div><label className={S.label}>Categoría</label><input className={S.input} value={fixedForm.category} onChange={(e) => setFixedForm((v) => ({ ...v, category: e.target.value }))} placeholder="Ej. Tecnología" /></div>
        <div><label className={S.label}>Monto (MXN) *</label><input className={S.input} type="number" value={fixedForm.amount} onChange={(e) => setFixedForm((v) => ({ ...v, amount: e.target.value }))} /></div>
        <div>
          <label className={S.label}>Periodicidad</label>
          <select className={S.input} value={fixedForm.frequency} onChange={(e) => setFixedForm((v) => ({ ...v, frequency: e.target.value as FixedExpenseFrequency }))}>
            {FREQ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div><label className={S.label}>Próx. fecha de pago</label><input className={S.input} type="date" value={fixedForm.nextDueDate} onChange={(e) => setFixedForm((v) => ({ ...v, nextDueDate: e.target.value }))} /></div>
        <div><label className={S.label}>Inicio</label><input className={S.input} type="date" value={fixedForm.startDate} onChange={(e) => setFixedForm((v) => ({ ...v, startDate: e.target.value }))} /></div>
        <div className="col-span-2"><label className={S.label}>Descripción</label><input className={S.input} value={fixedForm.description} onChange={(e) => setFixedForm((v) => ({ ...v, description: e.target.value }))} /></div>
      </div>
      <div className="flex gap-2">
        <button className={S.btnPrimary} onClick={handleSaveFixed}>Guardar</button>
        <button className={S.btnGhost} onClick={() => { setShowFixedForm(false); setEditFixedId(null); setFixedForm(emptyFixed()); }}>Cancelar</button>
      </div>
    </div>
  );

  const egresoFormEl = (
    <div className="rounded-[var(--radius-surface)] p-4 mb-4 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] space-y-3">
      <p className="text-[11px] font-semibold text-[var(--text-primary)]">{editEgresoId ? "Editar egreso" : "Nuevo egreso"}</p>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={S.label}>Concepto *</label><input className={S.input} value={egresoForm.name} onChange={(e) => setEgresoForm((v) => ({ ...v, name: e.target.value }))} /></div>
        <div>
          <label className={S.label}>Categoría</label>
          <select className={S.input} value={egresoForm.category} onChange={(e) => setEgresoForm((v) => ({ ...v, category: e.target.value as OtherExpenseCategory }))}>
            {OTHER_EXPENSE_CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div><label className={S.label}>Monto (MXN) *</label><input className={S.input} type="number" value={egresoForm.amount} onChange={(e) => setEgresoForm((v) => ({ ...v, amount: e.target.value }))} /></div>
        <div><label className={S.label}>Fecha</label><input className={S.input} type="date" value={egresoForm.movementDate} onChange={(e) => setEgresoForm((v) => ({ ...v, movementDate: e.target.value }))} /></div>
        <div>
          <label className={S.label}>Método</label>
          <select className={S.input} value={egresoForm.method} onChange={(e) => setEgresoForm((v) => ({ ...v, method: e.target.value as PaymentMethod }))}>
            {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div><label className={S.label}>Referencia</label><input className={S.input} value={egresoForm.reference} onChange={(e) => setEgresoForm((v) => ({ ...v, reference: e.target.value }))} /></div>
        <div className="col-span-2"><label className={S.label}>Descripción</label><input className={S.input} value={egresoForm.description} onChange={(e) => setEgresoForm((v) => ({ ...v, description: e.target.value }))} /></div>
      </div>
      <div className="flex gap-2">
        <button className={S.btnPrimary} onClick={handleSaveEgreso}>Guardar</button>
        <button className={S.btnGhost} onClick={() => { setShowEgresoForm(false); setEditEgresoId(null); setEgresoForm(emptyEgreso()); }}>Cancelar</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Chip label="Gastos fijos" active={subView === "fijos"} onClick={() => setSubView("fijos")} />
          <Chip label="Egresos" active={subView === "egresos"} onClick={() => setSubView("egresos")} />
        </div>
        {subView === "fijos" && (
          <button className={S.btnGhost} onClick={() => { setShowFixedForm((v) => !v); setEditFixedId(null); setFixedForm(emptyFixed()); }}>
            {showFixedForm && !editFixedId ? "Cancelar" : "+ Nuevo gasto fijo"}
          </button>
        )}
        {subView === "egresos" && (
          <button className={S.btnGhost} onClick={() => { setShowEgresoForm((v) => !v); setEditEgresoId(null); setEgresoForm(emptyEgreso()); }}>
            {showEgresoForm && !editEgresoId ? "Cancelar" : "+ Nuevo egreso"}
          </button>
        )}
      </div>

      {subView === "fijos" && (
        <div className="space-y-3">
          {(showFixedForm || editFixedId) && fixedForm2}
          <p className="text-[11px] text-[var(--text-muted)]">
            {month !== null ? `${MONTH_NAMES[month - 1]} ${year}` : String(year)} · Total: <span className="font-semibold text-[var(--danger)]">{fmt(fixedTotal)}</span>
          </p>
          <TableWrap>
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                {["Nombre", "Categoría", "Monto", "Periodicidad", "Próx. pago", "Estado", ""].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {store.fixedExpenses.length === 0 && <EmptyRow cols={7} />}
              {store.fixedExpenses.map((e) => {
                const isPaying = payingFixed === e.id;
                return (
                  <>
                    <tr key={e.id} className={`border-b-[0.5px] border-[var(--border)] ${!e.active ? "opacity-50" : ""} hover:bg-[var(--bg-elevated)]`}>
                      <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{e.name}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{e.category ?? "—"}</td>
                      <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--danger)]">{fmt(e.amount)}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{FREQ_LABELS[e.frequency]}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)] whitespace-nowrap">{e.nextDueDate ? fmtDate(e.nextDueDate) : "—"}</td>
                      <td className="px-4 py-2.5"><StatusDot status={e.status} /></td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex gap-2">
                          {e.status !== "paid" && e.active && (
                            <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]" onClick={() => { setPayingFixed(isPaying ? null : e.id); setPayForm({ ...emptyPay(), amount: String(e.amount) }); }}>
                              {isPaying ? "Cancelar" : "Marcar pagado"}
                            </button>
                          )}
                          <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]" onClick={() => startEditFixed(e)}>Editar</button>
                          <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => store.toggleFixedExpense(e.id)}>{e.active ? "Pausar" : "Activar"}</button>
                          <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => store.deleteFixedExpense(e.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                    {isPaying && (
                      <tr key={`pay-${e.id}`} className="border-b-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)]">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid grid-cols-4 gap-3 mb-2">
                            <div><label className={S.label}>Fecha de pago</label><input className={S.input} type="date" value={payForm.paidAt} onChange={(e) => setPayForm((v) => ({ ...v, paidAt: e.target.value }))} /></div>
                            <div><label className={S.label}>Monto pagado</label><input className={S.input} type="number" value={payForm.amount} onChange={(e) => setPayForm((v) => ({ ...v, amount: e.target.value }))} /></div>
                            <div>
                              <label className={S.label}>Método</label>
                              <select className={S.input} value={payForm.method} onChange={(e) => setPayForm((v) => ({ ...v, method: e.target.value as PaymentMethod }))}>
                                {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </div>
                            <div><label className={S.label}>Referencia</label><input className={S.input} value={payForm.reference} onChange={(e) => setPayForm((v) => ({ ...v, reference: e.target.value }))} /></div>
                          </div>
                          <button className={`${S.btnPrimary} !text-xs !px-3 !py-1.5`} onClick={() => handleMarkPaid(e.id)}>Confirmar pago</button>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </TableWrap>
        </div>
      )}

      {subView === "egresos" && (
        <div className="space-y-3">
          {(showEgresoForm || editEgresoId) && egresoFormEl}
          <p className="text-[11px] text-[var(--text-muted)]">
            Egresos no recurrentes · Total: <span className="font-semibold text-[var(--danger)]">{fmt(egresoTotal)}</span>
          </p>
          <TableWrap>
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                {["Fecha", "Concepto", "Categoría", "Descripción", "Método", "Referencia", "Monto", ""].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {otherExpItems.length === 0 && <EmptyRow cols={8} />}
              {otherExpItems.map((m) => (
                <tr key={m.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{fmtDate(m.movementDate)}</td>
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{m.name}</td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">{OTHER_EXPENSE_CATS.find((c) => c.value === m.category)?.label ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)] max-w-[140px]"><p className="truncate">{m.description ?? "—"}</p></td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">{METHOD_OPTIONS.find((o) => o.value === m.method)?.label ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{m.reference ?? "—"}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--danger)]">{fmt(m.amount)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]" onClick={() => startEditEgreso(m)}>Editar</button>
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => store.deleteOtherMovement(m.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}
    </div>
  );
}

// ── Tab: Impuestos ────────────────────────────────────────────────────────────

function ImpuestosTab({ year }: { year: number }) {
  const store = useAdminStore();
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ percentage: "16", notes: "" });
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ amount: "", paidAt: "" });

  function startEdit(month: number) {
    const rec = store.taxRecords.find((t) => t.year === year && t.month === month);
    setEditForm({ percentage: String(rec?.taxPercentage ?? 16), notes: rec?.notes ?? "" });
    setEditingMonth(month);
  }

  function saveEdit(month: number) {
    const pct = parseFloat(editForm.percentage);
    if (isNaN(pct)) return;
    const monthly = getVerifiedMonthlyIncome(store.transfers, year, month).reduce((s, t) => s + t.amount, 0);
    const otherInc = getOtherIncomeByMonth(store.otherMovements, year, month).reduce((s, m) => s + m.amount, 0);
    const comms = getPaidCommissions(store.commissions, year, month).reduce((s, c) => s + c.amount, 0);
    const fixed = getFixedExpensesTotalByMonth(store.fixedExpenses, year, month);
    const otherExp = getOtherExpensesByMonth(store.otherMovements, year, month).reduce((s, m) => s + m.amount, 0);
    const base = Math.max(0, monthly + otherInc - comms - fixed - otherExp);
    const est = parseFloat(((base * pct) / 100).toFixed(2));
    store.upsertTaxRecord(year, month, { taxPercentage: pct, taxableBase: base, estimatedTaxAmount: est, notes: editForm.notes || undefined });
    setEditingMonth(null);
  }

  function startPay(id: string) {
    const rec = store.taxRecords.find((t) => t.id === id);
    setPayForm({ amount: String(rec?.estimatedTaxAmount ?? ""), paidAt: new Date().toISOString().split("T")[0] });
    setPayingId(id);
  }

  function savePay() {
    if (!payingId) return;
    const amount = parseFloat(payForm.amount);
    if (isNaN(amount)) return;
    store.markTaxPaid(payingId, amount, payForm.paidAt);
    setPayingId(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-[var(--text-muted)] italic">
        Estimación y control administrativo. No sustituye cálculo contable o fiscal.
      </p>
      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Mes", "Base imponible", "% Est.", "Impuesto est.", "Pagado real", "Fecha pago", "Estado", ""].map((h) => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {MONTH_NAMES.map((name, i) => {
            const month = i + 1;
            const rec = store.taxRecords.find((t) => t.year === year && t.month === month);
            const isEditing = editingMonth === month;
            const isPaying = payingId === rec?.id;
            const status = rec ? (rec.actualPaidAmount !== undefined ? "paid" : "pending") : "none";
            return (
              <tr key={month} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]">
                <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{name}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{rec ? fmt(rec.taxableBase) : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">
                  {isEditing ? <input className={`${S.input} w-16 !py-0.5`} value={editForm.percentage} onChange={(e) => setEditForm((v) => ({ ...v, percentage: e.target.value }))} /> : rec ? `${rec.taxPercentage}%` : "—"}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-primary)]">{rec ? fmt(rec.estimatedTaxAmount) : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums font-semibold">
                  {isPaying ? <input className={`${S.input} w-24 !py-0.5`} value={payForm.amount} onChange={(e) => setPayForm((v) => ({ ...v, amount: e.target.value }))} /> : rec?.actualPaidAmount !== undefined ? <span className="text-[var(--accent)]">{fmt(rec.actualPaidAmount)}</span> : "—"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">
                  {isPaying ? <input className={`${S.input} !py-0.5`} type="date" value={payForm.paidAt} onChange={(e) => setPayForm((v) => ({ ...v, paidAt: e.target.value }))} /> : rec?.paidAt ? fmtDate(rec.paidAt) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  {status === "paid" && <span className="text-[10px] font-medium text-[var(--accent)]">Pagado</span>}
                  {status === "pending" && <span className="text-[10px] font-medium text-[var(--text-muted)]">Pendiente</span>}
                  {status === "none" && <span className="text-[10px] text-[var(--border)]">Sin registro</span>}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={() => saveEdit(month)}>Guardar</button>
                      <button className="text-[10px] text-[var(--text-muted)] hover:underline" onClick={() => setEditingMonth(null)}>Cancelar</button>
                    </div>
                  ) : isPaying ? (
                    <div className="flex gap-2">
                      <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={savePay}>Confirmar</button>
                      <button className="text-[10px] text-[var(--text-muted)] hover:underline" onClick={() => setPayingId(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]" onClick={() => startEdit(month)}>{rec ? "Editar" : "Registrar"}</button>
                      {rec && status !== "paid" && <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]" onClick={() => startPay(rec.id)}>Marcar pagado</button>}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}

// ── Tab: Facturación ──────────────────────────────────────────────────────────

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  not_required: "No requerida",
  pending:      "Pendiente",
  issued:       "Emitida",
  cancelled:    "Cancelada",
};

function FacturacionTab({ year, month }: { year: number; month: number | null }) {
  const store = useAdminStore();
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");

  const items = useMemo(() => {
    let result = store.invoices.filter((inv) => {
      const d = new Date((inv.issuedAt ?? inv.cancelledAt ?? inv.createdAt) + (inv.issuedAt?.length === 10 ? "T00:00:00" : ""));
      if (d.getFullYear() !== year) return false;
      if (month !== null && d.getMonth() + 1 !== month) return false;
      return true;
    });
    if (filterStatus !== "all") result = result.filter((i) => i.status === filterStatus);
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [store.invoices, year, month, filterStatus]);

  function updateStatus(id: string, status: InvoiceStatus) {
    const now = new Date().toISOString().split("T")[0];
    if (status === "issued") store.updateInvoice(id, { status, issuedAt: now });
    else if (status === "cancelled") store.updateInvoice(id, { status, cancelledAt: now });
    else store.updateInvoice(id, { status });
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-[var(--text-muted)]">Seguimiento interno. No genera CFDI automáticamente.</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {(["all", "pending", "issued", "cancelled", "not_required"] as const).map((k) => (
          <Chip key={k} label={k === "all" ? "Todas" : INVOICE_STATUS_LABELS[k]} active={filterStatus === k} onClick={() => setFilterStatus(k)} />
        ))}
      </div>
      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Cliente", "N° factura", "Monto", "Estado", "Fecha", "Notas", ""].map((h) => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && <EmptyRow cols={7} />}
          {items.map((inv) => {
            const client = store.clients.find((c) => c.id === inv.clientId);
            return (
              <tr key={inv.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]">
                <td className="px-4 py-2.5">
                  <p className="text-[var(--text-primary)]">{client?.business.name ?? inv.clientId}</p>
                  <p className="font-mono text-[10px] text-[var(--accent)]">{client?.clientNumber ?? "—"}</p>
                </td>
                <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{inv.invoiceNumber ?? "—"}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--text-primary)]">{inv.invoicedAmount !== undefined ? fmt(inv.invoicedAmount) : "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] font-medium ${inv.status === "issued" ? "text-[var(--accent)]" : inv.status === "cancelled" ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)] text-[10px]">{fmtDate((inv.issuedAt ?? inv.cancelledAt ?? inv.createdAt.split("T")[0]))}</td>
                <td className="px-4 py-2.5 text-[var(--text-muted)] max-w-[160px]"><p className="truncate">{inv.notes ?? "—"}</p></td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {inv.status === "pending" && (
                    <div className="flex gap-2">
                      <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={() => updateStatus(inv.id, "issued")}>Emitir</button>
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => updateStatus(inv.id, "cancelled")}>Cancelar</button>
                    </div>
                  )}
                  {inv.status === "issued" && (
                    <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => updateStatus(inv.id, "cancelled")}>Cancelar</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}

// ── Tab: Configuración ────────────────────────────────────────────────────────

function ConfiguracionTab() {
  const store = useAdminStore();
  const [saved, setSaved] = useState(false);
  const empty: Omit<BankAccountConfig, "id" | "createdAt" | "updatedAt"> = { bank: "", accountHolder: "", accountNumber: "", clabe: "", cardNumber: "", requiredConcept: "", paymentInstructions: "", active: true };
  const [form, setForm] = useState<Omit<BankAccountConfig, "id" | "createdAt" | "updatedAt">>(() => {
    if (store.bankAccountConfig) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = store.bankAccountConfig;
      void _id; void _c; void _u;
      return rest;
    }
    return empty;
  });

  function handleSave() {
    store.saveBankAccountConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inp = S.input;
  const lbl = S.label;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Cuenta bancaria para mensualidades</h3>
        <p className="text-[11px] text-[var(--text-muted)]">Esta información se reutiliza en las instrucciones de pago mostradas a los especialistas.</p>
      </div>
      <div className="rounded-[var(--radius-surface)] p-5 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Banco</label><input className={inp} value={form.bank} onChange={(e) => setForm((v) => ({ ...v, bank: e.target.value }))} placeholder="BBVA, Banamex…" /></div>
          <div><label className={lbl}>Titular de la cuenta</label><input className={inp} value={form.accountHolder} onChange={(e) => setForm((v) => ({ ...v, accountHolder: e.target.value }))} /></div>
          <div><label className={lbl}>Número de cuenta</label><input className={inp} value={form.accountNumber} onChange={(e) => setForm((v) => ({ ...v, accountNumber: e.target.value }))} /></div>
          <div><label className={lbl}>CLABE interbancaria</label><input className={inp} value={form.clabe} onChange={(e) => setForm((v) => ({ ...v, clabe: e.target.value }))} maxLength={18} /></div>
          <div><label className={lbl}>Número de tarjeta (opcional)</label><input className={inp} value={form.cardNumber ?? ""} onChange={(e) => setForm((v) => ({ ...v, cardNumber: e.target.value }))} maxLength={16} /></div>
          <div><label className={lbl}>Concepto requerido</label><input className={inp} value={form.requiredConcept ?? ""} onChange={(e) => setForm((v) => ({ ...v, requiredConcept: e.target.value }))} placeholder="Mensualidad [N° cliente]" /></div>
          <div className="col-span-2">
            <label className={lbl}>Instrucciones de pago</label>
            <textarea className={inp} rows={3} value={form.paymentInstructions ?? ""} onChange={(e) => setForm((v) => ({ ...v, paymentInstructions: e.target.value }))} />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((v) => ({ ...v, active: e.target.checked }))} />
          <span className="text-[11px] text-[var(--text-primary)]">Cuenta activa</span>
        </label>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className={S.btnPrimary}>Guardar</button>
          {saved && <span className="text-[11px] text-[var(--accent)]">¡Guardado correctamente!</span>}
        </div>
      </div>
      {store.bankAccountConfig && (
        <div className="rounded-[var(--radius-surface)] p-4 bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)]">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Vista previa</p>
          <div className="space-y-1 text-xs text-[var(--text-muted)]">
            <p>Banco: <span className="text-[var(--text-primary)]">{store.bankAccountConfig.bank}</span></p>
            <p>Titular: <span className="text-[var(--text-primary)]">{store.bankAccountConfig.accountHolder}</span></p>
            <p>CLABE: <span className="font-mono text-[var(--text-primary)]">{store.bankAccountConfig.clabe}</span></p>
            {store.bankAccountConfig.requiredConcept && <p>Concepto: <span className="font-medium text-[var(--accent)]">{store.bankAccountConfig.requiredConcept}</span></p>}
            {store.bankAccountConfig.paymentInstructions && <p className="italic mt-1">"{store.bankAccountConfig.paymentInstructions}"</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

type FinanceTab = "resumen" | "ingresos" | "gastos" | "impuestos" | "facturacion";

const FINANCE_TABS: { key: FinanceTab; label: string }[] = [
  { key: "resumen",     label: "Resumen"     },
  { key: "ingresos",    label: "Ingresos"    },
  { key: "gastos",      label: "Gastos"      },
  { key: "impuestos",   label: "Impuestos"   },
  { key: "facturacion", label: "Facturación" },
];

export function FinanceView() {
  const store = useAdminStore();

  const [activeTab, setActiveTab] = useState<FinanceTab>("resumen");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    store.transfers.forEach((t) => {
      if (t.verifiedAt) years.add(new Date(t.verifiedAt).getFullYear());
      years.add(new Date(t.createdAt).getFullYear());
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [store.transfers]);

  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  const showMonthFilter = activeTab !== "resumen";

  // unused imports suppression
  void Divider; void fmtOpt; void useRef; void useEffect;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[var(--text-primary)] font-semibold text-base">Finanzas</h2>
          <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
            Centro financiero operativo · estimaciones internas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Año</label>
          <select
            className={`${S.input} !py-1.5 !text-xs w-24`}
            value={selectedYear}
            onChange={(e) => { setSelectedYear(Number(e.target.value)); setSelectedMonth(null); }}>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Tab nav */}
      <TabBar>
        {FINANCE_TABS.map((t) => (
          <TabButton key={t.key} active={activeTab === t.key}
            onClick={() => { setActiveTab(t.key); setSelectedMonth(null); }}
            className="px-3.5 py-2.5 mr-1">
            {t.label}
          </TabButton>
        ))}
      </TabBar>

      {/* Month filter */}
      {showMonthFilter && (
        <MonthFilter year={selectedYear} month={selectedMonth} onChange={setSelectedMonth} />
      )}

      {/* Content */}
      {activeTab === "resumen"       && <ResumenTab year={selectedYear} />}
      {activeTab === "ingresos"      && <IngresosTab year={selectedYear} month={selectedMonth} />}
      {activeTab === "gastos"        && <GastosTab year={selectedYear} month={selectedMonth} />}
      {activeTab === "impuestos"     && <ImpuestosTab year={selectedYear} />}
      {activeTab === "facturacion"   && <FacturacionTab year={selectedYear} month={selectedMonth} />}
    </div>
  );
}
