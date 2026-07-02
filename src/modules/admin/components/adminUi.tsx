"use client";
import type {
  PaymentStatus, ClientStatus, MonthlyPaymentStatus,
  OnboardingStatus, PublicPageStatus, UserPlan,
  CommissionStatus, ContractDocStatus, TransferStatus, TransferType,
} from "@/types/user";

// ── Design tokens — Quiet Ledger ──────────────────────────────────────────────
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
  textFaint:   "var(--text-faint)",
  border:      "var(--border)",
  borderStrong:"var(--border-strong)",
  danger:      "var(--danger)",
} as const;

// ── Component style strings ───────────────────────────────────────────────────
// Quiet Ledger: near-black, one muted accent, borderless underline inputs,
// hairline borders, status as plain colored text (never a filled badge).
// Inputs:     borderless, bottom-hairline only
// Containers: bg-surface (drawers/modals/cards, radius-surface) | bg-base (tables/page, square)
// Borders:    hairline (see globals.css --border / --border-strong)
// Buttons:    one solid accent primary per screen; everything else outline/text

export const S = {
  // Forms — borderless underline inputs, accent underline on focus
  input:
    `w-full bg-transparent border-0 border-b border-[var(--border-strong)] rounded-none px-0 py-2 ` +
    `text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] ` +
    `focus:outline-none focus:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)]/40 transition-colors`,
  select:
    `w-full bg-transparent border-0 border-b border-[var(--border-strong)] rounded-none px-0 py-2 ` +
    `text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)]/40 transition-colors`,
  label:
    `block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 tracking-wide uppercase`,

  // Containers
  card:
    `bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)]`,
  // Table / page-level containers are square (0 radius) per spec — use this instead of `card`.
  panel:
    `bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-none`,
  badge:
    `inline-flex items-center gap-1 text-[11px] font-medium tracking-wide`,
  section:
    `text-[9.5px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.08em] mb-3`,

  // Buttons — one solid accent primary per screen; everything else outline/text.
  // primary:   solid accent bg + bg-base text
  // secondary: transparent + hairline border + text-primary; hover → accent border
  // rose/ghost: plain text, no border; hover → text-primary
  // danger:    transparent + attention-color outline + attention text (never filled)
  btnPrimary:
    `px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--bg-base)] ` +
    `border-0 text-sm font-semibold transition-colors hover:opacity-90 ` +
    `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]`,
  btnSecondary:
    `px-4 py-2 rounded-[var(--radius-control)] bg-transparent text-[var(--text-primary)] ` +
    `border-[0.5px] border-[var(--border-strong)] text-sm font-medium transition-colors ` +
    `hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]`,
  btnRose:
    `px-4 py-2 rounded-[var(--radius-control)] bg-transparent text-[var(--text-muted)] ` +
    `border-0 text-sm font-medium transition-colors ` +
    `hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]`,
  btnDanger:
    `px-4 py-2 rounded-[var(--radius-control)] bg-transparent text-[var(--danger)] ` +
    `border-[0.5px] border-[var(--danger)] text-sm font-medium transition-colors ` +
    `hover:bg-[var(--danger)]/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--danger)]`,
  btnGhost:
    `bg-transparent text-[var(--text-muted)] border-0 text-xs font-medium transition-colors whitespace-nowrap ` +
    `hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-[var(--radius-control)]`,
  btnGreen:
    `px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--bg-base)] ` +
    `border-0 text-sm font-semibold transition-colors hover:opacity-90 ` +
    `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]`,
  // Outlined accent button — use for "Pagar" commission actions
  btnAccent:
    `px-3 py-1.5 rounded-[var(--radius-control)] bg-transparent text-[var(--accent)] ` +
    `border-[0.5px] border-[var(--accent)] text-[11px] font-medium transition-colors ` +
    `hover:bg-[var(--accent)] hover:text-[var(--bg-base)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]`,
};

// ── Status text colors ────────────────────────────────────────────────────────
// Status is always communicated by a text word first, color second — never a
// filled badge background. One accent (positive) + one attention color
// (negative/warning, collapsed into a single hue per the design system) is
// enough; no separate success/warning palette.

const TXT_ACCENT = `text-[var(--accent)] font-medium`;
const TXT_MUTED  = `text-[var(--text-muted)] font-medium`;
const TXT_DANGER = `text-[var(--danger)] font-medium`;
const TXT_PAID   = `text-[var(--accent)] font-semibold`;

export const PAYMENT_META: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:         { label: "Pagado",    cls: TXT_ACCENT },
  unpaid:       { label: "No pagado", cls: TXT_MUTED  },
  pending:      { label: "Pendiente", cls: TXT_MUTED  },
  grace_period: { label: "Gracia",    cls: TXT_MUTED  },
  overdue:      { label: "Vencido",   cls: TXT_DANGER },
  cancelled:    { label: "Cancelado", cls: TXT_MUTED  },
};

export const CLIENT_META: Record<ClientStatus, { label: string; cls: string }> = {
  active:    { label: "Activo",     cls: TXT_ACCENT },
  suspended: { label: "Suspendido", cls: TXT_MUTED  },
  cancelled: { label: "Cancelado",  cls: TXT_DANGER },
};

