"use client";
import { useState, useRef } from "react";
import type { AdminClient, ContractDocStatus } from "@/types/user";
import { useAdminStore, CONTRACT_DOC_STATUS_LABELS } from "@/store/adminStore";
import { S, SectionTitle, BadgeEl, CONTRACT_DOC_META, fmtDate, fmtDateTime } from "./adminUi";
import {
  saveContractFile,
  createContractObjectURL,
  downloadContractFile,
  MAX_CONTRACT_FILE_SIZE,
  formatFileSize,
} from "@/lib/contractFileStorage";

// ── Upload form state ─────────────────────────────────────────────────────────

interface UploadForm {
  file: File | null;
  startDate: string;
  endDate: string;
  signedAt: string;
  status: ContractDocStatus;
}

const EMPTY_UPLOAD: UploadForm = {
  file: null,
  startDate: "",
  endDate: "",
  signedAt: "",
  status: "signed",
};

// ── Validation ────────────────────────────────────────────────────────────────

function validatePdfFile(file: File | null): string {
  if (!file)                             return "Selecciona un archivo PDF.";
  if (file.type !== "application/pdf")   return "Solo se aceptan archivos PDF (application/pdf).";
  if (file.size === 0)                   return "El archivo está vacío.";
  if (file.size > MAX_CONTRACT_FILE_SIZE) return `El archivo supera el tamaño permitido (${formatFileSize(MAX_CONTRACT_FILE_SIZE)}).`;
  return "";
}

// ── Viewer / downloader helpers (async, fire-and-forget) ──────────────────────

function openContractInNewTab(storageKey: string, fileName: string) {
  if (!storageKey) return;
  createContractObjectURL(storageKey).then((url) => {
    if (!url) { alert("No fue posible leer el contrato."); return; }
    const tab = window.open(url, "_blank");
    // Revoke after a generous delay so the tab has time to load
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    if (!tab) alert("El navegador bloqueó la nueva pestaña. Permite pop-ups para este sitio.");
  }).catch(() => alert("No fue posible leer el contrato."));
}

function downloadContract(storageKey: string, fileName: string) {
  if (!storageKey) return;
  downloadContractFile(storageKey, fileName).catch(() => alert("No fue posible descargar el contrato."));
}

// ── Upload form component ─────────────────────────────────────────────────────

