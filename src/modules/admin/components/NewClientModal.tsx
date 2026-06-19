"use client";
import { useState, useEffect } from "react";
import type { ClientType, ContractType, PublicPageStatus, UserPlan, ClientStatus } from "@/types/user";
import type { NewClientInput } from "@/store/adminStore";
import {
  useAdminStore,
  generateSlug,
  buildSubdomain,
  generateContractEndDate,
  CONTRACT_TYPE_LABELS,
  CLIENT_TYPE_LABELS,
} from "@/store/adminStore";
import { S, fmtDate } from "./adminUi";

const EMPTY_CL = {
  basicData: false, services: false, address: false,
  paymentMethods: false, templateSelected: false, colorsSelected: false, testimonials: false,
};

const today = new Date().toISOString().split("T")[0];

const EMPTY: NewClientInput = {
  clinicName: "", specialistName: "", clientType: "dentist",
  phone: "", clinicAddress: "", googleMapsUrl: "",
  slug: "", plan: "free", isPro: false,
  clientStatus: "trial", publicPageStatus: "hidden",
  contractType: "six_months", activationDate: today,
  monthlyAmount: 299,
  onboardingChecklist: EMPTY_CL,
  assignedTo: "", internalNotes: "",
};

export function NewClientModal({ onClose }: { onClose: () => void }) {
  const { addClient } = useAdminStore();
  const [form, setForm] = useState<NewClientInput>(EMPTY);
  const [slugLocked, setSlugLocked] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<NewClientInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!slugLocked && form.clinicName) {
      set({ slug: generateSlug(form.clinicName) });
    }
  }, [form.clinicName, slugLocked]);

  const endDate = form.activationDate
    ? generateContractEndDate(form.activationDate, form.contractType)
    : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clinicName.trim() || !form.specialistName.trim() || !form.phone.trim()) {
      setError("Clínica, especialista y teléfono son obligatorios.");
      return;
    }
    if (!form.slug.trim()) {
      setError("El subdominio es obligatorio.");
      return;
    }
    addClient({ ...form, isPro: form.plan === "pro" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`${S.card} w-full max-w-2xl max-h-[92vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1830]">
          <div>
            <h2 className="text-[#ede8f5] font-semibold text-base">Nuevo cliente</h2>
            <p className="text-[#4a4260] text-xs mt-0.5">Completa los datos básicos del consultorio</p>
          </div>
          <button onClick={onClose} className="text-[#4a4260] hover:text-[#8a80a0] text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Identificación */}
          <section className="space-y-4">
            <p className={S.section}>Identificación</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={S.label}>Nombre de la clínica *</label>
                <input
                  className={S.input}
                  value={form.clinicName}
                  onChange={(e) => set({ clinicName: e.target.value })}
                  placeholder="Clínica Dental Sonrisa"
                />
              </div>
              <div>
                <label className={S.label}>Nombre del especialista *</label>
                <input
                  className={S.input}
                  value={form.specialistName}
                  onChange={(e) => set({ specialistName: e.target.value })}
                  placeholder="Dra. María López"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={S.label}>Tipo de especialidad</label>
                <select
                  className={S.select}
                  value={form.clientType}
                  onChange={(e) => set({ clientType: e.target.value as ClientType })}
                >
                  {(Object.entries(CLIENT_TYPE_LABELS) as [ClientType, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={S.label}>Teléfono *</label>
                <input
                  className={S.input}
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="5512345678"
                />
              </div>
            </div>
            <div>
              <label className={S.label}>Dirección</label>
              <input
                className={S.input}
                value={form.clinicAddress}
                onChange={(e) => set({ clinicAddress: e.target.value })}
                placeholder="Av. Insurgentes Sur 1234, CDMX"
              />
            </div>
          </section>

          {/* Subdominio */}
          <section className="space-y-3">
            <p className={S.section}>Subdominio</p>
            <div>
              <label className={S.label}>Slug *</label>
              <div className="flex gap-2">
                <input
                  className={S.input}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    set({ slug: e.target.value });
                  }}
                  placeholder="clinica-sonrisa"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlugLocked(false);
                    set({ slug: generateSlug(form.clinicName) });
                  }}
                  className={S.btnGhost}
                >
                  Auto
                </button>
              </div>
              {form.slug && (
                <p className="text-[11px] text-[#6b3fa8] mt-1.5 font-mono">
                  {buildSubdomain(form.slug)}
                </p>
              )}
            </div>
          </section>

          {/* Plan y estado */}
          <section className="space-y-3">
            <p className={S.section}>Plan y estado</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={S.label}>Plan</label>
                <select
                  className={S.select}
                  value={form.plan}
                  onChange={(e) => set({ plan: e.target.value as UserPlan, isPro: e.target.value === "pro" })}
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div>
                <label className={S.label}>Estado</label>
                <select
                  className={S.select}
                  value={form.clientStatus}
                  onChange={(e) => set({ clientStatus: e.target.value as ClientStatus })}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div>
                <label className={S.label}>Página pública</label>
                <select
                  className={S.select}
                  value={form.publicPageStatus}
                  onChange={(e) => set({ publicPageStatus: e.target.value as PublicPageStatus })}
                >
                  <option value="hidden">Oculta</option>
                  <option value="published">Publicada</option>
                </select>
              </div>
            </div>
          </section>

          {/* Contrato */}
          <section className="space-y-3">
            <p className={S.section}>Contrato</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={S.label}>Tipo de contrato</label>
                <select
                  className={S.select}
                  value={form.contractType}
                  onChange={(e) => set({ contractType: e.target.value as ContractType })}
                >
                  {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={S.label}>Fecha de inicio</label>
                <input
                  type="date"
                  className={S.input}
                  value={form.activationDate}
                  onChange={(e) => set({ activationDate: e.target.value })}
                />
              </div>
              <div>
                <label className={S.label}>Monto mensual (MXN)</label>
                <input
                  type="number"
                  className={S.input}
                  value={form.monthlyAmount ?? ""}
                  onChange={(e) => set({ monthlyAmount: Number(e.target.value) })}
                  placeholder="299"
                />
              </div>
            </div>
            {endDate && (
              <div className="bg-[#16121f] border border-[#2a2240] rounded-lg px-4 py-2.5 flex justify-between text-xs">
                <span className="text-[#4a4260]">Vencimiento del contrato</span>
                <span className="text-[#9c6fd4] font-mono">{fmtDate(endDate)}</span>
              </div>
            )}
          </section>

          {/* Asignación */}
          <section className="space-y-3">
            <p className={S.section}>Asignación interna</p>
            <div>
              <label className={S.label}>Responsable</label>
              <input
                className={S.input}
                value={form.assignedTo ?? ""}
                onChange={(e) => set({ assignedTo: e.target.value })}
                placeholder="Pedro, Soporte, Ventas…"
              />
            </div>
          </section>

          {error && (
            <p className="text-[#a84040] text-xs bg-[#1a0808] border border-[#280e0e] rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={S.btnSecondary}>
              Cancelar
            </button>
            <button type="submit" className={S.btnPrimary}>
              Crear cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