export const MONTH_META: Record<MonthlyPaymentStatus, { label: string; cls: string }> = {
  paid:    { label: "Pagado",    cls: TXT_ACCENT },
  unpaid:  { label: "No pagado", cls: TXT_MUTED  },
  pending: { label: "Pendiente", cls: TXT_MUTED  },
  overdue: { label: "Vencido",   cls: TXT_DANGER },
};

export const ONBOARDING_META: Record<OnboardingStatus, { label: string; cls: string }> = {
  not_started: { label: "Sin config", cls: TXT_MUTED  },
  in_progress: { label: "En proceso", cls: TXT_MUTED  },
  ready:       { label: "Lista",      cls: TXT_ACCENT },
};

export const PAGE_META: Record<PublicPageStatus, { label: string; cls: string }> = {
  published: { label: "Publicada", cls: TXT_ACCENT },
  hidden:    { label: "Oculta",    cls: TXT_MUTED  },
};

export const PLAN_META: Record<UserPlan, { label: string; cls: string }> = {
  standard:     { label: "Standard",     cls: TXT_MUTED  },
  cowork:       { label: "Cowork",       cls: TXT_ACCENT },
  intelligence: { label: "Intelligence", cls: TXT_ACCENT },
};

export const COMMISSION_META: Record<CommissionStatus, { label: string; cls: string }> = {
  waiting_first_monthly_payment: { label: "Esp. 1ª mensualidad", cls: TXT_MUTED },
  pending:    { label: "Pendiente",  cls: TXT_MUTED  },
  authorized: { label: "Autorizada", cls: TXT_ACCENT },
  paid:       { label: "Pagada",     cls: TXT_PAID   },
  cancelled:  { label: "Cancelada",  cls: TXT_DANGER },
};

export const TRANSFER_STATUS_META: Record<TransferStatus, { label: string; cls: string }> = {
  pending:             { label: "Pendiente",        cls: TXT_MUTED  },
  pending_activation:  { label: "Pend. activación", cls: TXT_MUTED  },
  activation_error:    { label: "Error activación", cls: TXT_DANGER },
  verified:            { label: "Verificada",       cls: TXT_ACCENT },
  rejected:            { label: "Rechazada",        cls: TXT_DANGER },
  refunded:            { label: "Reembolsada",      cls: TXT_DANGER },
};

export const TRANSFER_TYPE_META: Record<TransferType, { label: string; cls: string }> = {
  opening:      { label: "Apertura",        cls: TXT_ACCENT },
  monthly:      { label: "Mensualidad",     cls: TXT_MUTED  },
  unidentified: { label: "Sin identificar", cls: TXT_MUTED  },
};

export const CONTRACT_DOC_META: Record<ContractDocStatus, { label: string; cls: string }> = {
  pending_signature: { label: "Pend. firma", cls: TXT_MUTED  },
  signed:            { label: "Firmado",     cls: TXT_ACCENT },
  expired:           { label: "Vencido",     cls: TXT_DANGER },
  cancelled:         { label: "Cancelado",   cls: TXT_DANGER },
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
    ? <span className={`${S.badge} ${TXT_ACCENT}`}>Activo</span>
    : <span className={`${S.badge} ${TXT_DANGER}`}>Bloqueado</span>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className={S.section}>{children}</p>;
}

export function Divider() {
  return <div className="border-t border-[var(--border)]" />;
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
    <th className={`px-5 py-2.5 text-[10px] font-medium text-[var(--text-faint)] uppercase tracking-[0.08em] whitespace-nowrap ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

// ── Stat grid — "Quiet Ledger" 1px-gap CSS grid stat block ────────────────────
// Replaces boxed/shadowed stat cards: a hairline-tinted grid where the gap
// itself reads as the divider between cells.

const STAT_GRID_COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
  7: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7",
};

export function StatGrid({ children, cols = 3, className = "" }: { children: React.ReactNode; cols?: 2 | 3 | 4 | 5 | 7; className?: string }) {
  return (
    <div className={`grid ${STAT_GRID_COLS[cols] ?? STAT_GRID_COLS[3]} gap-px bg-[var(--border)] border-[0.5px] border-[var(--border)] ${className}`}>
      {children}
    </div>
  );
}

export function StatCell({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "accent" | "danger" }) {
  return (
    <div className="bg-[var(--bg-base)] px-4 py-3.5">
      <p className="text-[9.5px] font-medium text-[var(--text-faint)] uppercase tracking-[0.06em] mb-1.5">{label}</p>
      <p className="text-xl font-semibold text-[var(--text-primary)] tabular-nums">{value}</p>
      {sub != null && (
        <p className={`text-[10.5px] mt-1 ${tone === "danger" ? "text-[var(--danger)]" : tone === "accent" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Tab bar — underline pattern (text + 2px accent underline, no pills) ───────

export function TabBar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="tablist" className={`flex border-b-[0.5px] border-[var(--border)] overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}

export function TabButton({
  active, onClick, children, className = "",
}: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`text-[11px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ` +
        `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ` +
        `${active ? "text-[var(--text-primary)] border-[var(--accent)]" : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"} ${className}`}
    >
      {children}
    </button>
  );
}
