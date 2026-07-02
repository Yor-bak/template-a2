"use client";
import { use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { appointments } from "@/data/appointments";
import { formatCurrency, formatShortDate, formatTime } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS } from "@/lib/constants";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { useClinicalHistory } from "@/contexts/ClinicalHistoryContext";
import { NOTE_TYPE_LABELS, PREGNANCY_LABELS, type ClinicalNoteType } from "@/types/clinical";
import { useClientData } from "@/contexts/ClientDataContext";
import {
  CARE_PLAN_STATUS_LABELS, CARE_PLAN_STATUS_COLORS,
  CLIENT_PAYMENT_STATUS_LABELS, CLIENT_PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  FOLLOW_UP_PRIORITY_LABELS, FOLLOW_UP_PRIORITY_COLORS,
  FILE_CATEGORY_LABELS, DEFAULT_TAGS,
  type CarePlanStatus, type ClientPaymentMethod, type ClientPaymentStatus,
  type FollowUpPriority, type FileCategory, type CarePlanItem,
} from "@/types/clientData";
import {
  ChevronLeft, Phone, Calendar, ShieldAlert, Plus, X,
  Tag, Trash2, CheckCircle2, Edit2, FileText, Image as ImageIcon,
  ExternalLink, ClipboardList, CreditCard, Bell, FolderOpen,
} from "lucide-react";

type Tab = "resumen" | "historial" | "planes" | "pagos" | "seguimientos" | "archivos";

