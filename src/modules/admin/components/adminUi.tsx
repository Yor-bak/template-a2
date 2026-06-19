"use client";
import type {
  PaymentStatus, ClientStatus, MonthlyPaymentStatus,
  OnboardingStatus, PublicPageStatus, UserPlan,
  CommissionStatus, ContractDocStatus, TransferStatus, TransferType,
} from "@/types/user";

// ── Design tokens — Midnight Ink ──────────────────────────────────────────────
// Single source of truth: globals.css :root { --bg-base, --bg-surface, ... }
// Changing a color: edit globals.css only.

export const C = {
  bgBase:      "var(--bg-base)",
  bgSurface:   "var(--bg-surface)",
  bgElevated:  "var(--bg-elevated)",
  accent:      "var(--accent)",
  accentMuted: "var(--accent-muted)",
  text:        "var(--text-primary)",
  textMuted:   "var(--text-muted)",
  border:      "var(--border)",
  danger:      "var(--danger)",
} as const;

// ── Component style strings ───────────────────────────────────────────────────
// Inputs:       bg-base
// Containers:   bg-surface | bg-elevated
// Borders:      0.5px solid var(--border)
// Buttons:      per Midnight Ink spec

export const S = {
  // Forms
  input:
    `w-full bg-[var(--bg-base)] border-[0.5px] border-[var(--border)] rounded-lg px-3.5 py-2.5 ` +
    `text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] ` +
    `focus:outline-none focus:border-[var(--accent)] transition-colors`,
  select:
    `w-full bg-[var(--bg-base)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2.5 ` +
    `text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors`,
  label:
    `block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 tracking-wide uppercase`,

  // Containers
  card:
    `bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-xl`,
  badge:
    `inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide border-[0.5px]`,
  section:
    `text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.14em] mb-3`,

  // Buttons:
  // primary:   accent bg + bg-base text + accent border
  // secondary: elevated bg + text-primary + border; hover → accent border
  // rose/ghost: transparent bg + text-muted + border; hover → text-primary + accent border
  // danger:    transparent + danger color + danger border; hover → danger bg + bg-base text
  btnPrimary:
    `px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-base)] ` +
    `border-[0.5px] border-[var(--accent)] text-sm font-semibold transition-colors`,
  btnSecondary:
    `px-4 py-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] ` +
    `border-[0.5px] border-[var(--border)] text-sm font-medium transition-colors ` +
    `hover:border-[var(--accent)]`,
  btnRose:
    `px-4 py-2 rounded-lg bg-transparent text-[var(--text-muted)] ` +
    `border-[0.5px] border-[var(--border)] text-sm font-medium transition-colors ` +
    `hover:text-[var(--text-primary)] hover:border-[var(--accent)]`,
  btnDanger:
    `px-4 py-2 rounded-lg bg-transparent text-[var(--danger)] ` +
    `border-[0.5px] border-[var(--danger)] text-sm font-medium transition-colors ` +
    `hover:bg-[var(--danger)] hover:text-[var(--bg-base)]`,
  btnGhost:
    `px-3 py-1.5 rounded-md bg-transparent text-[var(--text-muted)] ` +
    `border-[0.5px] border-[var(--border)] text-xs font-medium transition-colors whitespace-nowrap ` +
    `hover:text-[var(--text-primary)] hover:border-[var(--accent)]`,
  btnGreen:
    `px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-base)] ` +
    `border-[0.5px] border-[var(--accent)] text-sm font-semibold transition-colors`,
};

// ── Badge variants ────────────────────────────────────────────────────────────
// Positive (paid / active / published / pro)  → B_ACCENT  (gold)
// Neutral  (inactive / pending / hidden)       → B_MUTED   (grey/muted)
// Negative (overdue / cancelled / danger)      → B_DANGER  (red)

const B_ACCENT = `bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]`;
const B_MUTED  = `bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]`;
const B_DANGER = `bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]`;

export const PAYMENT_META: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:         { label: "Pagado",    cls: B_ACCENT },
  unpaid:       { label: "No pagado", cls: B_MUTED  },
  pending:      { label: "Pendiente", cls: B_MUTED  },
  grace_period: { label: "Gracia",    cls: B_MUTED  },
  overdue:      { label: "Vencido",   cls: B_DANGER },
  cancelled:    { label: "Cancelado", cls: B_MUTED  },
};

