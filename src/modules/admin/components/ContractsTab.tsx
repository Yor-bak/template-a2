"use client";
import { useState } from "react";
import type { AdminClient, ContractDocStatus } from "@/types/user";
import { useAdminStore, CONTRACT_DOC_STATUS_LABELS } from "@/store/adminStore";
import { S, SectionTitle, BadgeEl, CONTRACT_DOC_META, fmtDate, fmtDateTime } from "./adminUi";

const FILE_TYPES: { ext: string; mime: string }[] = [
  { ext: "PDF",  mime: "application/pdf" },
  { ext: "JPG",  mime: "image/jpeg"      },
  { ext: "JPEG", mime: "image/jpeg"      },
  { ext: "PNG",  mime: "image/png"       },
];

const EMPTY_FORM = {
  fileName: "",
  fileType: "application/pdf",
  status: "pending_signature" as ContractDocStatus,
  startDate: "",
  endDate: "",
  signedAt: "",
};

export function ContractsTab({ client }: { client: AdminClient }) {
  const store = useAdminStore();
  const [showUpload, setShowUpload] = useState(false);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const contracts = [...client.contracts].sort((a, b) => b.version - a.version);

  function resetForm() {
    setForm(EMPTY_FORM);
    setError("");
    setShowUpload(false);
    setReplaceId(null);
  }

  function handleSubmit() {
    if (!form.fileName.trim()) { setError("El nombre del archivo es obligatorio."); return; }
    if (!form.startDate)       { setError("La fecha de inicio es obligatoria."); return; }
    if (!form.endDate)         { setError("La fecha de vencimiento es obligatoria."); return; }

    const payload = {
      fileName: form.fileName.trim(),
      fileType: form.fileType,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      signedAt: form.status === "signed" && form.signedAt ? form.signedAt : undefined,
      fileUrl: undefined, // mock — no real upload
    };

    if (replaceId) {
      store.replaceContract(client.id, replaceId, payload);
    } else {
      store.addContract(client.id, payload);
    }
    resetForm();
  }

  function handleStatusChange(contractId: string, status: ContractDocStatus) {
    const signedAt = status === "signed" ? new Date().toISOString().split("T")[0] : undefined;
    store.updateContractStatus(client.id, contractId, status, signedAt);
  }

  const isEditing = showUpload || replaceId !== null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle>Contratos digitales</SectionTitle>
        {!isEditing && (
          <button className={S.btnGhost} onClick={() => setShowUpload(true)}>
            + Cargar contrato
          </button>
        )}
      </div>

      {/* Upload / replace form */}
      {isEditing && (
        <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl p-4 space-y-4">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.14em]">
            {replaceId ? "Reemplazar contrato (nueva versión)" : "Nuevo contrato"}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={S.label}>Nombre del archivo *</label>
              <input className={S.input} value={form.fileName}
                onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.value }))}
                placeholder="contrato_anual_2026.pdf" />
            </div>
            <div>
              <label className={S.label}>Tipo de archivo</label>
              <select className={S.select} value={form.fileType}
                onChange={(e) => setForm((f) => ({ ...f, fileType: e.target.value }))}>
                {FILE_TYPES.map((t) => (
                  <option key={t.mime + t.ext} value={t.mime}>{t.ext}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={S.label}>Estado inicial</label>
              <select className={S.select} value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ContractDocStatus }))}>
                {(Object.entries(CONTRACT_DOC_STATUS_LABELS) as [ContractDocStatus, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={S.label}>Fecha de inicio *</label>
              <input type="date" className={S.input} value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className={S.label}>Fecha de vencimiento *</label>
              <input type="date" className={S.input} value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            {form.status === "signed" && (
              <div className="col-span-2">
                <label className={S.label}>Fecha de firma</label>
                <input type="date" className={S.input} value={form.signedAt}
                  onChange={(e) => setForm((f) => ({ ...f, signedAt: e.target.value }))} />
              </div>
            )}
          </div>

          <p className="text-[10px] text-[var(--text-muted)]">
            El archivo se cargará como referencia mock. En producción conectar con almacenamiento real.
          </p>

          {error && (
            <p className="text-[var(--danger)] text-xs bg-[var(--bg-elevated)] border-[0.5px] border-[var(--danger)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button className={S.btnPrimary} onClick={handleSubmit}>
              {replaceId ? "Reemplazar" : "Guardar"}
            </button>
            <button className={S.btnSecondary} onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Contract list */}
      {contracts.length === 0 && !isEditing && (
        <p className="text-xs text-[var(--text-muted)]">Sin contratos registrados.</p>
      )}

      <div className="space-y-3">
        {contracts.map((c, idx) => {
          const isLatest = idx === 0;
          const isExpiredByDate = new Date(c.endDate + "T00:00:00") < new Date();
          return (
            <div key={c.id}
              className={`rounded-xl border-[0.5px] border-[var(--border)] overflow-hidden ${isLatest ? "bg-[var(--bg-elevated)]" : "bg-[var(--bg-surface)] opacity-75"}`}>
              {/* Contract header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-[var(--border)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">v{c.version}</span>
                  {isLatest && (
                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-muted)] border-[0.5px] border-[var(--accent)] rounded px-1.5 py-0.5">
                      Actual
                    </span>
                  )}
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{c.fileName}</p>
                </div>
                <BadgeEl meta={CONTRACT_DOC_META[c.status]} />
              </div>

              {/* Contract details */}
              <div className="px-4 py-3 space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <Row label="Tipo">{c.fileType.split("/")[1]?.toUpperCase() ?? c.fileType}</Row>
                  <Row label="Versión">{String(c.version)}</Row>
                  <Row label="Inicio">{fmtDate(c.startDate)}</Row>
                  <Row label="Vencimiento">
                    <span className={isExpiredByDate && c.status !== "expired" ? "text-[var(--danger)]" : ""}>
                      {fmtDate(c.endDate)}
                    </span>
                  </Row>
                  {c.signedAt && <Row label="Firmado">{fmtDate(c.signedAt)}</Row>}
                  <Row label="Cargado">{fmtDateTime(c.uploadedAt)}</Row>
                </div>

                {isLatest && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Status changer */}
                    <select
                      className="bg-[var(--bg-base)] border-[0.5px] border-[var(--border)] rounded text-[11px] text-[var(--text-primary)] px-2 py-1 focus:outline-none focus:border-[var(--accent)]"
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value as ContractDocStatus)}>
                      {(Object.entries(CONTRACT_DOC_STATUS_LABELS) as [ContractDocStatus, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    {c.fileUrl && (
                      <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className={S.btnGhost}>
                        Ver
                      </a>
                    )}
                    {c.fileUrl && (
                      <a href={c.fileUrl} download={c.fileName} className={S.btnGhost}>
                        Descargar
                      </a>
                    )}
                    {!isEditing && (
                      <button className={S.btnGhost} onClick={() => { setReplaceId(c.id); setForm((f) => ({ ...f, startDate: c.startDate, endDate: c.endDate })); }}>
                        Reemplazar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{label}</span>
      <span className="text-[10px] text-[var(--text-primary)] text-right">{children}</span>
    </div>
  );
}
