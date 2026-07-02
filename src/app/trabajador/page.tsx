"use client";
import { useState, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useEquipo } from "@/contexts/EquipoContext";
import type { Worker, WorkerTask, TaskStatus, OpsTaskStatus } from "@/types/equipo";
import { TASK_STATUS_LABELS, OPS_TASK_STATUS_LABELS } from "@/types/equipo";
import { formatCurrency } from "@/lib/utils";
import {
  LogOut, ClipboardList, CheckCircle2, XCircle, Clock,
  Receipt, Phone, ExternalLink, Home, ListChecks,
  CalendarClock, AlertTriangle,
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

const taskStatusStyle = (status: TaskStatus): CSSProperties => ({
  assigned:   { background: "color-mix(in srgb, var(--ds-accent) 12%, transparent)", color: "var(--ds-accent)", borderColor: "color-mix(in srgb, var(--ds-accent) 25%, transparent)" },
  completed:  { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)", borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
  incomplete: { background: "color-mix(in srgb, var(--ds-error) 12%, transparent)", color: "var(--ds-error)", borderColor: "color-mix(in srgb, var(--ds-error) 25%, transparent)" },
}[status]);

const opsStatusStyle = (status: OpsTaskStatus): CSSProperties => ({
  pending:   { background: "color-mix(in srgb, var(--ds-warning) 12%, transparent)", color: "var(--ds-warning)", borderColor: "color-mix(in srgb, var(--ds-warning) 25%, transparent)" },
  completed: { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)", borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
  overdue:   { background: "color-mix(in srgb, var(--ds-error) 12%, transparent)", color: "var(--ds-error)", borderColor: "color-mix(in srgb, var(--ds-error) 25%, transparent)" },
}[status]);

type TabId = "inicio" | "clientes" | "tareas" | "recibos";

export default function WorkerPortalPage() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>("inicio");
  const { store, setTaskStatus, setOpsTaskStatus, createInvoiceForTask } = useEquipo();
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace("/trabajador/login"); return; }
    const found = store.workers.find((w) => w.id === session.workerId && w.isActive);
    if (!found) { localStorage.removeItem(WORKER_SESSION_KEY); router.replace("/trabajador/login"); return; }
    setWorker(found);
    setReady(true);
  }, [store.workers, router]);

  if (!ready || !worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ds-bg)]">
        <div className="w-8 h-8 border-4 border-[var(--ds-border)] border-t-[var(--ds-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  const myTasks = store.tasks.filter((t) => t.workerId === worker.id).sort((a, b) => {
    const order: Record<TaskStatus, number> = { assigned: 0, incomplete: 1, completed: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
  });

  const myOpsTasks = store.opsTasks.filter((t) => t.workerId === worker.id).sort((a, b) => {
    const order: Record<OpsTaskStatus, number> = { pending: 0, overdue: 1, completed: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
  });

  const myInvoices = store.invoices.filter((inv) => inv.workerId === worker.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const countAssigned  = myTasks.filter((t) => t.status === "assigned").length;
  const countPendingOps = myOpsTasks.filter((t) => t.status === "pending").length;
  const countOverdue   = myOpsTasks.filter((t) => t.status === "overdue").length;

  const initials = worker.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  function handleLogout() {
    localStorage.removeItem(WORKER_SESSION_KEY);
    router.push("/trabajador/login");
  }

  // ── Section renderers ──────────────────────────────────────────────────────

  function renderInicio() {
    const nextClient = myTasks.find((t) => t.status === "assigned");
    return (
      <div className="px-4 pt-5 max-w-lg mx-auto space-y-5 pb-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-[var(--ds-accent)]" />
            <p className="text-xl font-extrabold text-[var(--ds-accent)]">{countAssigned}</p>
            <p className="text-[10px] text-[var(--ds-text-muted)] font-medium mt-0.5">Clientes</p>
          </div>
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3 text-center">
            <ListChecks className="w-4 h-4 mx-auto mb-1 text-[var(--ds-warning)]" />
            <p className="text-xl font-extrabold text-[var(--ds-warning)]">{countPendingOps}</p>
            <p className="text-[10px] text-[var(--ds-text-muted)] font-medium mt-0.5">Tareas</p>
          </div>
          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl p-3 text-center">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-[var(--ds-error)]" />
            <p className="text-xl font-extrabold text-[var(--ds-error)]">{countOverdue}</p>
            <p className="text-[10px] text-[var(--ds-text-muted)] font-medium mt-0.5">Vencidas</p>
          </div>
        </div>

        {/* Next client */}
        {nextClient && (
          <div>
            <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wide mb-2">Próximo cliente</p>
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-accent)]/30 rounded-2xl p-4" style={{ background: "color-mix(in srgb, var(--ds-accent) 5%, var(--ds-surface))" }}>
              <p className="font-bold text-[var(--ds-text)]">{nextClient.clientName}</p>
              <p className="text-sm text-[var(--ds-text-muted)] mt-0.5">{nextClient.serviceName}{nextClient.serviceAmount ? ` · ${formatCurrency(nextClient.serviceAmount)}` : ""}</p>
              {nextClient.dueDate && <p className="text-xs text-[var(--ds-accent)] mt-1 font-medium"><CalendarClock className="w-3 h-3 inline mr-1" />{nextClient.dueDate}</p>}
            </div>
          </div>
        )}

        {/* Pending ops tasks preview */}
        {countPendingOps > 0 && (
          <div>
            <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wide mb-2">Tareas pendientes</p>
            <div className="space-y-2">
              {myOpsTasks.filter((t) => t.status === "pending").slice(0, 3).map((t) => (
                <div key={t.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[var(--ds-warning)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--ds-text)] truncate">{t.title}</p>
                    {t.dueDate && <p className="text-[11px] text-[var(--ds-text-muted)]">Vence: {t.dueDate}</p>}
                  </div>
                </div>
              ))}
              {countPendingOps > 3 && (
                <button onClick={() => setTab("tareas")} className="w-full text-center text-xs text-[var(--ds-accent)] hover:underline py-1">
                  Ver {countPendingOps - 3} más →
                </button>
              )}
            </div>
          </div>
        )}

        {countAssigned === 0 && countPendingOps === 0 && (
          <div className="text-center py-12 text-[var(--ds-text-muted)]">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">Todo al día</p>
            <p className="text-sm mt-1">No tienes clientes ni tareas pendientes.</p>
          </div>
        )}
      </div>
    );
  }

  function renderClientes() {
    return (
      <div className="px-4 pt-5 max-w-lg mx-auto pb-6">
        <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wide mb-3">Mis clientes por atender ({myTasks.length})</p>
        {myTasks.length === 0 ? (
          <div className="text-center py-14 text-[var(--ds-text-muted)]">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Sin clientes asignados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.map((task) => {
              const invoice = task.invoiceId ? store.invoices.find((inv) => inv.id === task.invoiceId) : null;
              return (
                <div key={task.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[var(--ds-text)] text-sm">{task.clientName}</p>
                        <span style={taskStatusStyle(task.status)} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border">{TASK_STATUS_LABELS[task.status]}</span>
                      </div>
                      <p className="text-sm text-[var(--ds-text-muted)] mt-0.5">
                        {task.serviceName}{task.serviceAmount ? <span className="font-semibold text-[var(--ds-text)]"> · {formatCurrency(task.serviceAmount)}</span> : null}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-[var(--ds-text-muted)]">
                    {task.clientPhone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /><a href={`tel:${task.clientPhone}`} className="hover:text-[var(--ds-accent)]">{task.clientPhone}</a></div>}
                    {task.dueDate && <p>Fecha: <span className="font-medium text-[var(--ds-text)]">{task.dueDate}</span></p>}
                    {task.notes && <p className="italic">"{task.notes}"</p>}
                    {task.completedAt && <p className="text-[var(--ds-success)]">Completada el {new Date(task.completedAt).toLocaleDateString("es-MX")}</p>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--ds-border)] flex items-center gap-2 flex-wrap">
                    {task.status === "assigned" && (
                      <button onClick={() => setTaskStatus(task.id, "completed")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ds-success)] text-white text-xs font-semibold hover:opacity-90">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Marcar completada
                      </button>
                    )}
                    {task.status === "completed" && (
                      <button onClick={() => setTaskStatus(task.id, "incomplete")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-xs hover:bg-[var(--ds-surface-muted)]">
                        <XCircle className="w-3.5 h-3.5" /> Marcar incompleta
                      </button>
                    )}
                    {task.status === "incomplete" && (
                      <button onClick={() => setTaskStatus(task.id, "assigned")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-xs hover:bg-[var(--ds-surface-muted)]">
                        <Clock className="w-3.5 h-3.5" /> Reabrir
                      </button>
                    )}
                    {task.status === "completed" && !invoice && (
                      <button onClick={() => createInvoiceForTask(task.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-accent)]/40 text-[var(--ds-accent)] text-xs font-semibold hover:bg-[var(--ds-accent)]/8">
                        <Receipt className="w-3.5 h-3.5" /> Generar recibo
                      </button>
                    )}
                    {invoice && (
                      <Link href={`/trabajador/factura/${invoice.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ds-border)] text-[var(--ds-text-muted)] text-xs hover:bg-[var(--ds-surface-muted)]">
                        <ExternalLink className="w-3.5 h-3.5" /> Ver recibo ({invoice.folio})
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderTareas() {
    const pending   = myOpsTasks.filter((t) => t.status !== "completed");
    const completed = myOpsTasks.filter((t) => t.status === "completed");

    return (
      <div className="px-4 pt-5 max-w-lg mx-auto pb-6">
        <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wide mb-3">Mis tareas ({myOpsTasks.length})</p>
        {myOpsTasks.length === 0 ? (
          <div className="text-center py-14 text-[var(--ds-text-muted)]">
            <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Sin tareas asignadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...pending, ...completed].map((t) => (
              <div key={t.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--ds-text)] text-sm">{t.title}</p>
                      <span style={opsStatusStyle(t.status)} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border">{OPS_TASK_STATUS_LABELS[t.status]}</span>
                    </div>
                    {t.description && <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">{t.description}</p>}
                    {t.dueDate && <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">Fecha límite: <span className="font-medium text-[var(--ds-text)]">{t.dueDate}</span></p>}
                    {t.completedAt && <p className="text-xs text-[var(--ds-success)] mt-0.5">Completada: {new Date(t.completedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</p>}
                  </div>
                </div>
                {t.status !== "completed" && (
                  <div className="mt-3 pt-3 border-t border-[var(--ds-border)]">
                    <button onClick={() => setOpsTaskStatus(t.id, "completed")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ds-success)] text-white text-xs font-semibold hover:opacity-90">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marcar completada
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderRecibos() {
    return (
      <div className="px-4 pt-5 max-w-lg mx-auto pb-6">
        <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wide mb-3">Mis recibos ({myInvoices.length})</p>
        {myInvoices.length === 0 ? (
          <div className="text-center py-14 text-[var(--ds-text-muted)]">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Sin recibos generados</p>
            <p className="text-xs mt-1">Genera un recibo desde la sección Clientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myInvoices.map((inv) => (
              <div key={inv.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-[var(--ds-accent)]">{inv.folio}</p>
                    <p className="font-semibold text-[var(--ds-text)] text-sm mt-0.5">{inv.clientName}</p>
                    <p className="text-xs text-[var(--ds-text-muted)]">{inv.serviceName}</p>
                    <p className="text-[11px] text-[var(--ds-text-muted)] mt-1">{new Date(inv.createdAt).toLocaleDateString("es-MX", { dateStyle: "long" })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-extrabold text-[var(--ds-success)]">{formatCurrency(inv.amount)}</p>
                    <Link href={`/trabajador/factura/${inv.id}`} className="inline-flex items-center gap-1 text-xs text-[var(--ds-accent)] hover:underline mt-1">
                      <ExternalLink className="w-3 h-3" /> Ver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Bottom nav tabs ────────────────────────────────────────────────────────

  const TABS: { id: TabId; label: string; icon: typeof Home; badge?: number }[] = [
    { id: "inicio",   label: "Inicio",    icon: Home },
    { id: "clientes", label: "Clientes",  icon: ClipboardList, badge: countAssigned > 0 ? countAssigned : undefined },
    { id: "tareas",   label: "Tareas",    icon: ListChecks,    badge: (countPendingOps + countOverdue) > 0 ? countPendingOps + countOverdue : undefined },
    { id: "recibos",  label: "Recibos",   icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[var(--ds-bg)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ background: worker.color + "33", border: `2px solid ${worker.color}` }}
        >
          <span style={{ color: worker.color }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight truncate">{worker.name}</p>
          {worker.specialty && <p className="text-[11px] text-[var(--ds-primary-fg)]/70 truncate">{worker.specialty}</p>}
        </div>
        <button onClick={handleLogout} className="p-2 rounded-lg text-[var(--ds-primary-fg)]/70 hover:text-[var(--ds-primary-fg)] hover:bg-[var(--ds-primary-fg)]/10" aria-label="Cerrar sesión">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "inicio"   && renderInicio()}
        {tab === "clientes" && renderClientes()}
        {tab === "tareas"   && renderTareas()}
        {tab === "recibos"  && renderRecibos()}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--ds-surface)] border-t border-[var(--ds-border)] flex items-stretch" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors ${tab === t.id ? "text-[var(--ds-accent)]" : "text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"}`}>
            <div className="relative">
              <t.icon className="w-5 h-5" />
              {t.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--ds-warning)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {t.badge > 9 ? "9+" : t.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
