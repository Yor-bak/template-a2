"use client";
import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { S, Th, BadgeEl, COMMISSION_META } from "./adminUi";
import { SalesRepDrawer } from "./SalesRepDrawer";

export function SalesRepView() {
  const store = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [commission, setCommission] = useState("500");
  const [formError, setFormError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setFormError("El nombre es obligatorio."); return; }
    const fixedCommissionAmount = parseFloat(commission);
    if (isNaN(fixedCommissionAmount) || fixedCommissionAmount < 0) {
      setFormError("La comisión fija debe ser un número mayor o igual a 0.");
      return;
    }
    store.addSalesRep({
      name: name.trim(),
      phone: phone.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      active: true,
      fixedCommissionAmount,
    });
    setName(""); setPhone(""); setAccountNumber(""); setCommission("500"); setFormError("");
    setShowAdd(false);
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[var(--text-primary)] font-semibold text-base">Vendedores</h2>
          <p className="text-[var(--text-muted)] text-xs mt-0.5">
            {store.salesReps.length} registrados · {store.salesReps.filter((r) => r.active).length} activos
          </p>
        </div>
        <button className={S.btnPrimary} onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Cancelar" : "+ Nuevo vendedor"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd}
          className="mb-6 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-xl p-5 space-y-4">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.14em]">Nuevo vendedor</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className={S.label}>Nombre *</label>
              <input className={S.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Pedro González" />
            </div>
            <div>
              <label className={S.label}>Teléfono</label>
              <input className={S.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5512340001" />
            </div>
            <div>
              <label className={S.label}>Comisión fija (MXN)</label>
              <input className={S.input} type="number" min="0" step="1" value={commission}
                onChange={(e) => setCommission(e.target.value)} placeholder="500" />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className={S.label}>Número de cuenta (para pago de comisiones)</label>
              <input className={S.input} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="BBVA 4152 3130 0000 0000" />
            </div>
          </div>
          {formError && (
            <p className="text-[var(--danger)] text-xs bg-[var(--bg-elevated)] border-[0.5px] border-[var(--danger)] rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <button type="submit" className={S.btnPrimary}>Agregar</button>
        </form>
      )}

      <div className="rounded-xl overflow-hidden bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                <Th>N° Vendedor</Th>
                <Th>Nombre</Th>
                <Th>Teléfono</Th>
                <Th>Cuenta</Th>
                <Th>Estado</Th>
                <Th right>Com. fija</Th>
                <Th right>Aperturas</Th>
                <Th right>Total recibido</Th>
                <Th right>Com. autorizada</Th>
                <Th right>Com. pagada</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {store.salesReps.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center text-[var(--text-muted)] text-sm">
                    Sin vendedores registrados
                  </td>
                </tr>
              )}
              {store.salesReps.map((rep) => {
                const comms = store.commissions.filter((c) => c.salesRepId === rep.id);
                const transfers = store.transfers.filter((t) => t.sellerId === rep.id && t.status === "verified");
                const totalReceived  = transfers.reduce((a, t) => a + t.amount, 0);
                const authorizedComm = comms.filter((c) => c.status === "authorized").reduce((a, c) => a + c.amount, 0);
                const paidComm       = comms.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);
                return (
                  <tr key={rep.id}
                    className={`group border-b-[0.5px] border-[var(--border)] last:border-b-0 transition-colors cursor-pointer ${rep.active ? "hover:bg-[var(--bg-elevated)]" : "opacity-50 hover:bg-[var(--bg-elevated)]"}`}
                    onClick={() => setSelectedRepId(rep.id)}>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[var(--accent)]">{rep.sellerNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-medium text-[var(--text-primary)]">{rep.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[11px] text-[var(--text-muted)]">{rep.phone ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[160px]">
                      <p className="font-mono text-[10px] text-[var(--text-muted)] truncate">{rep.accountNumber ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border-[0.5px] ${
                        rep.active
                          ? "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
                          : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
                      }`}>
                        {rep.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs font-semibold text-[var(--accent)] tabular-nums">
                        ${rep.fixedCommissionAmount.toLocaleString("es-MX")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-[var(--text-primary)] tabular-nums">{transfers.length}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-[var(--text-primary)] tabular-nums">
                        ${totalReceived.toLocaleString("es-MX")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs tabular-nums text-[var(--accent)]">
                        {authorizedComm > 0 ? `$${authorizedComm.toLocaleString("es-MX")}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs tabular-nums text-[var(--text-muted)]">
                        {paidComm > 0 ? `$${paidComm.toLocaleString("es-MX")}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[var(--accent)]">
                        Ver →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["pending", "authorized", "paid", "cancelled"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <BadgeEl meta={COMMISSION_META[s]} /> {COMMISSION_META[s].label}
          </span>
        ))}
      </div>

      {selectedRepId && (
        <SalesRepDrawer repId={selectedRepId} onClose={() => setSelectedRepId(null)} />
      )}
    </div>
  );
}
