"use client";
import { useState, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useEquipo } from "@/contexts/EquipoContext";
import type { Worker, WorkerTask, TaskStatus } from "@/types/equipo";
import { TASK_STATUS_LABELS } from "@/types/equipo";
import { formatCurrency } from "@/lib/utils";
import {
  LogOut, ClipboardList, CheckCircle2, XCircle, Clock,
  Receipt, Phone, ExternalLink,
} from "lucide-react";
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

const taskStatusStyle = (status: TaskStatus): CSSProperties => {
  const m: Record<TaskStatus, CSSProperties> = {
    assigned:   { background: "color-mix(in srgb, var(--ds-accent) 12%, transparent)", color: "var(--ds-accent)", borderColor: "color-mix(in srgb, var(--ds-accent) 25%, transparent)" },
    completed:  { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)", borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
    incomplete: { background: "color-mix(in srgb, var(--ds-error) 12%, transparent)", color: "var(--ds-error)", borderColor: "color-mix(in srgb, var(--ds-error) 25%, transparent)" },
  };
  return m[status];
};

export default function WorkerPortalPage() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const { store, setTaskStatus, createInvoiceForTask } = useEquipo();
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/trabajador/login");
      return;
    }
    const found = store.workers.find((w) => w.id === session.workerId && w.isActive);
    if (!found) {
      localStorage.removeItem(WORKER_SESSION_KEY);
      router.replace("/trabajador/login");
      return;
    }
    setWorker(found);
    setReady(true);
  }, [store.workers, router]);

  function handleLogout() {
    localStorage.removeItem(WORKER_SESSION_KEY);
    router.push("/trabajador/login");
  }

  function handleGenerateReceipt(task: WorkerTask) {
    createInvoiceForTask(task.id);
  }

  if (!ready || !worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ds-bg)]">
        <div className="w-8 h-8 border-4 border-[var(--ds-border)] border-t-[var(--ds-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  const myTasks = store.tasks
    .filter((t) => t.workerId === worker.id)
    .sort((a, b) => {
      // Sort: assigned first, then incomplete, then completed; within each by dueDate
      const order: Record<TaskStatus, number> = { assigned: 0, incomplete: 1, completed: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
    });

  const countAssigned = myTasks.filter((t) => t.status === "assigned").length;
  const countCompleted = myTasks.filter((t) => t.status === "completed").length;
  const countIncomplete = myTasks.filter((t) => t.status === "incomplete").length;

  const initials = worker.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--ds-bg)] pb-10">
      {/* Header */}
      <header className="bg-[var(--ds-primary)] text-white px-4 py-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: worker.color + "33", border: `2px solid ${worker.color}` }}
        >
          <span style={{ color: worker.color }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight truncate">{worker.name}</p>
          {worker.specialty && <p className="text-[11px] text-white/70 truncate">{worker.specialty}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 max-w-lg mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2 mt-4 mb-5">
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-[var(--ds-accent)]" />
            <p className="text-xl font-extrabold text-[var(--ds-accent)]">{countAssigned}</p>
            <p className="text-[10px] text-[var(--ds-text-muted)] font-medium mt-0.5">Asignadas</p>
          </div>
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-[var(--ds-success)]" />
            <p className="text-xl font-extrabold text-[var(--ds-success)]">{countCompleted}</p>
            <p className="text-[10px] text-[var(--ds-text-muted)] font-medium mt-0.5">Completadas</p>
          </div>
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3 text-center">
            <XCircle className="w-5 h-5 mx-auto mb-1 text-[var(--ds-error)]" />
            <p className="text-xl font-extrabold text-[var(--ds-error)]">{countIncomplete}</p>
            <p className="text-[10px] text-[var(--ds-text-muted)] font-medium mt-0.5">Sin completar</p>
          </div>
        </div>

        {/* Tasks */}
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-[var(--ds-text-muted)]" />
          <h2 className="font-bold text-[var(--ds-text)] text-sm">Mis tareas</h2>
          <span className="ml-auto text-xs text-[var(--ds-text-muted)]">{myTasks.length} total</span>
        </div>

        {myTasks.length === 0 ? (
          <div className="text-center py-12 text-[var(--ds-text-muted)]">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No tienes tareas asignadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.map((task) => {
              const invoice = task.invoiceId
                ? store.invoices.find((inv) => inv.id === task.invoiceId)
                : null;

              return (
                <div
                  key={task.id}
                  className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[var(--ds-text)] text-sm">{task.clientName}</p>
                        <span
                          style={taskStatusStyle(task.status)}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
                        >
                          {TASK_STATUS_LABELS[task.status]}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--ds-text-muted)] mt-0.5">
                        {task.serviceName}
                        {task.serviceAmount ? (
                          <span className="font-semibold text-[var(--ds-text)]"> · {formatCurrency(task.serviceAmount)}</span>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-2 space-y-1 text-xs text-[var(--ds-text-muted)]">
                    {task.clientPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <a href={`tel:${task.clientPhone}`} className="hover:text-[var(--ds-accent)] transition-colors">
                          {task.clientPhone}
                        </a>
                      </div>
                    )}
                    {task.dueDate && (
                      <p>Fecha: <span className="font-medium text-[var(--ds-text)]">{task.dueDate}</span></p>
                    )}
                    {task.notes && (
                      <p className="italic">"{task.notes}"</p>
                    )}
                    {task.completedAt && (
                      <p className="text-[var(--ds-success)]">
                        Completada el {new Date(task.completedAt).toLocaleDateString("es-MX")}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-[var(--ds-border)] flex items-center gap-2 flex-wrap">
                    {task.status === "assigned" && (
                      <button
                        onClick={() => setTaskStatus(task.id, "completed")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ds-success)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Marcar completada
                      </button>
                    )}
                    {task.status === "completed" && (
                      <button
                        onClick={() => setTaskStatus(task.id, "incomplete")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-xs hover:bg-[var(--ds-surface-muted)] transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Marcar incompleta
                      </button>
                    )}
                    {task.status === "incomplete" && (
                      <button
                        onClick={() => setTaskStatus(task.id, "assigned")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-xs hover:bg-[var(--ds-surface-muted)] transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Reabrir tarea
                      </button>
                    )}

                    {/* Receipt */}
                    {task.status === "completed" && !invoice && (
                      <button
                        onClick={() => handleGenerateReceipt(task)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-accent)]/40 text-[var(--ds-accent)] text-xs font-semibold hover:bg-[var(--ds-accent)]/8 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Generar recibo
                      </button>
                    )}
                    {invoice && (
                      <Link
                        href={`/trabajador/factura/${invoice.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-xs hover:bg-[var(--ds-surface-muted)] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver recibo ({invoice.folio})
                      </Link>
                    )}
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
