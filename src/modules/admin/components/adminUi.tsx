"use client";
import type {
  PaymentStatus,
  ClientStatus,
  MonthlyPaymentStatus,
  OnboardingStatus,
  ClientType,
  PublicPageStatus,
} from "@/types/user";

// ── Design tokens ─────────────────────────────────────────────────────────────

export const S = {
  input:
    "w-full bg-[#16121f] border border-[#2a2240] rounded-lg px-3.5 py-2.5 text-sm text-[#ede8f5] placeholder-[#4a4260] focus:outline-none focus:border-[#7c4db5] focus:ring-1 focus:ring-[#7c4db5]/20 transition-all",
  select:
    "w-full bg-[#16121f] border border-[#2a2240] rounded-lg px-3 py-2 text-sm text-[#ede8f5] focus:outline-none focus:border-[#7c4db5] transition-all",
  label:
    "block text-[11px] font-medium text-[#6a6080] mb-1.5 tracking-wide uppercase",
  card: "bg-[#100d18] border border-[#1e1830] rounded-xl",
  badge:
    "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide",
  section:
    "text-[10px] font-semibold text-[#4a4260] uppercase tracking-[0.14em] mb-3",
  btnPrimary:
    "px-4 py-2 rounded-lg bg-[#6b3fa8] hover:bg-[#7c4db5] text-white text-sm font-medium transition-colors",
  btnSecondary:
    "px-4 py-2 rounded-lg border border-[#2a2240] text-[#8a80a0] hover:text-[#ede8f5] hover:border-[#3a3255] text-sm font-medium transition-colors",
  btnRose:
    "px-4 py-2 rounded-lg bg-[#1e0d14] border border-[#2e1620] text-[#c4728a] hover:bg-[#280f1a] text-sm font-medium transition-colors",
  btnDanger:
    "px-4 py-2 rounded-lg bg-[#1a0808] border border-[#280e0e] text-[#a84040] hover:bg-[#200a0a] text-sm font-medium transition-colors",
  btnGhost:
    "px-3 py-1.5 rounded-md bg-[#16121f] border border-[#2a2240] text-[#8a80a0] hover:text-[#ede8f5] hover:border-[#3a3255] text-xs font-medium transition-colors whitespace-nowrap",
  btnGreen:
    "px-4 py-2 rounded-lg bg-[#0a1a10] border border-[#162a1c] text-[#4a9e6e] hover:bg-[#0d2016] text-sm font-medium transition-colors",
};

// ── Badge maps ────────────────────────────────────────────────────────────────

export const PAYMENT_META: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:         { label: "Pagado",       cls: "bg-[#0a1a10] text-[#4a9e6e] border border-[#162a1c]" },
  unpaid:       { label: "No pagado",    cls: "bg-[#100d18] text-[#4a4260] border border-[#1e1830]" },
  pending:      { label: "Pendiente",    cls: "bg-[#1e160a] text-[#c49a42] border border-[#2e2210]" },
  grace_period: { label: "Gracia",       cls: "bg-[#1e1408] text-[#c47d3a] border border-[#322010]" },
  overdue:      { label: "Vencido",      cls: "bg-[#1a0808] text-[#a84040] border border-[#280e0e]" },
  cancelled:    { label: "Cancelado",    cls: "bg-[#100d18] text-[#4a4260] border border-[#1e1830]" },
};

export const CLIENT_META: Record<ClientStatus, { label: string; cls: string }> = {
  active:    { label: "Activo",      cls: "bg-[#0a1a10] text-[#4a9e6e] border border-[#162a1c]" },
  inactive:  { label: "Inactivo",   cls: "bg-[#100d18] text-[#4a4260] border border-[#1e1830]" },
  trial:     { label: "Trial",      cls: "bg-[#130f1e] text-[#7a6aaa] border border-[#1e1830]" },
  suspended: { label: "Suspendido", cls: "bg-[#1e1408] text-[#c47d3a] border border-[#2e2210]" },
  cancelled: { label: "Cancelado",  cls: "bg-[#1a0808] text-[#a84040] border border-[#280e0e]" },
};

export const MONTH_META: Record<MonthlyPaymentStatus, { label: string; cls: string }> = {
  paid:    { label: "Pagado",     cls: "bg-[#0a1a10] text-[#4a9e6e] border border-[#162a1c]" },
  unpaid:  { label: "No pagado", cls: "bg-[#100d18] text-[#4a4260] border border-[#1e1830]" },
  pending: { label: "Pendiente", cls: "bg-[#1e160a] text-[#c49a42] border border-[#2e2210]" },
  overdue: { label: "Vencido",   cls: "bg-[#1a0808] text-[#a84040] border border-[#280e0e]" },
};

export const ONBOARDING_META: Record<OnboardingStatus, { label: string; cls: string }> = {
  not_started: { label: "Sin config", cls: "bg-[#100d18] text-[#4a4260] border border-[#1e1830]" },
  in_progress: { label: "En proceso", cls: "bg-[#130f1e] text-[#7a6aaa] border border-[#1e1830]" },
  ready:       { label: "Lista",      cls: "bg-[#0a1a10] text-[#4a9e6e] border border-[#162a1c]" },
};

export const PAGE_META: Record<PublicPageStatus, { label: string; cls: string }> = {
  published: { label: "Publicada", cls: "bg-[#0a1a10] text-[#4a9e6e] border border-[#162a1c]" },
  hidden:    { label: "Oculta",   cls: "bg-[#100d18] text-[#4a4260] border border-[#1e1830]" },
};

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  dentist:         "Dentista",
  physiotherapist: "Fisioterapeuta",
  nutritionist:    "Nutriólogo",
  psychologist:    "Psicólogo",
  veterinarian:    "Veterinario",
  other:           "Otro",
};

// ── Utilities ─────────────────────────────────────────────────────────────────

export function fmtDate(iso: string) {
  try {
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Shared micro-components ───────────────────────────────────────────────────

export function BadgeEl({ meta }: { meta: { label: string; cls: string } }) {
  return <span className={`${S.badge} ${meta.cls}`}>{meta.label}</span>;
}

export function ProBadge({ isPro }: { isPro: boolean }) {
  return isPro ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider bg-[#1e0f14] text-[#c4728a] border border-[#2e1620]">
      PRO
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-[#4a4260] bg-[#100d18] border border-[#1e1830]">
      Free
    </span>
  );
}

export function AccessBadge({ active }: { active: boolean }) {
  return active ? (
    <span className={`${S.badge} bg-[#0a1a10] text-[#4a9e6e] border border-[#162a1c]`}>
      Activo
    </span>
  ) : (
    <span className={`${S.badge} bg-[#1a0808] text-[#a84040] border border-[#280e0e]`}>
      Bloqueado
    </span>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className={S.section}>{children}</p>;
}

export function Divider() {
  return <div className="border-t border-[#1a1628]" />;
}

export function DRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="text-[#4a4260] text-xs shrink-0">{label}</span>
      <div className="text-right text-xs text-[#ede8f5]">{children}</div>
    </div>
  );
}

export function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-4 py-3 text-[10px] font-semibold text-[#4a4260] uppercase tracking-[0.12em] whitespace-nowrap ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}
