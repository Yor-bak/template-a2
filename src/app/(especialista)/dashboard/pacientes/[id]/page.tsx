"use client";
import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { patients } from "@/data/patients";
import { appointments } from "@/data/appointments";
import { formatCurrency, formatShortDate, formatTime } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS } from "@/lib/constants";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { useClinicalHistory } from "@/contexts/ClinicalHistoryContext";
import { NOTE_TYPE_LABELS, PREGNANCY_LABELS, type ClinicalNoteType } from "@/types/clinical";
import { ChevronLeft, Phone, Calendar, ShieldAlert, Plus, X } from "lucide-react";

type Tab = "resumen" | "citas" | "pagos" | "historial";

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = patients.find((p) => p.id === id);
  if (!patient) notFound();

  const { config } = useClinicConfig();
  const { getClinicalHistory, getClinicalNotes, addClinicalNote } = useClinicalHistory();

  const [tab, setTab] = useState<Tab>("resumen");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ noteType: "consultation" as ClinicalNoteType, title: "", description: "", treatmentPerformed: "", recommendations: "", nextVisitSuggestion: "" });

  const patientApts = appointments.filter((a) => a.patientId === id);
  const totalPaid = patientApts.filter((a) => a.paymentStatus === "paid").reduce((s, a) => s + (a.chargedAmount || 0), 0);
  const history = getClinicalHistory(id);
  const notes = getClinicalNotes(id);

  const tabs: { id: Tab; label: string }[] = [
    { id: "resumen", label: "Resumen" },
    { id: "citas", label: `Citas (${patientApts.length})` },
    { id: "pagos", label: "Pagos" },
    { id: "historial", label: "Historial clínico" },
  ];

  function submitNote() {
    if (!noteForm.title.trim() || !noteForm.description.trim()) return;
    addClinicalNote({
      clinicId: "clinic-001",
      patientId: id,
      noteType: noteForm.noteType,
      title: noteForm.title,
      description: noteForm.description,
      treatmentPerformed: noteForm.treatmentPerformed || undefined,
      recommendations: noteForm.recommendations || undefined,
      nextVisitSuggestion: noteForm.nextVisitSuggestion || undefined,
      createdBy: config.dentistName,
    });
    setNoteForm({ noteType: "consultation", title: "", description: "", treatmentPerformed: "", recommendations: "", nextVisitSuggestion: "" });
    setShowNoteForm(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/pacientes" className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline mb-3">
          <ChevronLeft className="w-4 h-4" />
          Volver a clientes
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-primary)] font-bold text-lg border border-[var(--color-accent)]/20">
            {patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--color-text)]">{patient.name}</h1>
            <p className="text-[var(--color-muted-text)] text-sm">Cliente desde {formatShortDate(patient.firstVisitAt)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--color-border)] w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-white shadow-sm text-[var(--color-primary)] font-bold"
                : "text-[var(--color-muted-text)] hover:text-[var(--color-text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Resumen ── */}
      {tab === "resumen" && (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm md:col-span-2">
            <h2 className="font-bold text-[var(--color-text)] mb-4 text-sm uppercase tracking-wide">Contacto</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-muted-text)]"><Phone className="w-4 h-4 text-[var(--color-accent)]" />{patient.phone}</div>
              {patient.dateOfBirth && (
                <div className="flex items-center gap-2 text-[var(--color-muted-text)]"><Calendar className="w-4 h-4 text-[var(--color-accent)]" />Fecha de nacimiento: {patient.dateOfBirth}</div>
              )}
              <div className="flex items-center gap-2 text-[var(--color-muted-text)]"><Calendar className="w-4 h-4 text-[var(--color-accent)]" />Primera visita: {formatShortDate(patient.firstVisitAt)}</div>
            </div>
            {patient.notes && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-100">
                <strong>Notas:</strong> {patient.notes}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-[var(--color-primary)]">{patientApts.length}</p>
              <p className="text-xs text-[var(--color-muted-text)] mt-1">Citas totales</p>
            </div>
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-green-700">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-[var(--color-muted-text)] mt-1">Total pagado</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Citas ── */}
      {tab === "citas" && (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-bold text-[var(--color-text)] text-sm uppercase tracking-wide">Historial de citas</h2>
          </div>
          {patientApts.length === 0 ? (
            <p className="text-[var(--color-muted-text)] text-sm text-center py-10">Sin citas registradas.</p>
          ) : (
            <div className="divide-y divide-[#F0F4F5]">
              {patientApts.map((apt) => (
                <Link key={apt.id} href={`/dashboard/citas/${apt.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-background)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text)]">{apt.serviceName}</p>
                    <p className="text-xs text-[var(--color-muted-text)]">{formatShortDate(apt.desiredDate)} · {formatTime(apt.desiredTime)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[apt.status]}`}>{STATUS_LABELS[apt.status]}</span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${PAYMENT_COLORS[apt.paymentStatus]}`}>{PAYMENT_LABELS[apt.paymentStatus]}</span>
                    {apt.chargedAmount && <span className="text-xs font-semibold text-[var(--color-muted-text)]">{formatCurrency(apt.chargedAmount)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pagos ── */}
      {tab === "pagos" && (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-bold text-[var(--color-text)] text-sm uppercase tracking-wide">Pagos</h2>
          </div>
          <div className="divide-y divide-[#F0F4F5]">
            {patientApts.filter((a) => a.paymentStatus !== "unpaid").map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text)] text-sm">{apt.serviceName}</p>
                  <p className="text-xs text-[var(--color-muted-text)]">{formatShortDate(apt.desiredDate)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${PAYMENT_COLORS[apt.paymentStatus]}`}>{PAYMENT_LABELS[apt.paymentStatus]}</span>
                  {apt.chargedAmount && <span className="font-bold text-[var(--color-text)] text-sm">{formatCurrency(apt.chargedAmount)}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-[var(--color-background)] border-t border-[var(--color-border)] flex justify-between items-center">
            <span className="text-sm text-[var(--color-muted-text)] font-semibold">Total pagado</span>
            <span className="text-lg font-extrabold text-green-700">{formatCurrency(totalPaid)}</span>
          </div>
        </div>
      )}

      {/* ── Historial clínico ── */}
      {tab === "historial" && (
        <div className="space-y-5">
          {/* Aviso de privacidad */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Información clínica sensible</p>
              <p className="text-xs">Este módulo contiene datos médicos privados del cliente. Solo visible para el especialista y personal autorizado. Nunca se comparte públicamente.</p>
            </div>
          </div>

          {/* Ficha médica */}
          {history && (
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-[var(--color-text)] text-sm uppercase tracking-wide mb-4">Ficha médica</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  ["Alergias", history.allergies],
                  ["Medicamentos actuales", history.currentMedications],
                  ["Enfermedades crónicas", history.chronicDiseases],
                  ["Cirugías previas", history.previousSurgeries],
                  ["Estado de embarazo", history.pregnancyStatus ? PREGNANCY_LABELS[history.pregnancyStatus] : undefined],
                  ["Problemas de sangrado", history.bleedingProblems],
                  ["Reacciones a anestesia", history.anesthesiaReactions],
                  ["Motivo dental", history.dentalReason],
                  ["Nivel de dolor (0-10)", history.dentalPainLevel?.toString()],
                  ["Última visita dental", history.lastDentalVisit ? formatShortDate(history.lastDentalVisit) : undefined],
                  ["Higiene oral", history.oralHygieneNotes],
                  ["Observaciones", history.observations],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-[var(--color-text)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas clínicas */}
          <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="font-bold text-[var(--color-text)] text-sm uppercase tracking-wide">Notas clínicas</h2>
              <button
                onClick={() => setShowNoteForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-accent)]/30 px-3 py-1.5 rounded-lg hover:bg-[var(--color-accent-soft)] transition-colors"
              >
                {showNoteForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showNoteForm ? "Cancelar" : "Nueva nota"}
              </button>
            </div>

            {showNoteForm && (
              <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-background)] space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1">Tipo</label>
                    <select
                      value={noteForm.noteType}
                      onChange={(e) => setNoteForm((f) => ({ ...f, noteType: e.target.value as ClinicalNoteType }))}
                      className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 bg-white"
                    >
                      {(Object.keys(NOTE_TYPE_LABELS) as ClinicalNoteType[]).map((k) => (
                        <option key={k} value={k}>{NOTE_TYPE_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1">Título</label>
                    <input
                      type="text"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Ej. Revisión de rutina"
                      className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1">Descripción</label>
                  <textarea
                    value={noteForm.description}
                    onChange={(e) => setNoteForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Hallazgos clínicos, observaciones..."
                    className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 resize-none"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1">Tratamiento realizado</label>
                    <input type="text" value={noteForm.treatmentPerformed} onChange={(e) => setNoteForm((f) => ({ ...f, treatmentPerformed: e.target.value }))} className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1">Recomendaciones</label>
                    <input type="text" value={noteForm.recommendations} onChange={(e) => setNoteForm((f) => ({ ...f, recommendations: e.target.value }))} className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1">Próxima visita</label>
                    <input type="text" value={noteForm.nextVisitSuggestion} onChange={(e) => setNoteForm((f) => ({ ...f, nextVisitSuggestion: e.target.value }))} placeholder="Ej. 3 meses" className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                  </div>
                </div>
                <button
                  onClick={submitNote}
                  disabled={!noteForm.title.trim() || !noteForm.description.trim()}
                  className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Guardar nota
                </button>
              </div>
            )}

            {notes.length === 0 ? (
              <p className="text-[var(--color-muted-text)] text-sm text-center py-10">Sin notas clínicas registradas.</p>
            ) : (
              <div className="divide-y divide-[#F0F4F5]">
                {notes.map((note) => (
                  <div key={note.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="inline-flex items-center text-xs font-bold text-[var(--color-primary)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded-full mr-2">
                          {NOTE_TYPE_LABELS[note.noteType]}
                        </span>
                        <span className="font-semibold text-[var(--color-text)] text-sm">{note.title}</span>
                      </div>
                      <span className="text-xs text-[var(--color-muted-text)] whitespace-nowrap">{formatShortDate(note.createdAt.slice(0, 10))}</span>
                    </div>
                    <p className="text-sm text-[var(--color-muted-text)] mb-2">{note.description}</p>
                    {note.treatmentPerformed && (
                      <p className="text-xs text-[var(--color-text)]"><strong>Tratamiento:</strong> {note.treatmentPerformed}</p>
                    )}
                    {note.recommendations && (
                      <p className="text-xs text-[var(--color-text)]"><strong>Recomendaciones:</strong> {note.recommendations}</p>
                    )}
                    {note.nextVisitSuggestion && (
                      <p className="text-xs text-[var(--color-muted-text)] mt-1">Próxima visita sugerida: {note.nextVisitSuggestion}</p>
                    )}
                    <p className="text-xs text-[var(--color-muted-text)]/50 mt-2">{note.createdBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