export const CLIENT_META: Record<ClientStatus, { label: string; cls: string }> = {
  active:    { label: "Activo",     cls: B_ACCENT },
  suspended: { label: "Suspendido", cls: B_MUTED  },
  cancelled: { label: "Cancelado",  cls: B_DANGER },
};

export const MONTH_META: Record<MonthlyPaymentStatus, { label: string; cls: string }> = {
  paid:    { label: "Pagado",    cls: B_ACCENT },
  unpaid:  { label: "No pagado", cls: B_MUTED  },
  pending: { label: "Pendiente", cls: B_MUTED  },
  overdue: { label: "Vencido",   cls: B_DANGER },
};

export const ONBOARDING_META: Record<OnboardingStatus, { label: string; cls: string }> = {
  not_started: { label: "Sin config", cls: B_MUTED  },
  in_progress: { label: "En proceso", cls: B_MUTED  },
  ready:       { label: "Lista",      cls: B_ACCENT },
};

export const PAGE_META: Record<PublicPageStatus, { label: string; cls: string }> = {
  published: { label: "Publicada", cls: B_ACCENT },
  hidden:    { label: "Oculta",    cls: B_MUTED  },
};

export const PLAN_META: Record<UserPlan, { label: string; cls: string }> = {
  pro:      { label: "Pro",      cls: B_ACCENT },
  standard: { label: "Standard", cls: B_MUTED  },
};

const B_PAID = `bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]`;

export const COMMISSION_META: Record<CommissionStatus, { label: string; cls: string }> = {
  pending:    { label: "Pendiente",  cls: B_MUTED  },
  authorized: { label: "Autorizada", cls: B_ACCENT },
  paid:       { label: "Pagada",     cls: B_PAID   },
  cancelled:  { label: "Cancelada",  cls: B_DANGER },
};

export const TRANSFER_STATUS_META: Record<TransferStatus, { label: string; cls: string }> = {
  pending:  { label: "Pendiente",   cls: B_MUTED  },
  verified: { label: "Verificada",  cls: B_ACCENT },
  rejected: { label: "Rechazada",   cls: B_DANGER },
  refunded: { label: "Reembolsada", cls: B_DANGER },
};

export const TRANSFER_TYPE_META: Record<TransferType, { label: string; cls: string }> = {
  opening: { label: "Apertura",    cls: B_ACCENT },
  monthly: { label: "Mensualidad", cls: B_MUTED  },
};

export const CONTRACT_DOC_META: Record<ContractDocStatus, { label: string; cls: string }> = {
  pending_signature: { label: "Pend. firma", cls: B_MUTED  },
  signed:            { label: "Firmado",     cls: B_ACCENT },
  expired:           { label: "Vencido",     cls: B_DANGER },
  cancelled:         { label: "Cancelado",   cls: B_DANGER },
};

// ── Utilities ─────────────────────────────────────────────────────────────────

export function fmtDate(iso: string) {
  try {
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

export function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

// ── Shared micro-components ───────────────────────────────────────────────────

export function BadgeEl({ meta }: { meta: { label: string; cls: string } }) {
  return <span className={`${S.badge} ${meta.cls}`}>{meta.label}</span>;
}

export function PlanBadge({ plan }: { plan: UserPlan }) {
  return <BadgeEl meta={PLAN_META[plan]} />;
}

export function AccessBadge({ active }: { active: boolean }) {
  return active
    ? <span className={`${S.badge} ${B_ACCENT}`}>Activo</span>
    : <span className={`${S.badge} ${B_DANGER}`}>Bloqueado</span>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className={S.section}>{children}</p>;
}

export function Divider() {
  return <div className="border-t-[0.5px] border-[var(--border)]" />;
}

export function DRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="text-[var(--text-muted)] text-xs shrink-0">{label}</span>
      <div className="text-right text-xs text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

export function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.12em] whitespace-nowrap bg-[var(--bg-elevated)] ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}
