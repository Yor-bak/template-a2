"use client";
import { useState, useMemo } from "react";
import type {
  MonthlyFixedExpense,
  OtherFinancialMovement,
  MonthlyTaxRecord,
  InvoiceRecord,
  BankMovement,
  ReconciliationStatus,
  InvoiceStatus,
} from "@/types/user";
import {
  useAdminStore,
  MONTH_NAMES,
  getAnnualFinancialSummary,
  getMonthlyFinancialBreakdown,
  getVerifiedOpeningIncome,
  getVerifiedMonthlyIncome,
  getPaidCommissions,
  getAuthorizedCommissionDebt,
  getActiveFixedExpensesByMonth,
  getFixedExpensesTotalByMonth,
  getOtherIncomeByMonth,
  getOtherExpensesByMonth,
  getEstimatedNetProfitByMonth,
  getActualNetProfitByMonth,
  expenseAppliesToMonth,
} from "@/store/adminStore";
import { S, SectionTitle, Divider, BadgeEl, COMMISSION_META, fmtDate, fmtDateTime } from "./adminUi";

// ── Format helpers ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `$${n.toLocaleString("es-MX")}`;
}

function fmtOpt(n: number | null | undefined): string {
  if (n == null) return "—";
  return fmt(n);
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function SumCard({ label, value, sub, accent, danger, muted }: {
  label: string; value: string; sub?: string;
  accent?: boolean; danger?: boolean; muted?: boolean;
}) {
  return (
    <div className="rounded-xl px-4 py-4 relative overflow-hidden bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
      <div className={`absolute top-0 left-0 right-0 h-[1px] ${accent ? "bg-[var(--accent)]" : danger ? "bg-[var(--danger)]" : "bg-[var(--border)]"}`} />
      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${accent ? "text-[var(--accent)]" : danger ? "text-[var(--danger)]" : muted ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

function MonthFilter({ year, month, onChange }: {
  year: number; month: number | null; onChange: (m: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Mes</span>
      <button
        onClick={() => onChange(null)}
        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border-[0.5px] transition-colors ${
          month === null
            ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
        }`}>
        Todo {year}
      </button>
      {MONTH_NAMES.map((name, i) => (
        <button key={i}
          onClick={() => onChange(i + 1)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border-[0.5px] transition-colors ${
            month === i + 1
              ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
          }`}>
          {name.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">{children}</table>
      </div>
    </div>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap text-left">
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

function StatusBadge({ label, variant }: { label: string; variant: "accent" | "muted" | "danger" | "warn" }) {
  const cls = variant === "accent"
    ? "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
    : variant === "danger"
    ? "bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]"
    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border-[0.5px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ── Tab: Resumen ──────────────────────────────────────────────────────────────

function ResumenTab({ year, transfers, commissions, fixedExpenses, otherMovements, taxRecords, monthlyCloses }: {
  year: number;
  transfers: ReturnType<typeof useAdminStore>["transfers"];
  commissions: ReturnType<typeof useAdminStore>["commissions"];
  fixedExpenses: MonthlyFixedExpense[];
  otherMovements: OtherFinancialMovement[];
  taxRecords: MonthlyTaxRecord[];
  monthlyCloses: ReturnType<typeof useAdminStore>["monthlyCloses"];
}) {
  const summary = useMemo(
    () => getAnnualFinancialSummary(transfers, commissions, year),
    [transfers, commissions, year]
  );

  const annualFixed = useMemo(
    () => Array.from({ length: 12 }, (_, i) => getFixedExpensesTotalByMonth(fixedExpenses, year, i + 1))
      .reduce((s, v) => s + v, 0),
    [fixedExpenses, year]
  );

  const annualOtherInc = useMemo(
    () => Array.from({ length: 12 }, (_, i) => getOtherIncomeByMonth(otherMovements, year, i + 1))
      .reduce((s, arr) => s + arr.reduce((a, m) => a + m.amount, 0), 0),
    [otherMovements, year]
  );

  const annualOtherExp = useMemo(
    () => Array.from({ length: 12 }, (_, i) => getOtherExpensesByMonth(otherMovements, year, i + 1))
      .reduce((s, arr) => s + arr.reduce((a, m) => a + m.amount, 0), 0),
    [otherMovements, year]
  );

  const annualTaxEst = useMemo(
    () => taxRecords.filter((t) => t.year === year).reduce((s, t) => s + t.estimatedTaxAmount, 0),
    [taxRecords, year]
  );

  const annualTaxPaid = useMemo(
    () => taxRecords.filter((t) => t.year === year).reduce((s, t) => s + (t.actualPaidAmount ?? 0), 0),
    [taxRecords, year]
  );

  const breakdown = useMemo(
    () => getMonthlyFinancialBreakdown(transfers, commissions, year),
    [transfers, commissions, year]
  );

  return (
    <div className="space-y-6">
      <p className="text-[10px] text-[var(--text-muted)] italic">
        Estimación financiera interna. No sustituye cálculo contable o fiscal.
      </p>

      {/* Annual cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <SumCard label="Ingresos totales" value={fmt(summary.totalIncome)} accent
          sub={`${summary.openingCount} apert. · ${summary.monthlyCount} mens.`} />
        <SumCard label="Otros ingresos" value={fmt(annualOtherInc)} sub="no mensualidades" />
        <SumCard label="Comisiones pagadas" value={fmt(summary.paidCommissions)} danger />
        <SumCard label="Gastos fijos" value={fmt(annualFixed)} danger />
        <SumCard label="Otros egresos" value={fmt(annualOtherExp)} danger />
        <SumCard label="Impuesto estimado" value={fmt(annualTaxEst)} sub={`Pagado: ${fmt(annualTaxPaid)}`} muted />
      </div>

      {/* Estimated net */}
      <div className="rounded-xl p-4 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Utilidad neta estimada {year}
            </p>
            <p className="text-2xl font-bold tabular-nums text-[var(--accent)]">
              {fmt(summary.totalIncome + annualOtherInc - summary.paidCommissions - annualFixed - annualOtherExp - annualTaxEst)}
            </p>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] max-w-[260px] text-right">
            Ingresos − comisiones pagadas − gastos fijos − otros egresos − impuesto estimado
          </p>
        </div>
      </div>

      {/* Monthly breakdown */}
      <SectionTitle>Desglose mensual {year}</SectionTitle>
      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Mes","Ingresos","Otros ingr.","Com. pagada","Gastos fijos","Impuesto est.","Util. neta est.","Cierre"].map((h) => (
              <TH key={h}>{h}</TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {breakdown.map((row) => {
            const otherInc  = getOtherIncomeByMonth(otherMovements, year, row.month).reduce((s, m) => s + m.amount, 0);
            const otherExp  = getOtherExpensesByMonth(otherMovements, year, row.month).reduce((s, m) => s + m.amount, 0);
            const fixed     = getFixedExpensesTotalByMonth(fixedExpenses, year, row.month);
            const tax       = taxRecords.find((t) => t.year === year && t.month === row.month);
            const estTax    = tax?.estimatedTaxAmount ?? 0;
            const netEst    = row.totalIncome + otherInc - row.paidCommissions - fixed - otherExp - estTax;
            const closeRec  = monthlyCloses.find((m) => m.year === year && m.month === row.month);
            const hasActivity = row.totalIncome > 0 || row.paidCommissions > 0 || fixed > 0;
            return (
              <tr key={row.month} className={`border-b-[0.5px] border-[var(--border)] last:border-b-0 ${hasActivity ? "" : "opacity-40"}`}>
                <td className="px-4 py-2.5 font-medium text-[var(--text-primary)] whitespace-nowrap">{row.monthLabel}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-primary)]">{row.totalIncome > 0 ? fmt(row.totalIncome) : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{otherInc > 0 ? fmt(otherInc) : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--danger)]">{row.paidCommissions > 0 ? fmt(row.paidCommissions) : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--danger)]">{fixed > 0 ? fmt(fixed) : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{estTax > 0 ? fmt(estTax) : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums font-semibold text-[var(--accent)]">{hasActivity ? fmt(netEst) : "—"}</td>
                <td className="px-4 py-2.5">
                  {closeRec?.status === "closed" && <StatusBadge label="Cerrado" variant="muted" />}
                  {closeRec?.status === "reopened" && <StatusBadge label="Reabierto" variant="warn" />}
                  {!closeRec && hasActivity && <StatusBadge label="Abierto" variant="accent" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}

// ── Tab: Ingresos ─────────────────────────────────────────────────────────────

function IngresosTab({ year, month, transfers, otherMovements }: {
  year: number; month: number | null;
  transfers: ReturnType<typeof useAdminStore>["transfers"];
  otherMovements: OtherFinancialMovement[];
}) {
  const store = useAdminStore();
  const [filterType, setFilterType] = useState<"all" | "opening" | "monthly" | "other">("all");

  const transferItems = useMemo(() => {
    const openings = getVerifiedOpeningIncome(transfers, year, month ?? undefined);
    const monthly  = getVerifiedMonthlyIncome(transfers, year, month ?? undefined);
    const base = filterType === "opening" ? openings : filterType === "monthly" ? monthly : [...openings, ...monthly];
    return base.sort((a, b) => (b.verifiedAt ?? b.createdAt).localeCompare(a.verifiedAt ?? a.createdAt));
  }, [transfers, year, month, filterType]);

  const otherItems = useMemo(() => {
    if (filterType === "opening" || filterType === "monthly") return [];
    const arr: OtherFinancialMovement[] = [];
    if (month !== null) {
      arr.push(...getOtherIncomeByMonth(otherMovements, year, month));
    } else {
      for (let m = 1; m <= 12; m++) arr.push(...getOtherIncomeByMonth(otherMovements, year, m));
    }
    return arr.sort((a, b) => b.movementDate.localeCompare(a.movementDate));
  }, [otherMovements, year, month, filterType]);

  const totalTransfers = transferItems.reduce((s, t) => s + t.amount, 0);
  const totalOther = otherItems.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "opening", "monthly", "other"] as const).map((k) => (
          <button key={k}
            onClick={() => setFilterType(k)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border-[0.5px] transition-colors ${
              filterType === k
                ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            }`}>
            {k === "all" ? "Todos" : k === "opening" ? "Aperturas" : k === "monthly" ? "Mensualidades" : "Otros ingresos"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[var(--text-muted)]">
          Total: <span className="font-semibold text-[var(--accent)]">{fmt(totalTransfers + totalOther)}</span>
        </span>
      </div>

      {filterType !== "other" && (
        <>
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Transferencias verificadas</p>
          <TableWrap>
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                {["Fecha verif.","Referencia","Cliente","Tipo","Monto"].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {transferItems.length === 0 && <EmptyRow cols={5} />}
              {transferItems.map((t) => {
                const client = store.clients.find((c) => c.id === (t.clientId ?? t.specialistId));
                return (
                  <tr key={t.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">
                      {fmtDate(t.verifiedAt ? t.verifiedAt.split("T")[0] : t.transferDate)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{t.referenceNumber}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-[var(--text-primary)]">{client?.business.name ?? t.prospectiveBusinessName ?? "—"}</p>
                      <p className="text-[10px] font-mono text-[var(--accent)]">{t.clientNumber ?? "—"}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge label={t.type === "opening" ? "Apertura" : "Mensualidad"} variant={t.type === "opening" ? "accent" : "muted"} />
                    </td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--text-primary)]">{fmt(t.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </>
      )}

      {filterType !== "opening" && filterType !== "monthly" && (
        <>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-4">Otros ingresos</p>
          <TableWrap>
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                {["Fecha","Concepto","Descripción","Referencia","Monto"].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {otherItems.length === 0 && <EmptyRow cols={5} />}
              {otherItems.map((m) => (
                <tr key={m.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{fmtDate(m.movementDate)}</td>
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{m.name}</td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">{m.description ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{m.reference ?? "—"}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--accent)]">{fmt(m.amount)}</td>
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

function ComisionesTab({ year, month, commissions }: {
  year: number; month: number | null;
  commissions: ReturnType<typeof useAdminStore>["commissions"];
}) {
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "authorized" | "cancelled">("all");

  const items = useMemo(() => {
    let result = commissions.filter((c) => {
      const d = new Date(c.paidAt ?? c.authorizedAt ?? c.generatedAt);
      if (d.getFullYear() !== year) return false;
      if (month !== null && d.getMonth() + 1 !== month) return false;
      return true;
    });
    if (filterStatus !== "all") result = result.filter((c) => c.status === filterStatus);
    return result.sort((a, b) =>
      (b.paidAt ?? b.authorizedAt ?? b.generatedAt).localeCompare(a.paidAt ?? a.authorizedAt ?? a.generatedAt)
    );
  }, [commissions, year, month, filterStatus]);

  const paidTotal = items.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const pendingTotal = items.filter((c) => c.status === "authorized").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "authorized", "paid", "cancelled"] as const).map((k) => (
          <button key={k} onClick={() => setFilterStatus(k)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border-[0.5px] transition-colors ${
              filterStatus === k
                ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            }`}>
            {k === "all" ? "Todas" : k === "authorized" ? "Pendientes" : k === "paid" ? "Pagadas" : "Canceladas"}
          </button>
        ))}
      </div>
      {(paidTotal > 0 || pendingTotal > 0) && (
        <div className="flex gap-4 text-[11px] text-[var(--text-muted)]">
          {paidTotal > 0 && <span>Pagadas: <span className="font-semibold text-[var(--accent)]">{fmt(paidTotal)}</span></span>}
          {pendingTotal > 0 && <span>Por pagar: <span className="font-semibold text-[var(--danger)]">{fmt(pendingTotal)}</span></span>}
        </div>
      )}
      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Quincena","Vendedor","Cliente","Monto","Estado","Fecha pago"].map((h) => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && <EmptyRow cols={6} />}
          {items.map((c) => {
            const [fy, fm, fh] = c.fortnightId.split("-").map(Number);
            const ftShort = `${fh === 1 ? "1a" : "2a"} Q ${MONTH_NAMES[fm - 1]?.slice(0, 3)} ${fy}`;
            return (
              <tr key={c.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="px-4 py-2.5 whitespace-nowrap text-[10px] text-[var(--text-muted)]">{ftShort}</td>
                <td className="px-4 py-2.5 font-mono text-[var(--accent)] text-[10px]">{c.sellerNumber}</td>
                <td className="px-4 py-2.5">
                  <p className="text-[var(--text-primary)]">{c.businessName}</p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)]">{c.clientNumber}</p>
                </td>
                <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--text-primary)]">{fmt(c.amount)}</td>
                <td className="px-4 py-2.5"><BadgeEl meta={COMMISSION_META[c.status]} /></td>
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">
                  {c.paidAt ? fmtDate(c.paidAt.split("T")[0]) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );
}

// ── Tab: Gastos fijos ─────────────────────────────────────────────────────────

function GastosTab({ year, month, fixedExpenses, otherMovements }: {
  year: number; month: number | null;
  fixedExpenses: MonthlyFixedExpense[];
  otherMovements: OtherFinancialMovement[];
}) {
  const store = useAdminStore();
  const [showAddFixed, setShowAddFixed] = useState(false);
  const [showAddOther, setShowAddOther] = useState(false);
  const [newFixed, setNewFixed] = useState({ name: "", description: "", amount: "", startDate: `${year}-01-01`, endDate: "" });
  const [newOther, setNewOther] = useState({ name: "", description: "", amount: "", movementDate: `${year}-06-01`, reference: "" });

  const activeMonth = month ?? new Date().getMonth() + 1;
  const activeYear = year;

  const fixedForMonth = useMemo(
    () => fixedExpenses.filter((e) => expenseAppliesToMonth(e, activeYear, activeMonth)),
    [fixedExpenses, activeYear, activeMonth]
  );

  const allFixed = useMemo(
    () => fixedExpenses.filter((e) => {
      if (month === null) return true;
      return expenseAppliesToMonth(e, year, month) || !e.active;
    }),
    [fixedExpenses, year, month]
  );

  const otherExpItems = useMemo(() => {
    const arr: OtherFinancialMovement[] = [];
    if (month !== null) {
      arr.push(...getOtherExpensesByMonth(otherMovements, year, month));
    } else {
      for (let m = 1; m <= 12; m++) arr.push(...getOtherExpensesByMonth(otherMovements, year, m));
    }
    return arr.sort((a, b) => b.movementDate.localeCompare(a.movementDate));
  }, [otherMovements, year, month]);

  const fixedTotal = fixedForMonth.reduce((s, e) => s + e.amount, 0);
  const otherTotal = otherExpItems.reduce((s, m) => s + m.amount, 0);

  function handleAddFixed() {
    const amount = parseFloat(newFixed.amount);
    if (!newFixed.name || isNaN(amount)) return;
    store.addFixedExpense({
      name: newFixed.name,
      description: newFixed.description || undefined,
      amount,
      active: true,
      startDate: newFixed.startDate,
      endDate: newFixed.endDate || undefined,
    });
    setNewFixed({ name: "", description: "", amount: "", startDate: `${year}-01-01`, endDate: "" });
    setShowAddFixed(false);
  }

  function handleAddOther() {
    const amount = parseFloat(newOther.amount);
    if (!newOther.name || isNaN(amount)) return;
    store.addOtherMovement({
      type: "other_expense",
      name: newOther.name,
      description: newOther.description || undefined,
      amount,
      movementDate: newOther.movementDate,
      reference: newOther.reference || undefined,
    });
    setNewOther({ name: "", description: "", amount: "", movementDate: `${year}-06-01`, reference: "" });
    setShowAddOther(false);
  }

  return (
    <div className="space-y-6">
      {/* Fixed expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <SectionTitle>Gastos fijos mensuales</SectionTitle>
            <p className="text-[10px] text-[var(--text-muted)]">
              {month !== null ? `${MONTH_NAMES[month - 1]} ${year}: ` : ""}
              Total activo: <span className="font-semibold text-[var(--danger)]">{fmt(fixedTotal)}</span>
            </p>
          </div>
          <button onClick={() => setShowAddFixed((v) => !v)} className={S.btnGhost}>
            {showAddFixed ? "Cancelar" : "+ Agregar gasto"}
          </button>
        </div>

        {showAddFixed && (
          <div className="rounded-xl p-4 mb-4 space-y-3 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={S.label}>Nombre *</label>
                <input className={S.input} value={newFixed.name} onChange={(e) => setNewFixed((v) => ({ ...v, name: e.target.value }))} placeholder="Ej. Servidor cloud" />
              </div>
              <div>
                <label className={S.label}>Monto mensual (MXN) *</label>
                <input className={S.input} type="number" value={newFixed.amount} onChange={(e) => setNewFixed((v) => ({ ...v, amount: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className={S.label}>Descripción</label>
                <input className={S.input} value={newFixed.description} onChange={(e) => setNewFixed((v) => ({ ...v, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={S.label}>Inicio</label>
                  <input className={S.input} type="date" value={newFixed.startDate} onChange={(e) => setNewFixed((v) => ({ ...v, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className={S.label}>Fin (opcional)</label>
                  <input className={S.input} type="date" value={newFixed.endDate} onChange={(e) => setNewFixed((v) => ({ ...v, endDate: e.target.value }))} />
                </div>
              </div>
            </div>
            <button className={S.btnPrimary} onClick={handleAddFixed}>Guardar gasto</button>
          </div>
        )}

        <TableWrap>
          <thead>
            <tr className="border-b-[0.5px] border-[var(--border)]">
              {["Nombre","Descripción","Monto","Desde","Hasta","Estado",""].map((h) => <TH key={h}>{h}</TH>)}
            </tr>
          </thead>
          <tbody>
            {allFixed.length === 0 && <EmptyRow cols={7} />}
            {allFixed.map((e) => (
              <tr key={e.id} className={`border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors ${!e.active ? "opacity-50" : ""}`}>
                <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{e.name}</td>
                <td className="px-4 py-2.5 text-[var(--text-muted)]">{e.description ?? "—"}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--danger)]">{fmt(e.amount)}</td>
                <td className="px-4 py-2.5 text-[var(--text-muted)] text-[10px]">{fmtDate(e.startDate)}</td>
                <td className="px-4 py-2.5 text-[var(--text-muted)] text-[10px]">{e.endDate ? fmtDate(e.endDate) : "—"}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge label={e.active ? "Activo" : "Pausado"} variant={e.active ? "accent" : "muted"} />
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => store.toggleFixedExpense(e.id)}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {e.active ? "Pausar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>

      <Divider />

      {/* Other expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <SectionTitle>Otros egresos</SectionTitle>
            <p className="text-[10px] text-[var(--text-muted)]">
              Total: <span className="font-semibold text-[var(--danger)]">{fmt(otherTotal)}</span>
            </p>
          </div>
          <button onClick={() => setShowAddOther((v) => !v)} className={S.btnGhost}>
            {showAddOther ? "Cancelar" : "+ Agregar egreso"}
          </button>
        </div>

        {showAddOther && (
          <div className="rounded-xl p-4 mb-4 space-y-3 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={S.label}>Concepto *</label>
                <input className={S.input} value={newOther.name} onChange={(e) => setNewOther((v) => ({ ...v, name: e.target.value }))} placeholder="Ej. Compra de equipo" />
              </div>
              <div>
                <label className={S.label}>Monto (MXN) *</label>
                <input className={S.input} type="number" value={newOther.amount} onChange={(e) => setNewOther((v) => ({ ...v, amount: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className={S.label}>Fecha</label>
                <input className={S.input} type="date" value={newOther.movementDate} onChange={(e) => setNewOther((v) => ({ ...v, movementDate: e.target.value }))} />
              </div>
              <div>
                <label className={S.label}>Referencia</label>
                <input className={S.input} value={newOther.reference} onChange={(e) => setNewOther((v) => ({ ...v, reference: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className={S.label}>Descripción</label>
                <input className={S.input} value={newOther.description} onChange={(e) => setNewOther((v) => ({ ...v, description: e.target.value }))} />
              </div>
            </div>
            <button className={S.btnPrimary} onClick={handleAddOther}>Guardar egreso</button>
          </div>
        )}

        <TableWrap>
          <thead>
            <tr className="border-b-[0.5px] border-[var(--border)]">
              {["Fecha","Concepto","Descripción","Referencia","Monto",""].map((h) => <TH key={h}>{h}</TH>)}
            </tr>
          </thead>
          <tbody>
            {otherExpItems.length === 0 && <EmptyRow cols={6} />}
            {otherExpItems.map((m) => (
              <tr key={m.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{fmtDate(m.movementDate)}</td>
                <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{m.name}</td>
                <td className="px-4 py-2.5 text-[var(--text-muted)]">{m.description ?? "—"}</td>
                <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{m.reference ?? "—"}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--danger)]">{fmt(m.amount)}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => store.deleteOtherMovement(m.id)}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

// ── Tab: Impuestos ────────────────────────────────────────────────────────────

function ImpuestosTab({ year, taxRecords, transfers, commissions, fixedExpenses, otherMovements }: {
  year: number;
  taxRecords: MonthlyTaxRecord[];
  transfers: ReturnType<typeof useAdminStore>["transfers"];
  commissions: ReturnType<typeof useAdminStore>["commissions"];
  fixedExpenses: MonthlyFixedExpense[];
  otherMovements: OtherFinancialMovement[];
}) {
  const store = useAdminStore();
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ percentage: "16", notes: "" });
  const [payForm, setPayForm] = useState({ amount: "", paidAt: "" });
  const [payingId, setPayingId] = useState<string | null>(null);

  function startEdit(month: number) {
    const rec = taxRecords.find((t) => t.year === year && t.month === month);
    setEditForm({ percentage: String(rec?.taxPercentage ?? 16), notes: rec?.notes ?? "" });
    setEditingMonth(month);
  }

  function saveEdit(month: number) {
    const pct = parseFloat(editForm.percentage);
    if (isNaN(pct)) return;
    const opening = getVerifiedOpeningIncome(transfers, year, month).reduce((s, t) => s + t.amount, 0);
    const monthly  = getVerifiedMonthlyIncome(transfers, year, month).reduce((s, t) => s + t.amount, 0);
    const otherInc = getOtherIncomeByMonth(otherMovements, year, month).reduce((s, m) => s + m.amount, 0);
    const comms    = getPaidCommissions(commissions, year, month).reduce((s, c) => s + c.amount, 0);
    const fixed    = getFixedExpensesTotalByMonth(fixedExpenses, year, month);
    const otherExp = getOtherExpensesByMonth(otherMovements, year, month).reduce((s, m) => s + m.amount, 0);
    const base     = Math.max(0, opening + monthly + otherInc - comms - fixed - otherExp);
    const est      = parseFloat(((base * pct) / 100).toFixed(2));
    store.upsertTaxRecord(year, month, { taxPercentage: pct, taxableBase: base, estimatedTaxAmount: est, notes: editForm.notes || undefined });
    setEditingMonth(null);
  }

  function startPay(id: string) {
    const rec = taxRecords.find((t) => t.id === id);
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
        Estimación financiera interna. No sustituye cálculo contable o fiscal.
      </p>
      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Mes","Base imponible","% Est.","Impuesto est.","Pagado real","Fecha pago","Estado",""].map((h) => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {MONTH_NAMES.map((name, i) => {
            const month = i + 1;
            const rec = taxRecords.find((t) => t.year === year && t.month === month);
            const isEditing = editingMonth === month;
            const isPaying = payingId === rec?.id;
            const status = rec
              ? rec.actualPaidAmount !== undefined ? "paid" : "pending"
              : "none";
            return (
              <tr key={month} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{name}</td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">
                  {rec ? fmt(rec.taxableBase) : "—"}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">
                  {isEditing ? (
                    <input className={`${S.input} w-16 !py-0.5`} value={editForm.percentage}
                      onChange={(e) => setEditForm((v) => ({ ...v, percentage: e.target.value }))} />
                  ) : rec ? `${rec.taxPercentage}%` : "—"}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-[var(--text-primary)]">
                  {rec ? fmt(rec.estimatedTaxAmount) : "—"}
                </td>
                <td className="px-4 py-2.5 tabular-nums font-semibold">
                  {isPaying ? (
                    <input className={`${S.input} w-24 !py-0.5`} value={payForm.amount}
                      onChange={(e) => setPayForm((v) => ({ ...v, amount: e.target.value }))} />
                  ) : rec?.actualPaidAmount !== undefined ? (
                    <span className="text-[var(--accent)]">{fmt(rec.actualPaidAmount)}</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">
                  {isPaying ? (
                    <input className={`${S.input} !py-0.5`} type="date" value={payForm.paidAt}
                      onChange={(e) => setPayForm((v) => ({ ...v, paidAt: e.target.value }))} />
                  ) : rec?.paidAt ? fmtDate(rec.paidAt) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  {status === "paid" && <StatusBadge label="Pagado" variant="accent" />}
                  {status === "pending" && <StatusBadge label="Pendiente" variant="muted" />}
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
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors" onClick={() => startEdit(month)}>
                        {rec ? "Editar" : "Registrar"}
                      </button>
                      {rec && status !== "paid" && (
                        <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors" onClick={() => startPay(rec.id)}>
                          Marcar pagado
                        </button>
                      )}
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
  pending: "Pendiente",
  issued: "Emitida",
  cancelled: "Cancelada",
};

function FacturacionTab({ invoices, year, month }: {
  invoices: InvoiceRecord[]; year: number; month: number | null;
}) {
  const store = useAdminStore();
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");

  const items = useMemo(() => {
    let result = invoices.filter((inv) => {
      const d = new Date((inv.issuedAt ?? inv.cancelledAt ?? inv.createdAt) + (inv.issuedAt?.length === 10 ? "T00:00:00" : ""));
      if (d.getFullYear() !== year) return false;
      if (month !== null && d.getMonth() + 1 !== month) return false;
      return true;
    });
    if (filterStatus !== "all") result = result.filter((i) => i.status === filterStatus);
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [invoices, year, month, filterStatus]);

  const clients = store.clients;

  function updateStatus(id: string, status: InvoiceStatus) {
    const now = new Date().toISOString().split("T")[0];
    if (status === "issued") {
      store.updateInvoice(id, { status, issuedAt: now });
    } else if (status === "cancelled") {
      store.updateInvoice(id, { status, cancelledAt: now });
    } else {
      store.updateInvoice(id, { status });
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-[var(--text-muted)]">
        Seguimiento interno de facturación. No genera CFDI automáticamente.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "pending", "issued", "cancelled", "not_required"] as const).map((k) => (
          <button key={k} onClick={() => setFilterStatus(k)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border-[0.5px] transition-colors ${
              filterStatus === k
                ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            }`}>
            {k === "all" ? "Todas" : INVOICE_STATUS_LABELS[k]}
          </button>
        ))}
      </div>
      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Cliente","N° factura","Monto","Estado","Fecha","Notas",""].map((h) => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && <EmptyRow cols={7} />}
          {items.map((inv) => {
            const client = clients.find((c) => c.id === inv.clientId);
            return (
              <tr key={inv.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="px-4 py-2.5">
                  <p className="text-[var(--text-primary)]">{client?.business.name ?? inv.clientId}</p>
                  <p className="font-mono text-[10px] text-[var(--accent)]">{client?.clientNumber ?? "—"}</p>
                </td>
                <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{inv.invoiceNumber ?? "—"}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--text-primary)]">
                  {inv.invoicedAmount !== undefined ? fmt(inv.invoicedAmount) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge
                    label={INVOICE_STATUS_LABELS[inv.status]}
                    variant={inv.status === "issued" ? "accent" : inv.status === "cancelled" ? "danger" : "muted"}
                  />
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)] text-[10px]">
                  {fmtDate((inv.issuedAt ?? inv.cancelledAt ?? inv.createdAt.split("T")[0]))}
                </td>
                <td className="px-4 py-2.5 text-[var(--text-muted)] max-w-[160px]">
                  <p className="truncate">{inv.notes ?? "—"}</p>
                </td>
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

// ── Tab: Conciliación ─────────────────────────────────────────────────────────

const RECONCILIATION_LABELS: Record<ReconciliationStatus, string> = {
  unmatched: "Sin conciliar",
  matched: "Conciliado",
  difference: "Diferencia",
  ignored: "Ignorado",
};

function ConciliacionTab({ bankMovements, year, month }: {
  bankMovements: BankMovement[]; year: number; month: number | null;
}) {
  const store = useAdminStore();
  const [filterStatus, setFilterStatus] = useState<ReconciliationStatus | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    movementDate: `${year}-06-01`, description: "", reference: "",
    amount: "", direction: "income" as "income" | "expense", notes: "",
  });

  const items = useMemo(() => {
    let result = bankMovements.filter((bm) => {
      const d = new Date(bm.movementDate + "T00:00:00");
      if (d.getFullYear() !== year) return false;
      if (month !== null && d.getMonth() + 1 !== month) return false;
      return true;
    });
    if (filterStatus !== "all") result = result.filter((b) => b.reconciliationStatus === filterStatus);
    return result.sort((a, b) => b.movementDate.localeCompare(a.movementDate));
  }, [bankMovements, year, month, filterStatus]);

  const unmatched = items.filter((b) => b.reconciliationStatus === "unmatched" || b.reconciliationStatus === "difference").length;

  function handleAdd() {
    const amount = parseFloat(form.amount);
    if (!form.description || isNaN(amount)) return;
    store.addBankMovement({
      movementDate: form.movementDate,
      description: form.description,
      reference: form.reference || undefined,
      amount,
      direction: form.direction,
      reconciliationStatus: "unmatched",
      notes: form.notes || undefined,
    });
    setForm({ movementDate: `${year}-06-01`, description: "", reference: "", amount: "", direction: "income", notes: "" });
    setShowAdd(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {(["all", "unmatched", "matched", "difference", "ignored"] as const).map((k) => (
            <button key={k} onClick={() => setFilterStatus(k)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border-[0.5px] transition-colors ${
                filterStatus === k
                  ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              }`}>
              {k === "all" ? "Todos" : RECONCILIATION_LABELS[k]}
            </button>
          ))}
          {unmatched > 0 && (
            <span className="text-[11px] font-medium text-[var(--danger)]">{unmatched} sin conciliar</span>
          )}
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className={S.btnGhost}>
          {showAdd ? "Cancelar" : "+ Movimiento"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4 space-y-3 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={S.label}>Fecha</label>
              <input className={S.input} type="date" value={form.movementDate} onChange={(e) => setForm((v) => ({ ...v, movementDate: e.target.value }))} />
            </div>
            <div>
              <label className={S.label}>Tipo</label>
              <select className={S.input} value={form.direction} onChange={(e) => setForm((v) => ({ ...v, direction: e.target.value as "income" | "expense" }))}>
                <option value="income">Ingreso</option>
                <option value="expense">Egreso</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={S.label}>Descripción *</label>
              <input className={S.input} value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} />
            </div>
            <div>
              <label className={S.label}>Monto (MXN) *</label>
              <input className={S.input} type="number" value={form.amount} onChange={(e) => setForm((v) => ({ ...v, amount: e.target.value }))} />
            </div>
            <div>
              <label className={S.label}>Referencia</label>
              <input className={S.input} value={form.reference} onChange={(e) => setForm((v) => ({ ...v, reference: e.target.value }))} />
            </div>
          </div>
          <button className={S.btnPrimary} onClick={handleAdd}>Guardar movimiento</button>
        </div>
      )}

      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Fecha","Descripción","Referencia","Tipo","Monto","Estado","Notas",""].map((h) => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && <EmptyRow cols={8} />}
          {items.map((bm) => (
            <tr key={bm.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
              <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)]">{fmtDate(bm.movementDate)}</td>
              <td className="px-4 py-2.5 text-[var(--text-primary)] max-w-[200px]">
                <p className="truncate">{bm.description}</p>
              </td>
              <td className="px-4 py-2.5 font-mono text-[var(--text-muted)] text-[10px]">{bm.reference ?? "—"}</td>
              <td className="px-4 py-2.5">
                <StatusBadge label={bm.direction === "income" ? "Ingreso" : "Egreso"} variant={bm.direction === "income" ? "accent" : "muted"} />
              </td>
              <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--text-primary)]">{fmt(bm.amount)}</td>
              <td className="px-4 py-2.5">
                <StatusBadge
                  label={RECONCILIATION_LABELS[bm.reconciliationStatus]}
                  variant={bm.reconciliationStatus === "matched" ? "accent" : bm.reconciliationStatus === "unmatched" || bm.reconciliationStatus === "difference" ? "danger" : "muted"}
                />
              </td>
              <td className="px-4 py-2.5 text-[var(--text-muted)] text-[10px] max-w-[160px]">
                <p className="truncate">{bm.notes ?? "—"}</p>
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                {bm.reconciliationStatus === "unmatched" && (
                  <div className="flex gap-2">
                    <button className="text-[10px] text-[var(--accent)] hover:underline"
                      onClick={() => store.reconcileBankMovement(bm.id, "matched")}>
                      Conciliar
                    </button>
                    <button className="text-[10px] text-[var(--text-muted)] hover:underline"
                      onClick={() => store.reconcileBankMovement(bm.id, "ignored")}>
                      Ignorar
                    </button>
                  </div>
                )}
                {bm.reconciliationStatus === "difference" && (
                  <button className="text-[10px] text-[var(--accent)] hover:underline"
                    onClick={() => store.reconcileBankMovement(bm.id, "matched")}>
                    Marcar OK
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}

// ── Tab: Cierre mensual ───────────────────────────────────────────────────────

function CierreMensualTab({ year, monthlyCloses }: {
  year: number; monthlyCloses: ReturnType<typeof useAdminStore>["monthlyCloses"];
}) {
  const store = useAdminStore();
  const [reopenReason, setReopenReason] = useState("");
  const [reopeningMonth, setReopeningMonth] = useState<number | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  function handleClose(month: number) {
    store.closeMonth(year, month);
  }

  function handleReopen(month: number) {
    if (!reopenReason.trim()) return;
    store.reopenMonth(year, month, reopenReason);
    setReopeningMonth(null);
    setReopenReason("");
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-[var(--text-muted)]">
        Cerrar un mes congela su estado para revisión. Puede reabrirse con justificación.
      </p>
      <TableWrap>
        <thead>
          <tr className="border-b-[0.5px] border-[var(--border)]">
            {["Mes","Estado","Cerrado","Reabierto","Motivo",""].map((h) => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {MONTH_NAMES.map((name, i) => {
            const month = i + 1;
            const rec = monthlyCloses.find((m) => m.year === year && m.month === month);
            const isFuture = year > currentYear || (year === currentYear && month > currentMonth);
            const isReopening = reopeningMonth === month;
            return (
              <tr key={month} className={`border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors ${isFuture ? "opacity-40" : ""}`}>
                <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{name} {year}</td>
                <td className="px-4 py-2.5">
                  {rec?.status === "closed" && <StatusBadge label="Cerrado" variant="muted" />}
                  {rec?.status === "reopened" && <StatusBadge label="Reabierto" variant="warn" />}
                  {!rec && !isFuture && <StatusBadge label="Abierto" variant="accent" />}
                  {isFuture && <span className="text-[10px] text-[var(--border)]">Futuro</span>}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)] text-[10px]">
                  {rec?.closedAt ? fmtDate(rec.closedAt.split("T")[0]) : "—"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text-muted)] text-[10px]">
                  {rec?.reopenedAt ? fmtDate(rec.reopenedAt.split("T")[0]) : "—"}
                </td>
                <td className="px-4 py-2.5 text-[var(--text-muted)] max-w-[200px]">
                  {isReopening ? (
                    <input className={`${S.input} !py-0.5`} value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      placeholder="Motivo de reapertura..." />
                  ) : (
                    <p className="truncate">{rec?.reopenReason ?? "—"}</p>
                  )}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {!isFuture && !rec && (
                    <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={() => handleClose(month)}>
                      Cerrar mes
                    </button>
                  )}
                  {rec?.status === "closed" && (
                    <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      onClick={() => setReopeningMonth(month)}>
                      Reabrir
                    </button>
                  )}
                  {isReopening && (
                    <div className="flex gap-2">
                      <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={() => handleReopen(month)}>Confirmar</button>
                      <button className="text-[10px] text-[var(--text-muted)] hover:underline" onClick={() => { setReopeningMonth(null); setReopenReason(""); }}>Cancelar</button>
                    </div>
                  )}
                  {rec?.status === "reopened" && !isReopening && (
                    <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={() => handleClose(month)}>
                      Re-cerrar
                    </button>
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

// ── Tab: Historial ────────────────────────────────────────────────────────────

function HistorialTab({ financialLog }: { financialLog: ReturnType<typeof useAdminStore>["financialLog"] }) {
  const sorted = useMemo(
    () => [...financialLog].sort((a, b) => b.date.localeCompare(a.date)),
    [financialLog]
  );

  return (
    <div className="space-y-3">
      {sorted.length === 0 && (
        <p className="text-xs text-[var(--text-muted)] py-8 text-center">Sin eventos registrados.</p>
      )}
      {sorted.map((item) => (
        <div key={item.id} className="flex items-start gap-3 py-3 border-b-[0.5px] border-[var(--border)] last:border-b-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-[var(--text-primary)]">{item.action}</span>
              {item.entity && <span className="text-[10px] text-[var(--accent)] font-mono">{item.entity}</span>}
              {item.newValue && (
                <span className="text-[10px] text-[var(--text-muted)]">→ {item.newValue}</span>
              )}
            </div>
            {item.detail && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.detail}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-[var(--text-muted)]">{fmtDate(item.date.split("T")[0])}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{item.actor}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

type FinanceTab = "resumen" | "ingresos" | "comisiones" | "gastos" | "impuestos" | "facturacion" | "conciliacion" | "cierre" | "historial";

const FINANCE_TABS: { key: FinanceTab; label: string }[] = [
  { key: "resumen",      label: "Resumen"        },
  { key: "ingresos",     label: "Ingresos"       },
  { key: "comisiones",   label: "Comisiones"     },
  { key: "gastos",       label: "Gastos"         },
  { key: "impuestos",    label: "Impuestos"      },
  { key: "facturacion",  label: "Facturación"    },
  { key: "conciliacion", label: "Conciliación"   },
  { key: "cierre",       label: "Cierre mensual" },
  { key: "historial",    label: "Historial"      },
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
    store.commissions.forEach((c) => {
      if (c.paidAt) years.add(new Date(c.paidAt).getFullYear());
      years.add(new Date(c.generatedAt).getFullYear());
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [store.transfers, store.commissions]);

  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  const showMonthFilter = activeTab !== "resumen" && activeTab !== "cierre" && activeTab !== "historial" && activeTab !== "impuestos";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[var(--text-primary)] font-semibold text-base">Finanzas</h2>
          <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
            Gestión financiera interna · no sustituye contabilidad oficial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Año</label>
          <select
            className={`${S.input} !py-1.5 !text-xs w-24`}
            value={selectedYear}
            onChange={(e) => { setSelectedYear(Number(e.target.value)); setSelectedMonth(null); }}>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-0.5 flex-wrap border-b-[0.5px] border-[var(--border)]">
        {FINANCE_TABS.map((t) => (
          <button key={t.key}
            onClick={() => { setActiveTab(t.key); setSelectedMonth(null); }}
            className={`px-3.5 py-2.5 text-[11px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === t.key
                ? "text-[var(--accent)] border-[var(--accent)]"
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Month filter */}
      {showMonthFilter && (
        <MonthFilter year={selectedYear} month={selectedMonth} onChange={setSelectedMonth} />
      )}

      {/* Tab content */}
      {activeTab === "resumen" && (
        <ResumenTab
          year={selectedYear}
          transfers={store.transfers}
          commissions={store.commissions}
          fixedExpenses={store.fixedExpenses}
          otherMovements={store.otherMovements}
          taxRecords={store.taxRecords}
          monthlyCloses={store.monthlyCloses}
        />
      )}
      {activeTab === "ingresos" && (
        <IngresosTab
          year={selectedYear} month={selectedMonth}
          transfers={store.transfers}
          otherMovements={store.otherMovements}
        />
      )}
      {activeTab === "comisiones" && (
        <ComisionesTab
          year={selectedYear} month={selectedMonth}
          commissions={store.commissions}
        />
      )}
      {activeTab === "gastos" && (
        <GastosTab
          year={selectedYear} month={selectedMonth}
          fixedExpenses={store.fixedExpenses}
          otherMovements={store.otherMovements}
        />
      )}
      {activeTab === "impuestos" && (
        <ImpuestosTab
          year={selectedYear}
          taxRecords={store.taxRecords}
          transfers={store.transfers}
          commissions={store.commissions}
          fixedExpenses={store.fixedExpenses}
          otherMovements={store.otherMovements}
        />
      )}
      {activeTab === "facturacion" && (
        <FacturacionTab
          invoices={store.invoices}
          year={selectedYear} month={selectedMonth}
        />
      )}
      {activeTab === "conciliacion" && (
        <ConciliacionTab
          bankMovements={store.bankMovements}
          year={selectedYear} month={selectedMonth}
        />
      )}
      {activeTab === "cierre" && (
        <CierreMensualTab
          year={selectedYear}
          monthlyCloses={store.monthlyCloses}
        />
      )}
      {activeTab === "historial" && (
        <HistorialTab financialLog={store.financialLog} />
      )}
    </div>
  );
}