function UploadForm({
  replaceMode,
  initialDates,
  clientId,
  onSave,
  onCancel,
}: {
  replaceMode: boolean;
  initialDates?: { startDate: string; endDate: string };
  clientId: string;
  onSave: (doc: {
    fileName: string;
    fileType: string;
    status: ContractDocStatus;
    startDate: string;
    endDate: string;
    signedAt?: string;
    fileSize: number;
    storageKey: string;
  }) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<UploadForm>({
    ...EMPTY_UPLOAD,
    startDate: initialDates?.startDate ?? "",
    endDate:   initialDates?.endDate   ?? "",
  });
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);

  function set<K extends keyof UploadForm>(k: K, v: UploadForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    set("file", file);
  }

  async function handleSave() {
    const fileErr = validatePdfFile(form.file);
    if (fileErr)            { setError(fileErr); return; }
    if (!form.startDate)    { setError("La fecha de inicio es obligatoria."); return; }
    if (!form.endDate)      { setError("La fecha de vencimiento es obligatoria."); return; }

    setSaving(true);
    try {
      const storageKey = await saveContractFile(form.file!);
      onSave({
        fileName:  form.file!.name,
        fileType:  form.file!.type,
        status:    form.status,
        startDate: form.startDate,
        endDate:   form.endDate,
        signedAt:  form.status === "signed" && form.signedAt ? form.signedAt : undefined,
        fileSize:  form.file!.size,
        storageKey,
      });
    } catch {
      setError("No fue posible guardar el contrato. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] p-4 space-y-4">
      <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.14em]">
        {replaceMode ? "Reemplazar contrato (nueva versión)" : "Cargar contrato firmado"}
      </p>

      {/* File input */}
      <div>
        <label className={S.label}>Archivo PDF *</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={saving}
          className="w-full text-center border border-dashed border-[var(--border-strong)] rounded-[var(--radius-surface)] px-4 py-5 hover:border-[var(--accent)] transition-colors"
        >
          {form.file ? (
            <span className="text-xs text-[var(--text-primary)]">
              {form.file.name} ({formatFileSize(form.file.size)})
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Haz clic para elegir un PDF</span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          Solo PDF · máx. {formatFileSize(MAX_CONTRACT_FILE_SIZE)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={S.label}>Estado inicial</label>
          <select className={S.select} value={form.status}
            onChange={(e) => set("status", e.target.value as ContractDocStatus)}>
            {(Object.entries(CONTRACT_DOC_STATUS_LABELS) as [ContractDocStatus, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {form.status === "signed" && (
          <div>
            <label className={S.label}>Fecha de firma</label>
            <input type="date" className={S.input} value={form.signedAt}
              onChange={(e) => set("signedAt", e.target.value)} />
          </div>
        )}
        <div>
          <label className={S.label}>Inicio de vigencia *</label>
          <input type="date" className={S.input} value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)} />
        </div>
        <div>
          <label className={S.label}>Vencimiento *</label>
          <input type="date" className={S.input} value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)} />
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-muted)]">
        El contrato se guarda en este dispositivo para la versión actual.
        La sincronización definitiva requiere backend.
      </p>

      {error && (
        <p className="text-[var(--danger)] text-xs">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          className={S.btnPrimary}
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Guardando…" : replaceMode ? "Reemplazar" : "Guardar contrato"}
        </button>
        <button className={S.btnSecondary} onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ContractsTab({ client }: { client: AdminClient }) {
  const store = useAdminStore();
  const [showUpload, setShowUpload] = useState(false);
  const [replaceId, setReplaceId]   = useState<string | null>(null);
  const isEditing = showUpload || replaceId !== null;

  const contracts = [...client.contracts].sort((a, b) => b.version - a.version);

  function handleStatusChange(contractId: string, status: ContractDocStatus) {
    const signedAt = status === "signed" ? new Date().toISOString().split("T")[0] : undefined;
    store.updateContractStatus(client.id, contractId, status, signedAt);
  }

  function handleSave(doc: {
    fileName: string;
    fileType: string;
    status: ContractDocStatus;
    startDate: string;
    endDate: string;
    signedAt?: string;
    fileSize: number;
    storageKey: string;
  }) {
    if (replaceId) {
      store.replaceContract(client.id, replaceId, doc);
    } else {
      store.addContract(client.id, doc);
    }
    setShowUpload(false);
    setReplaceId(null);
  }

  function openReplace(contractId: string, c: { startDate: string; endDate: string }) {
    setReplaceId(contractId);
    setShowUpload(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle>Contratos firmados</SectionTitle>
        {!isEditing && (
          <button className={S.btnGhost} onClick={() => setShowUpload(true)}>
            + Cargar contrato
          </button>
        )}
      </div>

      {/* Upload form */}
      {isEditing && (
        <UploadForm
          replaceMode={replaceId !== null}
          initialDates={
            replaceId
              ? (() => {
                  const c = contracts.find((x) => x.id === replaceId);
                  return c ? { startDate: c.startDate, endDate: c.endDate } : undefined;
                })()
              : undefined
          }
          clientId={client.id}
          onSave={handleSave}
          onCancel={() => { setShowUpload(false); setReplaceId(null); }}
        />
      )}

      {/* Empty state */}
      {contracts.length === 0 && !isEditing && (
        <p className="text-xs text-[var(--text-muted)]">Sin contratos registrados.</p>
      )}

      {/* Contract list */}
      <div className="space-y-3">
        {contracts.map((c, idx) => {
          const isLatest        = idx === 0;
          const isExpiredByDate = new Date(c.endDate + "T00:00:00") < new Date();
          const hasFile         = !!c.storageKey;

          return (
            <div
              key={c.id}
              className={`rounded-[var(--radius-surface)] border-[0.5px] border-[var(--border)] overflow-hidden ${
                isLatest ? "bg-[var(--bg-elevated)]" : "bg-[var(--bg-surface)] opacity-75"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-[var(--border)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">v{c.version}</span>
                  {isLatest && (
                    <span className="text-[10px] font-semibold text-[var(--accent)]">
                      Actual
                    </span>
                  )}
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{c.fileName}</p>
                  {!hasFile && (
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                      sin archivo
                    </span>
                  )}
                </div>
                <BadgeEl meta={CONTRACT_DOC_META[c.status]} />
              </div>

              {/* Details */}
              <div className="px-4 py-3 space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {c.fileSize && (
                    <Row label="Tamaño">{formatFileSize(c.fileSize)}</Row>
                  )}
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
                      onChange={(e) => handleStatusChange(c.id, e.target.value as ContractDocStatus)}
                    >
                      {(Object.entries(CONTRACT_DOC_STATUS_LABELS) as [ContractDocStatus, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>

                    {/* View / Download — only if file exists in IndexedDB */}
                    {hasFile && (
                      <button
                        className={S.btnGhost}
                        onClick={() => openContractInNewTab(c.storageKey!, c.fileName)}
                      >
                        Ver
                      </button>
                    )}
                    {hasFile && (
                      <button
                        className={S.btnGhost}
                        onClick={() => downloadContract(c.storageKey!, c.fileName)}
                      >
                        Descargar
                      </button>
                    )}

                    {/* Legacy fileUrl fallback (mock data) */}
                    {!hasFile && c.fileUrl && (
                      <>
                        <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className={S.btnGhost}>Ver</a>
                        <a href={c.fileUrl} download={c.fileName} className={S.btnGhost}>Descargar</a>
                      </>
                    )}

                    {!isEditing && (
                      <button
                        className={S.btnGhost}
                        onClick={() => openReplace(c.id, { startDate: c.startDate, endDate: c.endDate })}
                      >
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