const inp = "w-full border border-[var(--ds-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--ds-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 focus:border-[var(--ds-ring)] bg-[var(--ds-bg)] placeholder:text-[var(--ds-text-muted)]/40";
const lblCls = "text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide block mb-1.5";

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    getClient, updateClient,
    getClientPlans, addCarePlan, updateCarePlan, deleteCarePlan, updatePlanSession,
    getClientPayments, addPayment, updatePayment, deletePayment,
    getClientFollowUps, addFollowUp, updateFollowUp, deleteFollowUp, completeFollowUp,
    getClientFiles, addFile, deleteFile,
    carePlans: allPlans,
  } = useClientData();

  const clientMaybe = getClient(id);
  if (!clientMaybe) notFound();
  const client = clientMaybe!;

  const { config } = useClinicConfig();
  const { getClinicalHistory, getClinicalNotes, addClinicalNote } = useClinicalHistory();

  const [tab, setTab] = useState<Tab>("resumen");
  const [saved, setSaved] = useState(false);

  // ── Resumen edit ─────────────────────────────────────────────────────────────
  const [editResumen, setEditResumen] = useState(false);
  const [resumenForm, setResumenForm] = useState({ name: client.name, phone: client.phone, dateOfBirth: client.dateOfBirth ?? "", notes: client.notes ?? "" });
  const [tagInput, setTagInput] = useState("");
  const [showTagSug, setShowTagSug] = useState(false);

  function saveResumen() {
    updateClient(id, { name: resumenForm.name, phone: resumenForm.phone, dateOfBirth: resumenForm.dateOfBirth || undefined, notes: resumenForm.notes || undefined });
    setEditResumen(false);
    flash();
  }

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t || client.tags.includes(t)) return;
    updateClient(id, { tags: [...client.tags, t] });
    setTagInput("");
    setShowTagSug(false);
  }

  function removeTag(tag: string) {
    updateClient(id, { tags: client.tags.filter((t) => t !== tag) });
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ── Historial clínico ─────────────────────────────────────────────────────────
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ noteType: "consultation" as ClinicalNoteType, title: "", description: "", treatmentPerformed: "", recommendations: "", nextVisitSuggestion: "" });

  const history = getClinicalHistory(id);
  const notes = getClinicalNotes(id);

  function submitNote() {
    if (!noteForm.title.trim() || !noteForm.description.trim()) return;
    addClinicalNote({ clinicId: "clinic-001", patientId: id, noteType: noteForm.noteType, title: noteForm.title, description: noteForm.description, treatmentPerformed: noteForm.treatmentPerformed || undefined, recommendations: noteForm.recommendations || undefined, nextVisitSuggestion: noteForm.nextVisitSuggestion || undefined, createdBy: config.dentistName });
    setNoteForm({ noteType: "consultation", title: "", description: "", treatmentPerformed: "", recommendations: "", nextVisitSuggestion: "" });
    setShowNoteForm(false);
  }

  // ── Planes ───────────────────────────────────────────────────────────────────
  const plans = getClientPlans(id);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: "", description: "", status: "draft" as CarePlanStatus,
    startDate: "", estimatedEndDate: "",
    internalNotes: "", clientNotes: "",
    discount: "",
    items: [] as Array<{ name: string; quantity: string; unitPrice: string; numberOfSessions: string }>,
  });
  const [editPlanId, setEditPlanId] = useState<string | null>(null);

  const planSubtotal = useMemo(() =>
    planForm.items.reduce((s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0), 0),
    [planForm.items]
  );
  const planTotal = Math.max(0, planSubtotal - (parseFloat(planForm.discount) || 0));

  function addPlanItem() {
    setPlanForm((f) => ({ ...f, items: [...f.items, { name: "", quantity: "1", unitPrice: "", numberOfSessions: "" }] }));
  }

  function savePlan() {
    if (!planForm.name.trim() || planForm.items.length === 0) return;
    const items: CarePlanItem[] = planForm.items.map((it, i) => ({
      id: `item-${Date.now()}-${i}`,
      name: it.name,
      quantity: parseFloat(it.quantity) || 1,
      unitPrice: parseFloat(it.unitPrice) || 0,
      numberOfSessions: it.numberOfSessions ? parseInt(it.numberOfSessions) : undefined,
      completedSessions: 0,
    }));
    const discount = parseFloat(planForm.discount) || undefined;
    if (editPlanId) {
      updateCarePlan(editPlanId, { name: planForm.name, description: planForm.description || undefined, status: planForm.status, startDate: planForm.startDate || undefined, estimatedEndDate: planForm.estimatedEndDate || undefined, items, subtotal: planSubtotal, discount, total: planTotal, internalNotes: planForm.internalNotes || undefined, clientNotes: planForm.clientNotes || undefined });
    } else {
      addCarePlan({ clientId: id, name: planForm.name, description: planForm.description || undefined, status: planForm.status, startDate: planForm.startDate || undefined, estimatedEndDate: planForm.estimatedEndDate || undefined, items, subtotal: planSubtotal, discount, total: planTotal, initialPayment: undefined, internalNotes: planForm.internalNotes || undefined, clientNotes: planForm.clientNotes || undefined });
    }
    setShowPlanForm(false);
    setEditPlanId(null);
    setPlanForm({ name: "", description: "", status: "draft", startDate: "", estimatedEndDate: "", internalNotes: "", clientNotes: "", discount: "", items: [] });
    flash();
  }

  function startEditPlan(planId: string) {
    const p = allPlans.find((pl) => pl.id === planId);
    if (!p) return;
    setPlanForm({
      name: p.name, description: p.description ?? "", status: p.status,
      startDate: p.startDate ?? "", estimatedEndDate: p.estimatedEndDate ?? "",
      internalNotes: p.internalNotes ?? "", clientNotes: p.clientNotes ?? "",
      discount: p.discount?.toString() ?? "",
      items: p.items.map((it) => ({ name: it.name, quantity: String(it.quantity), unitPrice: String(it.unitPrice), numberOfSessions: it.numberOfSessions?.toString() ?? "" })),
    });
    setEditPlanId(planId);
    setShowPlanForm(true);
  }

  // ── Pagos ────────────────────────────────────────────────────────────────────
  const clientPayments = getClientPayments(id);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({
    concept: "", amount: "", paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "cash" as ClientPaymentMethod, status: "paid" as ClientPaymentStatus,
    carePlanId: "", reference: "", receiptUrl: "", notes: "",
  });

  function savePay() {
    if (!payForm.concept.trim() || !payForm.amount) return;
    addPayment({
      clientId: id, carePlanId: payForm.carePlanId || undefined,
      concept: payForm.concept, amount: parseFloat(payForm.amount),
      paymentDate: payForm.paymentDate, paymentMethod: payForm.paymentMethod,
      status: payForm.status, reference: payForm.reference || undefined,
      receiptUrl: payForm.receiptUrl || undefined, notes: payForm.notes || undefined,
    });
    setShowPayForm(false);
    setPayForm({ concept: "", amount: "", paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: "cash", status: "paid", carePlanId: "", reference: "", receiptUrl: "", notes: "" });
    flash();
  }

  const totalPaid = clientPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = clientPayments.filter((p) => p.status === "pending" || p.status === "partial").reduce((s, p) => s + p.amount, 0);

  // ── Seguimientos ─────────────────────────────────────────────────────────────
  const followUps = getClientFollowUps(id);
  const [showFuForm, setShowFuForm] = useState(false);
  const [fuForm, setFuForm] = useState({
    title: "", description: "", dueDate: "", priority: "medium" as FollowUpPriority,
    relatedPlanId: "",
  });

  function saveFu() {
    if (!fuForm.title.trim() || !fuForm.dueDate) return;
    addFollowUp({ clientId: id, title: fuForm.title, description: fuForm.description || undefined, dueDate: fuForm.dueDate, priority: fuForm.priority, status: "pending", relatedPlanId: fuForm.relatedPlanId || undefined });
    setShowFuForm(false);
    setFuForm({ title: "", description: "", dueDate: "", priority: "medium", relatedPlanId: "" });
    flash();
  }

  // ── Archivos ─────────────────────────────────────────────────────────────────
  const clientFiles = getClientFiles(id);
  const [catFilter, setCatFilter] = useState<FileCategory | "all">("all");
  const [showFileForm, setShowFileForm] = useState(false);
  const [fileForm, setFileForm] = useState({ name: "", category: "photo" as FileCategory, url: "", afterUrl: "", description: "", date: new Date().toISOString().slice(0, 10) });
  const filteredFiles = catFilter === "all" ? clientFiles : clientFiles.filter((f) => f.category === catFilter);

  function saveFile() {
    if (!fileForm.name.trim() || !fileForm.url.trim()) return;
    addFile({ clientId: id, name: fileForm.name, category: fileForm.category, url: fileForm.url, afterUrl: fileForm.afterUrl || undefined, description: fileForm.description || undefined, date: fileForm.date });
    setShowFileForm(false);
    setFileForm({ name: "", category: "photo", url: "", afterUrl: "", description: "", date: new Date().toISOString().slice(0, 10) });
    flash();
  }

  // ── Appointments ─────────────────────────────────────────────────────────────
  const patientApts = appointments.filter((a) => a.patientId === id);
  const nextApt = patientApts
    .filter((a) => a.desiredDate >= new Date().toISOString().slice(0, 10) && a.status !== "cancelled" && a.status !== "rejected")
    .sort((a, b) => a.desiredDate.localeCompare(b.desiredDate))[0];

  const activePlans = plans.filter((p) => p.status === "in_progress" || p.status === "accepted");
  const pendingFollowUps = followUps.filter((f) => f.status === "pending");
  const totalPlanPending = plans.reduce((s, p) => s + p.pendingAmount, 0);

  const clinicalHistoryEnabled = config.features?.clinicalHistory !== false;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "resumen", label: "Resumen", icon: Phone },
    ...(clinicalHistoryEnabled ? [{ id: "historial" as Tab, label: "Historial clínico", icon: ShieldAlert }] : []),
    { id: "planes", label: `Planes (${plans.length})`, icon: ClipboardList },
    { id: "pagos", label: "Pagos", icon: CreditCard },
    { id: "seguimientos", label: `Seguimientos (${pendingFollowUps.length})`, icon: Bell },
    { id: "archivos", label: "Fotos y archivos", icon: FolderOpen },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/pacientes" className="inline-flex items-center gap-1 text-sm text-[var(--ds-primary)] hover:underline mb-3">
          <ChevronLeft className="w-4 h-4" />Volver a clientes
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--ds-surface-muted)] flex items-center justify-center text-[var(--ds-primary)] font-bold text-lg border border-[var(--ds-border)]">
              {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">{client.name}</h1>
              <p className="text-[var(--ds-text-muted)] text-sm">Cliente desde {formatShortDate(client.firstVisitAt)}</p>
            </div>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 text-[var(--ds-success)] text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />Guardado
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--ds-bg)] p-1 rounded-xl border border-[var(--ds-border)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              tab === t.id ? "bg-[var(--ds-surface-elevated)] shadow-sm text-[var(--ds-primary)]" : "text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Resumen ── */}
      {tab === "resumen" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Datos del cliente */}
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[var(--ds-text)] text-sm uppercase tracking-wide">Datos del cliente</h2>
                <button onClick={() => setEditResumen((v) => !v)} className="text-xs text-[var(--ds-primary)] hover:underline flex items-center gap-1">
                  <Edit2 className="w-3 h-3" />{editResumen ? "Cancelar" : "Editar"}
                </button>
              </div>

              {editResumen ? (
                <div className="space-y-3">
                  <div><label className={lblCls}>Nombre</label><input value={resumenForm.name} onChange={(e) => setResumenForm((f) => ({ ...f, name: e.target.value }))} className={inp} /></div>
                  <div><label className={lblCls}>Teléfono</label><input value={resumenForm.phone} onChange={(e) => setResumenForm((f) => ({ ...f, phone: e.target.value }))} className={inp} /></div>
                  <div><label className={lblCls}>Fecha de nacimiento</label><input type="date" value={resumenForm.dateOfBirth} onChange={(e) => setResumenForm((f) => ({ ...f, dateOfBirth: e.target.value }))} className={inp} /></div>
                  <div><label className={lblCls}>Notas internas</label><textarea value={resumenForm.notes} onChange={(e) => setResumenForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className={`${inp} resize-none`} /></div>
                  <button onClick={saveResumen} className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-5 py-2 rounded-xl text-sm font-bold">Guardar</button>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--ds-text-muted)]"><Phone className="w-4 h-4 text-[var(--ds-accent)]" />{client.phone}</div>
                  {client.dateOfBirth && <div className="flex items-center gap-2 text-[var(--ds-text-muted)]"><Calendar className="w-4 h-4 text-[var(--ds-accent)]" />Fecha de nacimiento: {formatShortDate(client.dateOfBirth)}</div>}
                  <div className="flex items-center gap-2 text-[var(--ds-text-muted)]"><Calendar className="w-4 h-4 text-[var(--ds-accent)]" />Alta: {formatShortDate(client.firstVisitAt)}</div>
                  {nextApt && <div className="flex items-center gap-2 text-[var(--ds-success)] font-medium"><Calendar className="w-4 h-4" />Próxima cita: {formatShortDate(nextApt.desiredDate)} a las {formatTime(nextApt.desiredTime)}</div>}
                  {client.notes && <div className="mt-3 p-3 bg-[var(--ds-warning)]/8 rounded-xl text-xs text-[var(--ds-warning)] border border-[var(--ds-warning)]/20"><strong>Notas:</strong> {client.notes}</div>}
                </div>
              )}

              {/* Etiquetas */}
              <div className="mt-4 pt-4 border-t border-[var(--ds-border)]">
                <p className="text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {client.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--ds-surface-muted)] text-[var(--ds-text)]">
                      {t}
                      <button onClick={() => removeTag(t)} className="text-[var(--ds-text-muted)] hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <input
                      value={tagInput}
                      onChange={(e) => { setTagInput(e.target.value); setShowTagSug(true); }}
                      onFocus={() => setShowTagSug(true)}
                      placeholder="Nueva etiqueta..."
                      className={`${inp} text-xs py-1.5`}
                    />
                    {showTagSug && tagInput.length === 0 && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-xl shadow-lg z-10 py-1">
                        {DEFAULT_TAGS.filter((t) => !client.tags.includes(t)).map((t) => (
                          <button key={t} onClick={() => addTag(t)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--ds-bg)] text-[var(--ds-text)]">{t}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { if (tagInput.trim()) addTag(tagInput); else setShowTagSug(false); }} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] rounded-xl font-semibold">
                    <Plus className="w-3 h-3" />Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4 shadow-sm text-center">
                <p className="text-2xl font-extrabold text-[var(--ds-primary)]">{patientApts.length}</p>
                <p className="text-xs text-[var(--ds-text-muted)] mt-1">Citas totales</p>
              </div>
              <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4 shadow-sm text-center">
                <p className="text-2xl font-extrabold text-[var(--ds-success)]">{activePlans.length}</p>
                <p className="text-xs text-[var(--ds-text-muted)] mt-1">Planes activos</p>
              </div>
              {totalPlanPending > 0 && (
                <div className="bg-[var(--ds-warning)]/8 border border-[var(--ds-warning)]/20 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xl font-extrabold text-[var(--ds-warning)]">{formatCurrency(totalPlanPending)}</p>
                  <p className="text-xs text-[var(--ds-warning)]/80 mt-1">Saldo pendiente</p>
                </div>
              )}
              {pendingFollowUps.length > 0 && (
                <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-[var(--ds-accent)]">{pendingFollowUps.length}</p>
                  <p className="text-xs text-[var(--ds-text-muted)] mt-1">Seguimientos pendientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Historial clínico ── */}
      {tab === "historial" && !clinicalHistoryEnabled && (
        <div className="text-center py-16 text-[var(--ds-text-muted)]">
          <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">Módulo desactivado</p>
          <p className="text-xs mt-1">El historial clínico está desactivado para este negocio.</p>
          <p className="text-xs mt-0.5">Puedes activarlo desde <strong>Configuración → Módulos</strong>.</p>
        </div>
      )}
      {tab === "historial" && clinicalHistoryEnabled && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 bg-[var(--ds-warning)]/10 border border-[var(--ds-warning)]/30 rounded-2xl p-4 text-sm text-[var(--ds-warning)]">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Información clínica sensible</p>
              <p className="text-xs">Este módulo contiene datos médicos privados del cliente. Solo visible para el especialista y personal autorizado.</p>
            </div>
          </div>

          {history && (
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-[var(--ds-text)] text-sm uppercase tracking-wide mb-4">Ficha clínica</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  ["Alergias", history.allergies],
                  ["Medicamentos actuales", history.currentMedications],
                  ["Enfermedades crónicas", history.chronicDiseases],
                  ["Cirugías previas", history.previousSurgeries],
                  ["Estado de embarazo", history.pregnancyStatus ? PREGNANCY_LABELS[history.pregnancyStatus] : undefined],
                  ["Problemas de sangrado", history.bleedingProblems],
                  ["Reacciones a anestesia", history.anesthesiaReactions],
                  ["Observaciones", history.observations],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-[var(--ds-text)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--ds-border)] flex items-center justify-between">
              <h2 className="font-bold text-[var(--ds-text)] text-sm uppercase tracking-wide">Notas clínicas</h2>
              <button onClick={() => setShowNoteForm((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ds-primary)] border border-[var(--ds-border)] px-3 py-1.5 rounded-lg hover:bg-[var(--ds-surface-muted)] transition-colors">
                {showNoteForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showNoteForm ? "Cancelar" : "Nueva nota"}
              </button>
            </div>
            {showNoteForm && (
              <div className="p-5 border-b border-[var(--ds-border)] bg-[var(--ds-bg)] space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lblCls}>Tipo</label>
                    <select value={noteForm.noteType} onChange={(e) => setNoteForm((f) => ({ ...f, noteType: e.target.value as ClinicalNoteType }))} className={inp}>
                      {(Object.keys(NOTE_TYPE_LABELS) as ClinicalNoteType[]).map((k) => (<option key={k} value={k}>{NOTE_TYPE_LABELS[k]}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className={lblCls}>Título</label>
                    <input type="text" value={noteForm.title} onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))} className={inp} />
                  </div>
                </div>
                <div><label className={lblCls}>Descripción</label><textarea value={noteForm.description} onChange={(e) => setNoteForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={`${inp} resize-none`} /></div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div><label className={lblCls}>Tratamiento</label><input type="text" value={noteForm.treatmentPerformed} onChange={(e) => setNoteForm((f) => ({ ...f, treatmentPerformed: e.target.value }))} className={inp} /></div>
                  <div><label className={lblCls}>Recomendaciones</label><input type="text" value={noteForm.recommendations} onChange={(e) => setNoteForm((f) => ({ ...f, recommendations: e.target.value }))} className={inp} /></div>
                  <div><label className={lblCls}>Próxima visita</label><input type="text" value={noteForm.nextVisitSuggestion} onChange={(e) => setNoteForm((f) => ({ ...f, nextVisitSuggestion: e.target.value }))} className={inp} /></div>
                </div>
                <button onClick={submitNote} disabled={!noteForm.title.trim() || !noteForm.description.trim()} className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar nota</button>
              </div>
            )}
            {notes.length === 0 ? (
              <p className="text-[var(--ds-text-muted)] text-sm text-center py-10">Sin notas clínicas registradas.</p>
            ) : (
              <div className="divide-y divide-[var(--ds-border)]">
                {notes.map((note) => (
                  <div key={note.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="inline-flex items-center text-xs font-bold text-[var(--ds-primary)] bg-[var(--ds-surface-muted)] px-2 py-0.5 rounded-full mr-2">{NOTE_TYPE_LABELS[note.noteType]}</span>
                        <span className="font-semibold text-[var(--ds-text)] text-sm">{note.title}</span>
                      </div>
                      <span className="text-xs text-[var(--ds-text-muted)] whitespace-nowrap">{formatShortDate(note.createdAt.slice(0, 10))}</span>
                    </div>
                    <p className="text-sm text-[var(--ds-text-muted)]">{note.description}</p>
                    {note.treatmentPerformed && <p className="text-xs text-[var(--ds-text)] mt-1"><strong>Tratamiento:</strong> {note.treatmentPerformed}</p>}
                    {note.recommendations && <p className="text-xs text-[var(--ds-text)] mt-1"><strong>Recomendaciones:</strong> {note.recommendations}</p>}
                    {note.nextVisitSuggestion && <p className="text-xs text-[var(--ds-text-muted)] mt-1">Próxima visita: {note.nextVisitSuggestion}</p>}
                    <p className="text-xs text-[var(--ds-text-muted)]/50 mt-2">{note.createdBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Planes de atención ── */}
      {tab === "planes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-[var(--ds-text)]">Planes de atención</h2>
            <button onClick={() => { setEditPlanId(null); setShowPlanForm((v) => !v); }} className="inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-4 py-2 rounded-xl">
              <Plus className="w-4 h-4" />Nuevo plan
            </button>
          </div>

          {showPlanForm && (
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-[var(--ds-text)] text-sm">{editPlanId ? "Editar plan" : "Nuevo plan de atención"}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={lblCls}>Nombre del plan *</label><input value={planForm.name} onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Ortodoncia completa" className={inp} /></div>
                <div><label className={lblCls}>Estado</label>
                  <select value={planForm.status} onChange={(e) => setPlanForm((f) => ({ ...f, status: e.target.value as CarePlanStatus }))} className={inp}>
                    {(Object.keys(CARE_PLAN_STATUS_LABELS) as CarePlanStatus[]).map((k) => (<option key={k} value={k}>{CARE_PLAN_STATUS_LABELS[k]}</option>))}
                  </select>
                </div>
                <div><label className={lblCls}>Descripción</label><input value={planForm.description} onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))} className={inp} /></div>
                <div><label className={lblCls}>Descuento ($)</label><input type="number" min="0" value={planForm.discount} onChange={(e) => setPlanForm((f) => ({ ...f, discount: e.target.value }))} className={inp} /></div>
                <div><label className={lblCls}>Fecha inicio</label><input type="date" value={planForm.startDate} onChange={(e) => setPlanForm((f) => ({ ...f, startDate: e.target.value }))} className={inp} /></div>
                <div><label className={lblCls}>Fecha estimada fin</label><input type="date" value={planForm.estimatedEndDate} onChange={(e) => setPlanForm((f) => ({ ...f, estimatedEndDate: e.target.value }))} className={inp} /></div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={lblCls}>Servicios / Conceptos *</label>
                  <button onClick={addPlanItem} className="text-xs text-[var(--ds-primary)] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Agregar</button>
                </div>
                {planForm.items.length === 0 && <p className="text-xs text-[var(--ds-text-muted)] italic">Agrega al menos un concepto.</p>}
                {planForm.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <input value={it.name} onChange={(e) => setPlanForm((f) => { const items = [...f.items]; items[i] = { ...items[i], name: e.target.value }; return { ...f, items }; })} placeholder="Nombre del servicio" className={`${inp} col-span-4`} />
                    <input type="number" min="1" value={it.quantity} onChange={(e) => setPlanForm((f) => { const items = [...f.items]; items[i] = { ...items[i], quantity: e.target.value }; return { ...f, items }; })} placeholder="Cant." className={`${inp} col-span-2`} />
                    <input type="number" min="0" value={it.unitPrice} onChange={(e) => setPlanForm((f) => { const items = [...f.items]; items[i] = { ...items[i], unitPrice: e.target.value }; return { ...f, items }; })} placeholder="Precio unitario" className={`${inp} col-span-3`} />
                    <input type="number" min="0" value={it.numberOfSessions} onChange={(e) => setPlanForm((f) => { const items = [...f.items]; items[i] = { ...items[i], numberOfSessions: e.target.value }; return { ...f, items }; })} placeholder="Sesiones" className={`${inp} col-span-2`} />
                    <button onClick={() => setPlanForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} className="col-span-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {planForm.items.length > 0 && (
                  <div className="text-right text-sm text-[var(--ds-text-muted)] mt-2 space-y-1">
                    <p>Subtotal: <strong className="text-[var(--ds-text)]">{formatCurrency(planSubtotal)}</strong></p>
                    {parseFloat(planForm.discount) > 0 && <p>Descuento: <strong className="text-red-500">-{formatCurrency(parseFloat(planForm.discount))}</strong></p>}
                    <p className="text-base">Total: <strong className="text-[var(--ds-primary)]">{formatCurrency(planTotal)}</strong></p>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={lblCls}>Notas internas</label><textarea value={planForm.internalNotes} onChange={(e) => setPlanForm((f) => ({ ...f, internalNotes: e.target.value }))} rows={2} className={`${inp} resize-none`} /></div>
                <div><label className={lblCls}>Notas para el cliente</label><textarea value={planForm.clientNotes} onChange={(e) => setPlanForm((f) => ({ ...f, clientNotes: e.target.value }))} rows={2} className={`${inp} resize-none`} /></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowPlanForm(false); setEditPlanId(null); }} className="border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)]">Cancelar</button>
                <button onClick={savePlan} disabled={!planForm.name.trim() || planForm.items.length === 0} className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar plan</button>
              </div>
            </div>
          )}

          {plans.length === 0 && !showPlanForm && (
            <div className="text-center py-12 text-[var(--ds-text-muted)]">
              <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="font-semibold text-sm">No hay planes de atención.</p>
              <button onClick={() => setShowPlanForm(true)} className="mt-3 text-sm text-[var(--ds-primary)] hover:underline">Crear primer plan</button>
            </div>
          )}

          {plans.map((plan) => (
            <div key={plan.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${CARE_PLAN_STATUS_COLORS[plan.status]}`}>{CARE_PLAN_STATUS_LABELS[plan.status]}</span>
                    <h3 className="font-bold text-[var(--ds-text)]">{plan.name}</h3>
                  </div>
                  {plan.description && <p className="text-xs text-[var(--ds-text-muted)]">{plan.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEditPlan(plan.id)} className="text-xs text-[var(--ds-primary)] border border-[var(--ds-border)] px-3 py-1.5 rounded-lg hover:bg-[var(--ds-bg)]"><Edit2 className="w-3 h-3 inline mr-1" />Editar</button>
                  <button onClick={() => deleteCarePlan(plan.id)} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3 h-3 inline mr-1" />Eliminar</button>
                </div>
              </div>

              <div className="px-5 pb-4">
                {plan.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 text-sm border-b border-[var(--ds-border)] last:border-0">
                    <div className="flex-1">
                      <span className="font-medium text-[var(--ds-text)]">{item.name}</span>
                      {item.numberOfSessions && (
                        <span className="ml-2 text-xs text-[var(--ds-text-muted)]">
                          {item.completedSessions ?? 0}/{item.numberOfSessions} sesiones
                          <button onClick={() => updatePlanSession(plan.id, item.id, Math.min((item.completedSessions ?? 0) + 1, item.numberOfSessions!))} className="ml-2 text-[var(--ds-primary)] hover:underline">+1</button>
                        </span>
                      )}
                    </div>
                    <span className="text-[var(--ds-text-muted)] text-xs">{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                    <span className="font-semibold text-[var(--ds-text)] ml-4">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                ))}

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <div className="text-right ml-auto space-y-0.5">
                    {plan.discount && plan.discount > 0 && <p className="text-xs text-[var(--ds-text-muted)]">Descuento: -{formatCurrency(plan.discount)}</p>}
                    <p>Total: <strong className="text-[var(--ds-primary)]">{formatCurrency(plan.total)}</strong></p>
                    <p className="text-[var(--ds-success)]">Pagado: {formatCurrency(plan.paidAmount)}</p>
                    {plan.pendingAmount > 0 && <p className="text-[var(--ds-warning)]">Pendiente: {formatCurrency(plan.pendingAmount)}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagos ── */}
      {tab === "pagos" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-[var(--ds-text)]">Pagos</h2>
            <button onClick={() => setShowPayForm((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-4 py-2 rounded-xl">
              <Plus className="w-4 h-4" />Registrar pago
            </button>
          </div>

          {showPayForm && (
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-[var(--ds-text)] text-sm">Nuevo pago</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={lblCls}>Concepto *</label><input value={payForm.concept} onChange={(e) => setPayForm((f) => ({ ...f, concept: e.target.value }))} placeholder="Ej. Anticipo ortodoncia" className={inp} /></div>
                <div><label className={lblCls}>Monto *</label><input type="number" min="0" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} className={inp} /></div>
                <div><label className={lblCls}>Fecha</label><input type="date" value={payForm.paymentDate} onChange={(e) => setPayForm((f) => ({ ...f, paymentDate: e.target.value }))} className={inp} /></div>
                <div><label className={lblCls}>Método de pago</label>
                  <select value={payForm.paymentMethod} onChange={(e) => setPayForm((f) => ({ ...f, paymentMethod: e.target.value as ClientPaymentMethod }))} className={inp}>
                    {(Object.keys(PAYMENT_METHOD_LABELS) as ClientPaymentMethod[]).map((k) => (<option key={k} value={k}>{PAYMENT_METHOD_LABELS[k]}</option>))}
                  </select>
                </div>
                <div><label className={lblCls}>Estado</label>
                  <select value={payForm.status} onChange={(e) => setPayForm((f) => ({ ...f, status: e.target.value as ClientPaymentStatus }))} className={inp}>
                    {(["pending", "partial", "paid", "refunded", "cancelled"] as ClientPaymentStatus[]).map((k) => (<option key={k} value={k}>{k === "pending" ? "Pendiente" : k === "partial" ? "Parcial" : k === "paid" ? "Pagado" : k === "refunded" ? "Reembolsado" : "Cancelado"}</option>))}
                  </select>
                </div>
                <div><label className={lblCls}>Plan relacionado</label>
                  <select value={payForm.carePlanId} onChange={(e) => setPayForm((f) => ({ ...f, carePlanId: e.target.value }))} className={inp}>
                    <option value="">Sin plan</option>
                    {plans.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div><label className={lblCls}>Referencia</label><input value={payForm.reference} onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))} placeholder="Folio, # transferencia..." className={inp} /></div>
                <div><label className={lblCls}>URL comprobante</label><input value={payForm.receiptUrl} onChange={(e) => setPayForm((f) => ({ ...f, receiptUrl: e.target.value }))} placeholder="https://..." className={inp} /></div>
              </div>
              <div><label className={lblCls}>Notas</label><textarea value={payForm.notes} onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={`${inp} resize-none`} /></div>
              <div className="flex gap-3">
                <button onClick={() => setShowPayForm(false)} className="border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)]">Cancelar</button>
                <button onClick={savePay} disabled={!payForm.concept.trim() || !payForm.amount} className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar pago</button>
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--ds-success)]/8 border border-[var(--ds-success)]/20 rounded-xl p-4 text-center">
              <p className="text-xl font-extrabold text-[var(--ds-success)]">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-[var(--ds-success)]/80 mt-1">Total pagado</p>
            </div>
            {totalPending > 0 && (
              <div className="bg-[var(--ds-warning)]/8 border border-[var(--ds-warning)]/20 rounded-xl p-4 text-center">
                <p className="text-xl font-extrabold text-[var(--ds-warning)]">{formatCurrency(totalPending)}</p>
                <p className="text-xs text-[var(--ds-warning)]/80 mt-1">Saldo pendiente</p>
              </div>
            )}
          </div>

          {clientPayments.length === 0 && !showPayForm && (
            <div className="text-center py-12 text-[var(--ds-text-muted)]">
              <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="font-semibold text-sm">No tienes pagos registrados para este cliente.</p>
            </div>
          )}

          <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-[var(--ds-border)]">
              {clientPayments.map((pay) => (
                <div key={pay.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--ds-text)] text-sm">{pay.concept}</p>
                    <div className="flex gap-3 mt-0.5">
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Seguimientos ── */}
      {tab === "seguimientos" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-[var(--ds-text)]">Seguimientos</h2>
            <button onClick={() => setShowFuForm((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-4 py-2 rounded-xl">
              <Plus className="w-4 h-4" />Nuevo seguimiento
            </button>
          </div>

          {showFuForm && (
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-[var(--ds-text)] text-sm">Nuevo seguimiento</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={lblCls}>Título *</label><input value={fuForm.title} onChange={(e) => setFuForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej. Llamar para confirmar" className={inp} /></div>
                <div><label className={lblCls}>Fecha *</label><input type="date" value={fuForm.dueDate} onChange={(e) => setFuForm((f) => ({ ...f, dueDate: e.target.value }))} className={inp} /></div>
                <div><label className={lblCls}>Prioridad</label>
                  <select value={fuForm.priority} onChange={(e) => setFuForm((f) => ({ ...f, priority: e.target.value as FollowUpPriority }))} className={inp}>
                    {(["low", "medium", "high"] as FollowUpPriority[]).map((k) => (<option key={k} value={k}>{FOLLOW_UP_PRIORITY_LABELS[k]}</option>))}
                  </select>
                </div>
                <div><label className={lblCls}>Plan relacionado</label>
                  <select value={fuForm.relatedPlanId} onChange={(e) => setFuForm((f) => ({ ...f, relatedPlanId: e.target.value }))} className={inp}>
                    <option value="">Sin plan</option>
                    {plans.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
              </div>
              <div><label className={lblCls}>Descripción</label><textarea value={fuForm.description} onChange={(e) => setFuForm((f) => ({ ...f, description: e.target.value }))} rows={2} className={`${inp} resize-none`} /></div>
              <div className="flex gap-3">
                <button onClick={() => setShowFuForm(false)} className="border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)]">Cancelar</button>
                <button onClick={saveFu} disabled={!fuForm.title.trim() || !fuForm.dueDate} className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar seguimiento</button>
              </div>
            </div>
          )}

          {followUps.length === 0 && !showFuForm && (
            <div className="text-center py-12 text-[var(--ds-text-muted)]">
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="font-semibold text-sm">No hay seguimientos para este cliente.</p>
            </div>
          )}

          <div className="space-y-3">
            {followUps.map((fu) => (
              <div key={fu.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl px-5 py-4 shadow-sm flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${FOLLOW_UP_PRIORITY_COLORS[fu.priority]}`}>{FOLLOW_UP_PRIORITY_LABELS[fu.priority]}</span>
                    <span className={`text-xs font-semibold ${fu.status === "completed" ? "line-through text-[var(--ds-text-muted)]" : "text-[var(--ds-text)]"}`}>{fu.title}</span>
                  </div>
                  {fu.description && <p className="text-xs text-[var(--ds-text-muted)]">{fu.description}</p>}
                  <p className="text-xs text-[var(--ds-text-muted)] mt-1">Fecha: {formatShortDate(fu.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {fu.status === "pending" && (
                    <button onClick={() => completeFollowUp(fu.id)} className="text-xs text-[var(--ds-success)] border border-[var(--ds-success)]/30 px-3 py-1.5 rounded-lg hover:bg-[var(--ds-success)]/8">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />Completar
                    </button>
                  )}
                  {fu.status === "completed" && <span className="text-xs text-[var(--ds-success)] font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Completado</span>}
                  <button onClick={() => deleteFollowUp(fu.id)} className="text-[var(--ds-text-muted)]/40 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fotos y archivos ── */}
      {tab === "archivos" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="font-bold text-[var(--ds-text)]">Fotos y archivos</h2>
            <button onClick={() => setShowFileForm((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-4 py-2 rounded-xl">
              <Plus className="w-4 h-4" />Agregar archivo
            </button>
          </div>

          {showFileForm && (
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-[var(--ds-text)] text-sm">Nuevo archivo</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={lblCls}>Nombre *</label><input value={fileForm.name} onChange={(e) => setFileForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Radiografía panorámica" className={inp} /></div>
                <div><label className={lblCls}>Categoría</label>
                  <select value={fileForm.category} onChange={(e) => setFileForm((f) => ({ ...f, category: e.target.value as FileCategory }))} className={inp}>
                    {(Object.keys(FILE_CATEGORY_LABELS) as FileCategory[]).map((k) => (<option key={k} value={k}>{FILE_CATEGORY_LABELS[k]}</option>))}
                  </select>
                </div>
                <div className="sm:col-span-2"><label className={lblCls}>URL del archivo *</label><input value={fileForm.url} onChange={(e) => setFileForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." className={inp} /></div>
                {fileForm.category === "before_after" && (
                  <div className="sm:col-span-2"><label className={lblCls}>URL imagen "Después"</label><input value={fileForm.afterUrl} onChange={(e) => setFileForm((f) => ({ ...f, afterUrl: e.target.value }))} placeholder="https://..." className={inp} /></div>
                )}
                <div><label className={lblCls}>Fecha</label><input type="date" value={fileForm.date} onChange={(e) => setFileForm((f) => ({ ...f, date: e.target.value }))} className={inp} /></div>
                <div><label className={lblCls}>Descripción</label><input value={fileForm.description} onChange={(e) => setFileForm((f) => ({ ...f, description: e.target.value }))} className={inp} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowFileForm(false)} className="border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)]">Cancelar</button>
                <button onClick={saveFile} disabled={!fileForm.name.trim() || !fileForm.url.trim()} className="bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40">Guardar archivo</button>
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCatFilter("all")} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${catFilter === "all" ? "bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] border-[var(--ds-primary)]" : "border-[var(--ds-border)] text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)]"}`}>Todos</button>
            {(Object.keys(FILE_CATEGORY_LABELS) as FileCategory[]).map((cat) => (
              <button key={cat} onClick={() => setCatFilter(cat)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${catFilter === cat ? "bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] border-[var(--ds-primary)]" : "border-[var(--ds-border)] text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)]"}`}>
                {FILE_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-12 text-[var(--ds-text-muted)]">
              <FolderOpen className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="font-semibold text-sm">Este cliente todavía no tiene fotos o archivos.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
                {(file.category === "photo" || file.category === "before_after") ? (
                  <div className={`${file.category === "before_after" && file.afterUrl ? "grid grid-cols-2" : ""} bg-[var(--ds-bg)] border-b border-[var(--ds-border)]`}>
                    <div className="relative">
                      {file.category === "before_after" && file.afterUrl && <p className="absolute top-2 left-2 text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded">Antes</p>}
                      <img src={file.url} alt={file.name} className="w-full h-36 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    {file.category === "before_after" && file.afterUrl && (
                      <div className="relative">
                        <p className="absolute top-2 left-2 text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded">Después</p>
                        <img src={file.afterUrl} alt={`${file.name} después`} className="w-full h-36 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-[var(--ds-bg)] border-b border-[var(--ds-border)] hover:bg-[var(--ds-surface-muted)] transition-colors">
                    <FileText className="w-8 h-8 text-[var(--ds-primary)] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--ds-text)] truncate">{file.name}</p>
                      <p className="text-xs text-[var(--ds-primary)]">Abrir documento</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[var(--ds-text-muted)]" />
                  </a>
                )}
                <div className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--ds-text)] text-sm truncate">{file.name}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-[var(--ds-text-muted)]">{FILE_CATEGORY_LABELS[file.category]}</span>
                      <span className="text-xs text-[var(--ds-text-muted)]">{formatShortDate(file.date)}</span>
                    </div>
                    {file.description && <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">{file.description}</p>}
                  </div>
                  <button onClick={() => deleteFile(file.id)} className="text-[var(--ds-text-muted)]/40 hover:text-red-500 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
