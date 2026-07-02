"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEquipo } from "@/contexts/EquipoContext";
import type { WorkerInvoice, WorkerTask } from "@/types/equipo";
import { TASK_STATUS_LABELS } from "@/types/equipo";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Printer, AlertCircle } from "lucide-react";
import Link from "next/link";

const WORKER_SESSION_KEY = "template-a2-worker-session";

function getSession(): { workerId: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as { workerId: string }) : null;
  } catch {
    return null;
  }
}

export default function FacturaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { store } = useEquipo();

  const [invoice, setInvoice] = useState<WorkerInvoice | null>(null);
  const [task, setTask] = useState<WorkerTask | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/trabajador/login");
      return;
    }

    const found = store.invoices.find((inv) => inv.id === params.id);
    if (!found) {
      setError("Recibo no encontrado.");
      setReady(true);
      return;
    }

    // Workers can only see their own invoices; dashboard can open any (no session restriction there)
    // Here we check if the logged-in worker owns this invoice
    if (found.workerId !== session.workerId) {
      setError("No tienes permiso para ver este recibo.");
      setReady(true);
      return;
    }

    const relatedTask = store.tasks.find((t) => t.id === found.taskId) ?? null;
    setInvoice(found);
    setTask(relatedTask);
    setReady(true);
  }, [store.invoices, store.tasks, params.id, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ds-bg)]">
        <div className="w-8 h-8 border-4 border-[var(--ds-border)] border-t-[var(--ds-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--ds-bg)] px-4">
        <div className="flex items-center gap-3 text-[var(--ds-error)]">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
        <Link href="/trabajador" className="text-sm text-[var(--ds-accent)] hover:underline">
          Volver al portal
        </Link>
      </div>
    );
  }

  if (!invoice) return null;

  const createdDate = new Date(invoice.createdAt).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-card {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[var(--ds-bg)] py-6 px-4">
        {/* Actions bar */}
        <div className="no-print flex items-center gap-3 mb-6 max-w-lg mx-auto">
          <Link
            href="/trabajador"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="ml-auto">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Receipt card */}
        <div className="receipt-card max-w-lg mx-auto bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 mb-3">
                  <span className="text-white font-extrabold text-sm">DS</span>
                </div>
                <h1 className="text-lg font-extrabold leading-tight">Clínica Dental Sonrisa</h1>
                <p className="text-white/70 text-xs mt-0.5">Recibo de servicio</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold">{invoice.folio}</p>
                <p className="text-white/70 text-xs mt-0.5">{createdDate}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Trabajador */}
            <section>
              <p className="text-[10px] font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-2">Trabajador</p>
              <p className="font-semibold text-[var(--ds-text)]">{invoice.workerName}</p>
            </section>

            <div className="border-t border-[var(--ds-border)]" />

            {/* Cliente y servicio */}
            <section className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-1">Cliente</p>
                <p className="font-semibold text-[var(--ds-text)]">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-1">Servicio</p>
                <p className="font-semibold text-[var(--ds-text)]">{invoice.serviceName}</p>
              </div>
            </section>

            {/* Task info */}
            {task && (
              <>
                <div className="border-t border-[var(--ds-border)]" />
                <section className="grid grid-cols-2 gap-4">
                  {task.dueDate && (
                    <div>
                      <p className="text-[10px] font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-1">Fecha de servicio</p>
                      <p className="text-sm text-[var(--ds-text)]">{task.dueDate}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-1">Estado</p>
                    <p className="text-sm text-[var(--ds-text)]">{TASK_STATUS_LABELS[task.status]}</p>
                  </div>
                  {task.notes && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-1">Notas</p>
                      <p className="text-sm text-[var(--ds-text-muted)] italic">"{task.notes}"</p>
                    </div>
                  )}
                </section>
              </>
            )}

            <div className="border-t border-[var(--ds-border)]" />

            {/* Total */}
            <section className="flex items-center justify-between">
              <p className="font-bold text-[var(--ds-text)]">Total</p>
              <p className="text-2xl font-extrabold text-[var(--ds-success)]">{formatCurrency(invoice.amount)}</p>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--ds-border)] bg-[var(--ds-bg)] px-6 py-4">
            <p className="text-[11px] text-[var(--ds-text-muted)] text-center">
              Este recibo es un documento generado internamente · {invoice.folio}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
