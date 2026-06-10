"use client";
import { useState } from "react";
import {
  Plus, Clock, AlertCircle, CheckCircle2, XCircle,
  Eye, EyeOff, Pencil, Trash2, Stethoscope, AlertTriangle,
} from "lucide-react";
import { useServices, PRICE_TYPE_LABELS } from "@/contexts/ServicesContext";
import { priceLabel } from "@/lib/utils";
import { ServiceForm } from "@/components/dashboard/ServiceForm";
import type { Service } from "@/types";

// ── Badges ────────────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <CheckCircle2 className="w-3 h-3" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <XCircle className="w-3 h-3" />
      Inactivo
    </span>
  );
}

function PriceBadge({ priceType }: { priceType: Service["priceType"] }) {
  const colors: Record<Service["priceType"], string> = {
    from: "bg-sky-50 text-sky-700",
    fixed: "bg-teal-50 text-teal-700",
    assessment_required: "bg-amber-50 text-amber-700",
    hidden: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colors[priceType]}`}>
      {PRICE_TYPE_LABELS[priceType]}
    </span>
  );
}

// ── Modal de confirmación de borrado ──────────────────────────────────────────

interface ConfirmDeleteModalProps {
  service: Service;
  hasAppointments: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeleteModal({ service, hasAppointments, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${hasAppointments ? "bg-amber-100" : "bg-red-100"}`}>
          {hasAppointments ? (
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          ) : (
            <Trash2 className="w-6 h-6 text-red-600" />
          )}
        </div>
        <h2 className="text-base font-bold text-gray-900 text-center mb-2">
          {hasAppointments ? "¿Desactivar servicio?" : "¿Eliminar servicio?"}
        </h2>
        {hasAppointments ? (
          <p className="text-sm text-gray-600 text-center mb-6">
            El servicio <strong>{service.name}</strong> tiene citas asociadas. Para conservar el historial,
            se <strong>desactivará</strong> en lugar de eliminarse. Seguirá visible en el panel pero no en la página pública.
          </p>
        ) : (
          <p className="text-sm text-gray-600 text-center mb-6">
            ¿Seguro que deseas eliminar <strong>{service.name}</strong>? Esta acción no se puede deshacer.
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors ${hasAppointments ? "bg-amber-500 hover:bg-amber-600" : "bg-red-600 hover:bg-red-700"}`}
          >
            {hasAppointments ? "Desactivar" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DashboardServiciosPage() {
  const { services, toggleActive, deleteService, serviceHasAppointments } = useServices();

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  function openCreate() {
    setEditingService(null);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setFormOpen(true);
  }

  function handleToggle(service: Service) {
    toggleActive(service.id);
    setLastAction(service.isActive ? `"${service.name}" desactivado.` : `"${service.name}" activado.`);
    setTimeout(() => setLastAction(null), 2500);
  }

  function handleDeleteRequest(service: Service) {
    setDeletingService(service);
  }

  function handleDeleteConfirm() {
    if (!deletingService) return;
    const result = deleteService(deletingService.id);
    if (result.deleted) {
      setLastAction(`"${deletingService.name}" eliminado.`);
    } else {
      setLastAction(`"${deletingService.name}" desactivado (tiene citas asociadas).`);
    }
    setDeletingService(null);
    setTimeout(() => setLastAction(null), 3000);
  }

  const active = services.filter((s) => s.isActive).length;
  const inactive = services.filter((s) => !s.isActive).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Servicios del consultorio</h1>
          <p className="text-[var(--color-muted-text)] text-sm">Administra los tratamientos que tus pacientes pueden consultar y agendar. ·
            {services.length} servicios · {active} activos · {inactive} inactivos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar servicio
        </button>
      </div>

      {/* Toast de acción */}
      {lastAction && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          {lastAction}
        </div>
      )}

      {/* Estado vacío */}
      {services.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-[var(--color-border)] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-5">
            <Stethoscope className="w-8 h-8 text-[var(--color-primary)]" strokeWidth={1.5} />
          </div>
          <p className="font-bold text-[var(--color-text)] mb-2">Sin servicios configurados</p>
          <p className="text-sm text-[var(--color-muted-text)] text-center max-w-xs mb-6">
            Agrega tu primer servicio para que los pacientes puedan verlo y solicitar una cita.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar primer servicio
          </button>
        </div>
      )}

      {/* Tabla de servicios */}
      {services.length > 0 && (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                  <th className="text-left text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide px-5 py-3">Servicio</th>
                  <th className="text-left text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide px-4 py-3">Duración</th>
                  <th className="text-left text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide px-4 py-3">Precio</th>
                  <th className="text-left text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide px-4 py-3">Estado</th>
                  <th className="text-right text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/60">
                {services.map((svc) => (
                  <tr key={svc.id} className={`hover:bg-[var(--color-background)] transition-colors ${!svc.isActive ? "opacity-55" : ""}`}>
                    {/* Servicio */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${svc.isEmergency ? "bg-red-100" : "bg-[var(--color-accent-soft)]"}`}>
                          {svc.isEmergency
                            ? <AlertCircle className="w-4 h-4 text-red-500" />
                            : <Stethoscope className="w-4 h-4 text-[var(--color-primary)]" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text)] text-sm">{svc.name}</p>
                          <p className="text-xs text-[var(--color-muted-text)] truncate max-w-[240px]">{svc.shortDescription}</p>
                        </div>
                      </div>
                    </td>

                    {/* Duración */}
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-[var(--color-muted-text)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-muted-text)]/50" />
                        {svc.durationMinutes} min
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <PriceBadge priceType={svc.priceType} />
                        <span className="text-xs font-semibold text-[var(--color-text)]">
                          {priceLabel(svc.priceType, svc.estimatedPrice)}
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge isActive={svc.isActive} />
                        {svc.isEmergency && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Urgencia</span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(svc)}
                          title="Editar servicio"
                          className="p-2 rounded-lg text-[var(--color-muted-text)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(svc)}
                          title={svc.isActive ? "Desactivar" : "Activar"}
                          className={`p-2 rounded-lg transition-colors ${
                            svc.isActive
                              ? "text-green-500 hover:bg-green-50 hover:text-green-700"
                              : "text-[var(--color-muted-text)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                          }`}
                        >
                          {svc.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(svc)}
                          title="Eliminar servicio"
                          className="p-2 rounded-lg text-[var(--color-muted-text)] hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer resumen */}
          <div className="border-t border-[var(--color-border)] px-5 py-3 flex items-center gap-4 text-xs text-[var(--color-muted-text)]">
            <span>{active} activos</span>
            <span className="opacity-30">·</span>
            <span>{inactive} inactivos</span>
            <span className="opacity-30">·</span>
            <span>{services.filter((s) => s.isEmergency).length} urgencias</span>
          </div>
        </div>
      )}

      {/* Drawer de formulario */}
      <ServiceForm
        open={formOpen}
        editingService={editingService}
        onClose={() => setFormOpen(false)}
      />

      {/* Modal de confirmación */}
      {deletingService && (
        <ConfirmDeleteModal
          service={deletingService}
          hasAppointments={serviceHasAppointments(deletingService.id)}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingService(null)}
        />
      )}
    </div>
  );
}
