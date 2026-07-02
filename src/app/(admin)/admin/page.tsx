"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useAdminStore, useAdminAuth, BUSINESS_TYPE_LABELS, CONTRACT_TYPE_LABELS } from "@/store/adminStore";
import type { AdminClient, BusinessType, BankAccountConfig } from "@/types/user";
import { ADMIN_ROLE_LABELS, SELECTABLE_ROLES, getBusinessVertical } from "@/lib/adminPermissions";
import type { AdminRole } from "@/lib/adminPermissions";
import {
  S, BadgeEl, PlanBadge, Th,
  PAYMENT_META, CLIENT_META,
  fmtDate, StatGrid, StatCell, TabBar, TabButton,
} from "@/modules/admin/components/adminUi";
import { loadGlobalSettings, saveGlobalSettings } from "@/lib/globalSettings";
import { ClientDrawer } from "@/modules/admin/components/ClientDrawer";
import { SalesRepView } from "@/modules/admin/components/SalesRepView";
import { TransfersView } from "@/modules/admin/components/TransfersView";
import PreClientsView from "@/modules/admin/components/PreClientsView";
import { FinanceView } from "@/modules/admin/components/FinanceView";
import { MoreHorizontal, Copy, ExternalLink, Lock, Unlock, Eye, UserCog, EyeOff, Check, X, ShieldCheck, Pencil } from "lucide-react";
import {
  getAdminUsers, createAdminUser, updateAdminUser, resetAdminPassword,
  generateAdminTempPassword, type AdminUser, type AdminUserStatus,
  SUPERADMIN_ID_CONST,
} from "@/lib/adminUsers";
import {
  PERMISSION_MODULES, PERMISSION_LABELS, roleBasePermissions,
  ALL_PERMISSIONS, effectivePermissions,
} from "@/lib/adminPermissions";
import type { Permission } from "@/lib/adminPermissions";
import { normalizePhoneNumber, formatPhoneDisplay } from "@/lib/phoneUtils";

// ── Login ─────────────────────────────────────────────────────────────────────

function AdminLogin() {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(identifier, password)) setError("Las credenciales no son válidas o el usuario no tiene acceso.");
  }

  // Fills the form fields on explicit user interaction only — never on mount.
  function fillDemoAccount(phone: string, pwd: string) {
    setIdentifier(phone);
    setPassword(pwd);
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      <div className="w-full max-w-sm rounded-[var(--radius-surface)] p-8 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,.35)]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-control)] mb-4 bg-[var(--accent)]">
            <span className="text-[var(--bg-base)] text-sm font-bold">A2</span>
          </div>
          <h1 className="text-[var(--text-primary)] font-semibold text-base tracking-tight">Admin J2EC</h1>
          <p className="text-[var(--text-muted)] text-xs mt-1">Ingresa con tu número de teléfono</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={S.label}>Número de teléfono</label>
            <input className={S.input} type="tel" value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
              autoComplete="tel" placeholder="Número telefónico" />
          </div>
          <div>
            <label className={S.label}>Contraseña</label>
            <input className={S.input} type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && (
            <p className="text-[var(--danger)] text-xs">
              {error}
            </p>
          )}
          <button type="submit" className={`${S.btnPrimary} w-full mt-2`}>Ingresar</button>
        </form>

        <div className="mt-5 p-4 bg-white/[0.03] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] text-[10px] text-[var(--text-muted)] space-y-2">
          <p className="font-semibold text-[var(--text-faint)] uppercase tracking-[0.06em]">Cuentas de prueba</p>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-[var(--text-primary)] font-medium">Admin</p>
              <p>Teléfono: <span className="font-mono">5200000002</span></p>
              <p>Contraseña: <span className="font-mono">admin123</span></p>
            </div>
            <button
              type="button"
              onClick={() => fillDemoAccount("5200000002", "admin123")}
              className="text-[10px] text-[var(--accent)] font-semibold hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded"
            >
              Usar esta cuenta
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
            <div className="space-y-0.5">
              <p className="text-[var(--text-primary)] font-medium">Contador</p>
              <p>Teléfono: <span className="font-mono">5200000003</span></p>
              <p>Contraseña: <span className="font-mono">conta123</span></p>
            </div>
            <button
              type="button"
              onClick={() => fillDemoAccount("5200000003", "conta123")}
              className="text-[10px] text-[var(--accent)] font-semibold hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded"
            >
              Usar esta cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Client status derivation ──────────────────────────────────────────────────

type DerivedStatus =
  | "active" | "payment_overdue" | "payment_pending" | "access_blocked"
  | "config_incomplete" | "page_hidden" | "suspended" | "cancelled";

const DERIVED_STATUS_META: Record<DerivedStatus, { label: string; cls: string }> = {
  active:             { label: "Activo",             cls: "text-[var(--accent)] font-medium" },
  payment_overdue:    { label: "Pago vencido",       cls: "text-[var(--danger)] font-medium" },
  payment_pending:    { label: "Pago pendiente",     cls: "text-[var(--text-muted)] font-medium" },
  access_blocked:     { label: "Acceso bloqueado",   cls: "text-[var(--danger)] font-medium" },
  config_incomplete:  { label: "Config. incompleta", cls: "text-[var(--text-muted)] font-medium" },
  page_hidden:        { label: "Página oculta",      cls: "text-[var(--text-muted)] font-medium" },
  suspended:          { label: "Suspendido",         cls: "text-[var(--text-muted)] font-medium" },
  cancelled:          { label: "Cancelado",          cls: "text-[var(--danger)] font-medium" },
};

function deriveStatus(c: AdminClient): DerivedStatus {
  if (c.clientStatus === "cancelled") return "cancelled";
  if (c.clientStatus === "suspended") return "suspended";
  if (!c.accessActive) return "access_blocked";
  if (c.paymentStatus === "overdue") return "payment_overdue";
  if (c.paymentStatus === "pending" || c.paymentStatus === "grace_period") return "payment_pending";
  if (c.onboardingStatus !== "ready") return "config_incomplete";
  if (c.publicPageStatus === "hidden") return "page_hidden";
  return "active";
}

// ── Filter chips ──────────────────────────────────────────────────────────────

type QuickFilter =
  | "all" | "payment_pending" | "expiring" | "access_blocked"
  | "config_incomplete" | "inactive";

const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: "all",               label: "Todos"                },
  { key: "payment_pending",   label: "Pago pendiente"       },
  { key: "expiring",          label: "Por vencer"           },
  { key: "access_blocked",    label: "Acceso bloqueado"     },
  { key: "config_incomplete", label: "Onboarding incompleto"},
  { key: "inactive",          label: "Inactivos"            },
];

function applyQuickFilter(clients: AdminClient[], filter: QuickFilter): AdminClient[] {
  if (filter === "all") return clients;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in30 = new Date(today); in30.setDate(today.getDate() + 30);
  return clients.filter((c) => {
    if (filter === "payment_pending")   return c.paymentStatus === "pending" || c.paymentStatus === "overdue" || c.paymentStatus === "grace_period";
    if (filter === "expiring") {
      const end = new Date(c.contractEndDate + "T00:00:00");
      return end >= today && end <= in30 && c.clientStatus === "active";
    }
    if (filter === "access_blocked")    return !c.accessActive;
    if (filter === "config_incomplete") return c.onboardingStatus !== "ready" && c.clientStatus === "active";
    if (filter === "inactive")          return c.clientStatus !== "active";
    return true;
  });
}

function applySearch(clients: AdminClient[], search: string): AdminClient[] {
  if (!search.trim()) return clients;
  const q = search.toLowerCase();
  return clients.filter((c) =>
    c.clientNumber.toLowerCase().includes(q) ||
    c.specialist.publicName.toLowerCase().includes(q) ||
    c.specialist.firstName.toLowerCase().includes(q) ||
    c.specialist.lastNamePaternal.toLowerCase().includes(q) ||
    c.business.name.toLowerCase().includes(q) ||
    (c.specialist.phone ?? "").includes(q) ||
    c.subdomain.includes(q) ||
    (c.businessType ? BUSINESS_TYPE_LABELS[c.businessType as BusinessType].toLowerCase().includes(q) : false)
  );
}

type VerticalFilter = "all" | "especialistas" | "gimnasios" | "otro";
const VERTICAL_FILTERS: { key: VerticalFilter; label: string }[] = [
  { key: "all",          label: "Todos los tipos" },
  { key: "especialistas", label: "Especialistas"  },
  { key: "gimnasios",    label: "Gimnasios"       },
  { key: "otro",         label: "Otros"           },
];
function applyVerticalFilter(clients: AdminClient[], vertical: VerticalFilter): AdminClient[] {
  if (vertical === "all") return clients;
  return clients.filter((c) => getBusinessVertical(c.businessType) === vertical);
}

// ── Stat cards ────────────────────────────────────────────────────────────────

function StatCards({ clients }: { clients: AdminClient[] }) {
  const { preClients } = useAdminStore();
  const pipeline = preClients.filter((p) => p.status !== "converted" && p.status !== "discarded").length;

  const stats = [
    { label: "Clientes",    value: clients.length,                                               sub: `${clients.filter((c) => c.clientStatus === "active").length} activos` },
    { label: "Al día",      value: clients.filter((c) => c.paymentStatus === "paid").length,     sub: `${clients.filter((c) => c.paymentStatus === "overdue").length} vencidos` },
    { label: "Preclientes", value: pipeline,                                                      sub: `${preClients.filter((p) => p.status === "converted").length} convertidos` },
  ];

  return (
    <StatGrid cols={3} className="mb-6">
      {stats.map((s) => (
        <StatCell key={s.label} label={s.label} value={s.value} sub={s.sub} />
      ))}
    </StatGrid>
  );
}

// ── Actions menu ──────────────────────────────────────────────────────────────

function ActionsMenu({ client, onOpenDetail }: { client: AdminClient; onOpenDetail: () => void }) {
  const { setAccess } = useAdminStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const publicUrl = `${window?.location?.origin ?? ""}/${client.subdomain.split(".")[0]}`;

  const items: { label: string; icon: React.ReactNode; action: () => void; danger?: boolean }[] = [
    {
      label: "Ver detalle",
      icon: <Eye className="w-3.5 h-3.5" />,
      action: () => { onOpenDetail(); setOpen(false); },
    },
    {
      label: "Copiar N° cliente",
      icon: <Copy className="w-3.5 h-3.5" />,
      action: () => { navigator.clipboard.writeText(client.clientNumber).catch(() => null); setOpen(false); },
    },
    {
      label: "Abrir página pública",
      icon: <ExternalLink className="w-3.5 h-3.5" />,
      action: () => { window.open(publicUrl, "_blank"); setOpen(false); },
    },
    client.accessActive
      ? {
          label: "Bloquear acceso",
          icon: <Lock className="w-3.5 h-3.5" />,
          action: () => { setAccess(client.id, false); setOpen(false); },
          danger: true,
        }
      : {
          label: "Desbloquear acceso",
          icon: <Unlock className="w-3.5 h-3.5" />,
          action: () => { setAccess(client.id, true); setOpen(false); },
        },
  ];

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        aria-label="Acciones"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-[var(--radius-surface)] bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,.35)] overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-left transition-colors hover:bg-[var(--bg-elevated)] ${item.danger ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Clients tab ───────────────────────────────────────────────────────────────

type MainTab = "clients" | "preclients" | "transfers" | "vendors" | "finance" | "users" | "settings";

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "clients",    label: "Clientes"         },
  { key: "preclients", label: "Preclientes"      },
  { key: "transfers",  label: "Transferencias"   },
  { key: "vendors",    label: "Vendedores"       },
  { key: "finance",    label: "Finanzas"         },
  { key: "users",      label: "Usuarios admin"   },
  { key: "settings",   label: "Configuración"    },
];

function ClientsTab({ onOpenClient }: { onOpenClient: (id: string) => void }) {
  const { clients } = useAdminStore();
  const { can } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [verticalFilter, setVerticalFilter] = useState<VerticalFilter>("all");
  const filtered = useMemo(
    () => applySearch(applyVerticalFilter(applyQuickFilter(clients, quickFilter), verticalFilter), search),
    [clients, quickFilter, verticalFilter, search]
  );
  const hasActive = quickFilter !== "all" || verticalFilter !== "all" || search.trim().length > 0;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in30 = new Date(today); in30.setDate(today.getDate() + 30);

  return (
    <>
      <StatCards clients={clients} />

      {/* Search + quick filters + vertical filter */}
      <div className="flex flex-col gap-2.5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <input
            className={`${S.input} sm:max-w-xs`}
            placeholder="N° cliente, responsable, negocio, tel…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setQuickFilter(f.key === quickFilter ? "all" : f.key)}
              className={`text-[11px] font-medium transition-colors whitespace-nowrap pb-[3px] border-b focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                quickFilter === f.key
                  ? "text-[var(--text-primary)] border-[var(--accent)]"
                  : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="w-px h-4 bg-[var(--border)] mx-0.5" />
          {VERTICAL_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setVerticalFilter(f.key === verticalFilter ? "all" : f.key)}
              className={`text-[11px] font-medium transition-colors whitespace-nowrap pb-[3px] border-b focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                verticalFilter === f.key
                  ? "text-[var(--text-primary)] border-[var(--accent)]"
                  : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
          {hasActive && (
            <button
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-1"
              onClick={() => { setQuickFilter("all"); setVerticalFilter("all"); setSearch(""); }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-none overflow-hidden bg-[var(--bg-base)] border-[0.5px] border-[var(--border)]">
        <div className="px-5 py-3 border-b-[0.5px] border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-muted)]">
            {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
            {hasActive ? " · filtrados" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                <Th>N° cliente</Th>
                <Th>Responsable / Negocio</Th>
                <Th>Tipo</Th>
                <Th>Plan</Th>
                <Th>Pago</Th>
                <Th>Contrato</Th>
                <Th>Estado</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[var(--text-muted)] text-sm">
                    Sin resultados
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const contractEnd = new Date(c.contractEndDate + "T00:00:00");
                const expired  = contractEnd < today;
                const expiring = !expired && contractEnd <= in30;
                const status   = deriveStatus(c);
                const statusMeta = DERIVED_STATUS_META[status];

                return (
                  <tr
                    key={c.id}
                    className="group border-b-[0.5px] border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--bg-elevated)] cursor-pointer"
                    onClick={() => onOpenClient(c.id)}
                  >
                    {/* N° cliente */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.clientNumber).catch(() => null); }}
                        title="Copiar"
                        className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        {c.clientNumber}
                      </button>
                    </td>

                    {/* Responsable + negocio + teléfono */}
                    <td className="px-5 py-3.5 min-w-[200px]">
                      <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                        {c.specialist.publicName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                        {c.business.name}
                      </p>
                      {c.specialist.phone && (
                        <a
                          href={`tel:${c.specialist.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mt-0.5 block"
                        >
                          {c.specialist.phone}
                        </a>
                      )}
                    </td>

                    {/* Tipo de negocio */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[10.5px] font-medium text-[var(--text-muted)]">
                        {c.businessType ? BUSINESS_TYPE_LABELS[c.businessType as BusinessType] : "—"}
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <PlanBadge plan={c.plan} />
                    </td>

                    {/* Pago */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <BadgeEl meta={PAYMENT_META[c.paymentStatus]} />
                    </td>

                    {/* Contrato */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {CONTRACT_TYPE_LABELS[c.contractType]}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${expired ? "text-[var(--danger)]" : expiring ? "text-amber-400" : "text-[var(--text-muted)]"}`}>
                        Vence {fmtDate(c.contractEndDate)}
                      </p>
                    </td>

                    {/* Estado consolidado */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[11px] tracking-wide ${statusMeta.cls}`}>
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu client={c} onOpenDetail={() => onOpenClient(c.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
}

// ── Admin Users tab ───────────────────────────────────────────────────────────

const USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  active:               "Activo",
  inactive:             "Inactivo",
  blocked:              "Bloqueado",
  pending_first_access: "Pendiente de acceso",
};

const USER_STATUS_CLS: Record<AdminUserStatus, string> = {
  active:               "text-[var(--accent)] font-medium",
  inactive:             "text-[var(--text-muted)] font-medium",
  blocked:              "text-[var(--danger)] font-medium",
  pending_first_access: "text-[var(--text-muted)] font-medium",
};

interface UserFormData {
  firstName: string; lastName: string; phone: string; email: string;
  role: AdminRole; password: string; confirmPassword: string;
  mustChangePassword: boolean;
}

function emptyUserForm(): UserFormData {
  return { firstName: "", lastName: "", phone: "", email: "", role: "admin", password: "", confirmPassword: "", mustChangePassword: true };
}

function PermissionMatrix({
  role, permissions, onChange,
}: {
  role: AdminRole;
  permissions: { granted: Permission[]; revoked: Permission[] };
  onChange: (p: { granted: Permission[]; revoked: Permission[] }) => void;
}) {
  const basePerms = new Set(roleBasePermissions(role));

  function toggle(perm: Permission) {
    const isBase = basePerms.has(perm);
    const isGranted = permissions.granted.includes(perm);
    const isRevoked = permissions.revoked.includes(perm);

    if (isBase && !isRevoked) {
      // Currently active via role → revoke it
      onChange({ granted: permissions.granted.filter(p => p !== perm), revoked: [...permissions.revoked, perm] });
    } else if (isBase && isRevoked) {
      // Revoked → restore to role default
      onChange({ granted: permissions.granted, revoked: permissions.revoked.filter(p => p !== perm) });
    } else if (!isBase && isGranted) {
      // Manually granted → remove grant
      onChange({ granted: permissions.granted.filter(p => p !== perm), revoked: permissions.revoked });
    } else {
      // Not in role and not granted → grant it
      onChange({ granted: [...permissions.granted, perm], revoked: permissions.revoked });
    }
  }

  function getState(perm: Permission): "role" | "granted" | "revoked" | "none" {
    const isBase = basePerms.has(perm);
    if (permissions.revoked.includes(perm)) return "revoked";
    if (isBase) return "role";
    if (permissions.granted.includes(perm)) return "granted";
    return "none";
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <div className="flex flex-wrap gap-4 text-[10px] text-[var(--text-muted)] mb-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[var(--bg-elevated)] border border-[var(--accent)] inline-block" /> Heredado del rol</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[var(--accent-muted)] border border-[var(--accent)] inline-block" /> Concedido manualmente</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[var(--bg-elevated)] border border-[var(--danger)] inline-block" /> Revocado</span>
      </div>
      {PERMISSION_MODULES.map(mod => (
        <div key={mod.label}>
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">{mod.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {mod.permissions.map(perm => {
              const state = getState(perm);
              const cls = state === "role" ? "bg-[var(--bg-elevated)] border-[var(--accent)] text-[var(--accent)]"
                : state === "granted" ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
                : state === "revoked" ? "bg-[var(--bg-elevated)] border-[var(--danger)] text-[var(--danger)] line-through"
                : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]";
              return (
                <button
                  key={perm}
                  onClick={() => toggle(perm)}
                  className={`text-[10px] px-2 py-1 rounded border font-medium transition-colors ${cls}`}
                  title={`${mod.label}: ${PERMISSION_LABELS[perm]}`}
                >
                  {PERMISSION_LABELS[perm]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserModal({ initial, isEditing = false, onSave, onClose, actorRole }: {
  initial?: Partial<UserFormData & { id: string; permissions?: AdminUser["permissions"] }>;
  isEditing?: boolean;
  onSave: (f: UserFormData, perms: AdminUser["permissions"]) => void;
  onClose: () => void;
  actorRole: AdminRole;
}) {
  const [form, setForm] = useState<UserFormData>({ ...emptyUserForm(), ...initial });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMatrix, setShowMatrix] = useState(false);
  const [perms, setPerms] = useState<{ granted: Permission[]; revoked: Permission[] }>({
    granted: (initial?.permissions?.granted ?? []) as Permission[],
    revoked: (initial?.permissions?.revoked ?? []) as Permission[],
  });
  const set = (k: keyof UserFormData, v: string | boolean) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Requerido";
    if (!form.lastName.trim()) e.lastName = "Requerido";
    if (!form.phone.trim()) e.phone = "Requerido";
    else if (!normalizePhoneNumber(form.phone)) e.phone = "Teléfono inválido";
    if (!isEditing) {
      if (!form.password.trim()) e.password = "Requerido";
      else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    } else if (form.password) {
      if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
      if (form.password !== form.confirmPassword) e.confirmPassword = "No coinciden";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const isSuperadmin = actorRole === "superadmin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] shadow-[0_1px_3px_rgba(0,0,0,.35)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="font-semibold text-[var(--text-primary)] text-sm">{isEditing ? "Editar usuario" : "Nuevo usuario administrativo"}</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Cerrar modal"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={S.label}>Nombre *</label>
              <input value={form.firstName} onChange={e => set("firstName", e.target.value)} className={S.input} />
              {errors.firstName && <p className="text-[11px] text-[var(--danger)] mt-0.5">{errors.firstName}</p>}
            </div>
            <div>
              <label className={S.label}>Apellido *</label>
              <input value={form.lastName} onChange={e => set("lastName", e.target.value)} className={S.input} />
              {errors.lastName && <p className="text-[11px] text-[var(--danger)] mt-0.5">{errors.lastName}</p>}
            </div>
            <div>
              <label className={S.label}>Teléfono * (acceso)</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Ej. 55 1234 5678" className={S.input} />
              {errors.phone && <p className="text-[11px] text-[var(--danger)] mt-0.5">{errors.phone}</p>}
            </div>
            <div>
              <label className={S.label}>Correo (opcional)</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={S.input} />
            </div>
            <div className="col-span-2">
              <label className={S.label}>Rol</label>
              <select value={form.role} onChange={e => set("role", e.target.value as AdminRole)} className={S.input}>
                {SELECTABLE_ROLES.map(r => (
                  <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={S.label}>{isEditing ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña *"}</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                  autoComplete="new-password" className={`${S.input} pr-8`} />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-2.5 top-2 text-[var(--text-muted)]" aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-[var(--danger)] mt-0.5">{errors.password}</p>}
            </div>
            <div>
              <label className={S.label}>Confirmar contraseña</label>
              <input type={showPwd ? "text" : "password"} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                autoComplete="new-password" className={S.input} />
              {errors.confirmPassword && <p className="text-[11px] text-[var(--danger)] mt-0.5">{errors.confirmPassword}</p>}
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="mustChange" checked={form.mustChangePassword} onChange={e => set("mustChangePassword", e.target.checked)} className="rounded" />
              <label htmlFor="mustChange" className="text-xs text-[var(--text-muted)]">Solicitar cambio de contraseña en el primer acceso</label>
            </div>
          </div>

          {/* Permissions matrix (superadmin only) */}
          {isSuperadmin && (
            <div>
              <button onClick={() => setShowMatrix(v => !v)}
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {showMatrix ? "Ocultar" : "Personalizar"} permisos
              </button>
              {showMatrix && (
                <div className="mt-3 p-4 bg-[var(--bg-elevated)] rounded-[var(--radius-surface)] border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">Permisos para: <span className="text-[var(--accent)]">{ADMIN_ROLE_LABELS[form.role]}</span></p>
                    <button onClick={() => setPerms({ granted: [], revoked: [] })} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">Restaurar rol</button>
                  </div>
                  <PermissionMatrix role={form.role} permissions={perms} onChange={setPerms} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] sticky bottom-0 bg-[var(--bg-surface)]">
          <button onClick={onClose} className={S.btnSecondary}>Cancelar</button>
          <button onClick={() => { if (validate()) onSave(form, { granted: perms.granted, revoked: perms.revoked }); }} className={S.btnPrimary}>
            {isEditing ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ userId, userName, onClose, actorRole }: {
  userId: string; userName: string; onClose: () => void; actorRole: AdminRole;
}) {
  const [step, setStep] = useState(0);
  const [tempPwd, setTempPwd] = useState(() => generateAdminTempPassword());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  function doReset() {
    const result = resetAdminPassword(userId, tempPwd, actorRole);
    if (result.success) { setStep(2); } else { setError(result.message); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] shadow-[0_1px_3px_rgba(0,0,0,.35)] w-full max-w-sm">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm">Restablecer contraseña — {userName}</h3>
        </div>
        <div className="p-6">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-muted)]">Se generará una contraseña temporal. El usuario deberá cambiarla en su próximo acceso.</p>
              <div>
                <label className={S.label}>Contraseña temporal</label>
                <div className="flex gap-2">
                  <input value={tempPwd} onChange={e => setTempPwd(e.target.value)} className={`${S.input} font-mono`} />
                  <button onClick={() => setTempPwd(generateAdminTempPassword())} className={S.btnSecondary} title="Regenerar">↺</button>
                </div>
              </div>
              {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={onClose} className={S.btnSecondary}>Cancelar</button>
                <button onClick={() => setStep(1)} className={S.btnPrimary}>Continuar</button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">¿Confirmar restablecimiento?</p>
              <p className="text-xs text-[var(--text-muted)]">La contraseña actual de <strong>{userName}</strong> quedará inválida inmediatamente.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setStep(0)} className={S.btnSecondary}>Atrás</button>
                <button onClick={doReset} className={S.btnDanger}>Restablecer</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Check className="w-5 h-5" />
                <p className="font-semibold text-sm">Contraseña restablecida</p>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Comparte esta contraseña de forma segura. No se mostrará de nuevo.</p>
              <div className="flex gap-2 items-center bg-[var(--bg-elevated)] rounded-[var(--radius-surface)] p-3 border border-[var(--border)]">
                <code className="font-mono text-sm text-[var(--text-primary)] flex-1 select-all">{tempPwd}</code>
                <button onClick={() => { navigator.clipboard.writeText(tempPwd); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="text-xs text-[var(--accent)]">{copied ? "Copiado" : "Copiar"}</button>
              </div>
              <button onClick={onClose} className={`${S.btnPrimary} w-full`}>Listo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminUsersView() {
  const { role: actorRole, can } = useAdminAuth();
  // Superadmin is hidden from the operational Usuarios administrativos list
  // until there is a backend — it still exists internally (see adminUsers.ts).
  const visibleUsers = (list: AdminUser[]) => list.filter((u) => u.id !== SUPERADMIN_ID_CONST);
  const [users, setUsers] = useState<AdminUser[]>(() => visibleUsers(getAdminUsers()));
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ userId: string; name: string; newStatus: AdminUserStatus } | null>(null);

  function refresh() { setUsers(visibleUsers(getAdminUsers())); }

  function handleCreate(f: UserFormData, perms: AdminUser["permissions"]) {
    const result = createAdminUser({
      firstName: f.firstName, lastName: f.lastName, phone: f.phone,
      email: f.email || undefined, role: f.role,
      initialPassword: f.password, mustChangePassword: f.mustChangePassword,
    }, "Superadmin");
    if (result.success) { refresh(); setShowCreate(false); }
    else alert(result.message);
  }

  function handleUpdate(f: UserFormData, perms: AdminUser["permissions"]) {
    if (!editing) return;
    const changes: Parameters<typeof updateAdminUser>[1] = {
      firstName: f.firstName, lastName: f.lastName, phone: f.phone,
      email: f.email || undefined, role: f.role,
      mustChangePassword: f.mustChangePassword, permissions: perms,
    };
    const result = updateAdminUser(editing.id, changes, actorRole);
    if (result.success) { refresh(); setEditing(null); }
    else alert(result.message);
  }

  function requestStatusChange(u: AdminUser, newStatus: AdminUserStatus) {
    if (u.id === SUPERADMIN_ID_CONST || newStatus === u.status) return;
    if ((newStatus === "inactive" || newStatus === "blocked") && u.status === "active") {
      setStatusConfirm({ userId: u.id, name: `${u.firstName} ${u.lastName}`, newStatus });
    } else {
      applyStatusChange(u.id, newStatus);
    }
  }

  function applyStatusChange(userId: string, newStatus: AdminUserStatus) {
    updateAdminUser(userId, { status: newStatus }, actorRole);
    refresh();
    setStatusConfirm(null);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Usuarios administrativos</h2>
          <p className="text-[11px] text-[var(--text-muted)]">Acceso al panel de administración J2EC. Login con número de teléfono.</p>
        </div>
        {can("adminUsers.create") && (
          <button onClick={() => setShowCreate(true)} className={S.btnPrimary}>
            + Nuevo usuario
          </button>
        )}
      </div>

      <div className="rounded-none border-[0.5px] border-[var(--border)] overflow-hidden bg-[var(--bg-base)]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <Th>Usuario</Th>
              <Th>Teléfono</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th>Último acceso</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map(u => {
              const isSuperadminRow = u.id === SUPERADMIN_ID_CONST;
              return (
                <tr key={u.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--accent)] text-[10px] font-bold">{u.firstName[0]}{u.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{u.firstName} {u.lastName}</p>
                        {u.email && <p className="text-[10px] text-[var(--text-muted)]">{u.email}</p>}
                      </div>
                      {isSuperadminRow && <span className="text-[10px] text-[var(--accent)] font-semibold">ÚNICO</span>}
                      {u.mustChangePassword && <span className="text-[10px] text-[var(--text-muted)]">cambiar pwd</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--text-muted)]">{formatPhoneDisplay(u.phone)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)]">{ADMIN_ROLE_LABELS[u.role]}</span>
                    {u.permissions && (u.permissions.granted?.length || u.permissions.revoked?.length) ? (
                      <span className="ml-1 text-[9px] text-[var(--accent)]">personalizado</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {can("adminUsers.deactivate") && !isSuperadminRow ? (
                      <select
                        value={u.status}
                        onChange={(e) => requestStatusChange(u, e.target.value as AdminUserStatus)}
                        aria-label={`Estado de ${u.firstName} ${u.lastName}`}
                        className={`text-[11px] cursor-pointer bg-transparent border-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-[var(--radius-control)] ${USER_STATUS_CLS[u.status]}`}
                      >
                        {(Object.keys(USER_STATUS_LABELS) as AdminUserStatus[]).map((s) => (
                          <option key={s} value={s}>{USER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-[11px] ${USER_STATUS_CLS[u.status]}`}>
                        {USER_STATUS_LABELS[u.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-muted)]">
                    {u.lastAccessAt ? new Date(u.lastAccessAt).toLocaleDateString("es-MX") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {can("adminUsers.edit") && !isSuperadminRow && (
                        <button onClick={() => setEditing(u)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                          aria-label={`Editar usuario ${u.firstName} ${u.lastName}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {can("adminUsers.password.reset") && !isSuperadminRow && (
                        <button onClick={() => setResetTarget(u)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                          aria-label={`Restablecer contraseña de ${u.firstName} ${u.lastName}`}>
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <UserModal onSave={handleCreate} onClose={() => setShowCreate(false)} actorRole={actorRole} />
      )}
      {editing && (
        <UserModal
          isEditing
          initial={{ ...editing, firstName: editing.firstName, lastName: editing.lastName, phone: editing.phone, email: editing.email ?? "", role: editing.role, password: "", confirmPassword: "", mustChangePassword: editing.mustChangePassword }}
          onSave={handleUpdate}
          onClose={() => setEditing(null)}
          actorRole={actorRole}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal userId={resetTarget.id} userName={`${resetTarget.firstName} ${resetTarget.lastName}`}
          onClose={() => { setResetTarget(null); refresh(); }} actorRole={actorRole} />
      )}
      {statusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] p-6 max-w-sm w-full mx-4 shadow-[0_1px_3px_rgba(0,0,0,.35)]">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
              {statusConfirm.newStatus === "blocked" ? "¿Bloquear usuario?" : "¿Desactivar usuario?"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              {statusConfirm.newStatus === "blocked"
                ? `${statusConfirm.name} no podrá acceder al sistema y su sesión quedará invalidada.`
                : `${statusConfirm.name} no podrá iniciar sesión hasta que se reactive su cuenta.`}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStatusConfirm(null)}
                className="px-4 py-2 rounded-lg text-xs border-[0.5px] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                Cancelar
              </button>
              <button
                onClick={() => applyStatusChange(statusConfirm.userId, statusConfirm.newStatus)}
                className="px-4 py-2 rounded-lg text-xs bg-[var(--danger)] text-white font-semibold">
                {statusConfirm.newStatus === "blocked" ? "Bloquear" : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings tab (Superadmin only) ───────────────────────────────────────────

function SettingsView() {
  const store = useAdminStore();
  const [phone, setPhone] = useState(() => loadGlobalSettings().customerSupport.phone);
  const [phoneSaved, setPhoneSaved] = useState(false);

  const emptyBank: Omit<BankAccountConfig, "id" | "createdAt" | "updatedAt"> = {
    bank: "", accountHolder: "", accountNumber: "", clabe: "",
    cardNumber: "", requiredConcept: "", paymentInstructions: "", active: true,
  };
  const [bankForm, setBankForm] = useState<Omit<BankAccountConfig, "id" | "createdAt" | "updatedAt">>(() => {
    if (store.bankAccountConfig) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = store.bankAccountConfig;
      return rest;
    }
    return emptyBank;
  });
  const [bankSaved, setBankSaved] = useState(false);

  function handlePhoneSave() {
    saveGlobalSettings({ customerSupport: { phone: phone.trim() } });
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 2500);
  }

  function handleBankSave() {
    store.saveBankAccountConfig(bankForm);
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 2500);
  }

  const inp = S.input;
  const lbl = S.label;

  return (
    <div className="max-w-lg space-y-8">
      {/* Atención a cliente */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Configuración global</h2>
          <p className="text-[11px] text-[var(--text-muted)]">Estos valores se muestran a todos los especialistas de la plataforma.</p>
        </div>
        <div className="rounded-[var(--radius-surface)] p-5 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] space-y-4">
          <p className="text-[9.5px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.08em]">Atención a cliente</p>
          <div>
            <label className={lbl}>Número telefónico</label>
            <input className={inp} type="tel" placeholder="55 1234 5678" value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneSaved(false); }} />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Se mostrará en la sección "Atención a cliente" de cada especialista.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePhoneSave} className={`${S.btnPrimary} px-5`}>Guardar</button>
            {phoneSaved && <span className="text-[11px] text-[var(--accent)]">¡Guardado!</span>}
          </div>
        </div>
      </div>

      {/* Cuenta bancaria */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Cuenta bancaria para mensualidades</h2>
          <p className="text-[11px] text-[var(--text-muted)]">Esta información se reutiliza en las instrucciones de pago mostradas a los especialistas.</p>
        </div>
        <div className="rounded-[var(--radius-surface)] p-5 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Banco</label><input className={inp} value={bankForm.bank} onChange={(e) => setBankForm(v => ({ ...v, bank: e.target.value }))} placeholder="BBVA, Banamex…" /></div>
            <div><label className={lbl}>Titular</label><input className={inp} value={bankForm.accountHolder} onChange={(e) => setBankForm(v => ({ ...v, accountHolder: e.target.value }))} /></div>
            <div><label className={lbl}>Número de cuenta</label><input className={inp} value={bankForm.accountNumber} onChange={(e) => setBankForm(v => ({ ...v, accountNumber: e.target.value }))} /></div>
            <div><label className={lbl}>CLABE interbancaria</label><input className={inp} value={bankForm.clabe} onChange={(e) => setBankForm(v => ({ ...v, clabe: e.target.value }))} maxLength={18} /></div>
            <div><label className={lbl}>Tarjeta (opcional)</label><input className={inp} value={bankForm.cardNumber ?? ""} onChange={(e) => setBankForm(v => ({ ...v, cardNumber: e.target.value }))} maxLength={16} /></div>
            <div><label className={lbl}>Concepto requerido</label><input className={inp} value={bankForm.requiredConcept ?? ""} onChange={(e) => setBankForm(v => ({ ...v, requiredConcept: e.target.value }))} placeholder="Mensualidad [N° cliente]" /></div>
            <div className="col-span-2">
              <label className={lbl}>Instrucciones de pago</label>
              <textarea className={inp} rows={3} value={bankForm.paymentInstructions ?? ""} onChange={(e) => setBankForm(v => ({ ...v, paymentInstructions: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={bankForm.active} onChange={(e) => setBankForm(v => ({ ...v, active: e.target.checked }))} />
            <span className="text-[11px] text-[var(--text-primary)]">Cuenta activa</span>
          </label>
          <div className="flex items-center gap-3">
            <button onClick={handleBankSave} className={S.btnPrimary}>Guardar cuenta</button>
            {bankSaved && <span className="text-[11px] text-[var(--accent)]">¡Guardado!</span>}
          </div>
        </div>
        {store.bankAccountConfig && (
          <div className="rounded-[var(--radius-surface)] p-4 bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)] mb-2">Datos actuales</p>
            <p>Banco: <span className="text-[var(--text-primary)]">{store.bankAccountConfig.bank}</span></p>
            <p>Titular: <span className="text-[var(--text-primary)]">{store.bankAccountConfig.accountHolder}</span></p>
            <p>CLABE: <span className="font-mono text-[var(--text-primary)]">{store.bankAccountConfig.clabe}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Access denied ─────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-[var(--text-muted)] text-sm">No tienes permiso para acceder a esta sección.</p>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const { logout, role, displayName, can } = useAdminAuth();
  const [mainTab, setMainTab] = useState<MainTab>("clients");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleTabs = MAIN_TABS.filter((t) => {
    // Both "settings" and "users" are Superadmin-only
    if (t.key === "settings") return role === "superadmin";
    if (t.key === "users")    return role === "superadmin";
    if (t.key === "vendors")  return can("vendors.view");
    if (t.key === "finance")  return can("finance.view");
    if (t.key === "transfers") return can("transfers.view");
    if (t.key === "preclients") return can("preclients.view");
    return can("clients.view");
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 border-b-[0.5px] border-[var(--border)] bg-[var(--bg-base)]">
        <div className="max-w-[1160px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[var(--accent)] text-xs font-medium tracking-[0.3em] pl-[0.3em]">J2EC ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] hidden sm:block">{displayName}</span>
              <span className="text-[10px] border-[0.5px] border-[var(--border-strong)] rounded-[var(--radius-control)] px-2 py-1 text-[var(--text-muted)]">
                {ADMIN_ROLE_LABELS[role] ?? role}
              </span>
            </div>
            <button onClick={logout} className={S.btnGhost}>Cerrar sesión</button>
          </div>
        </div>
        <TabBar className="max-w-[1160px] mx-auto px-6">
          {visibleTabs.map((t) => (
            <TabButton key={t.key} active={mainTab === t.key} onClick={() => setMainTab(t.key)} className="px-4 py-3 mr-2">
              {t.label}
            </TabButton>
          ))}
        </TabBar>
      </header>

      <main className="max-w-[1160px] mx-auto px-6 py-7">
        {mainTab === "clients"    && (can("clients.view") ? <ClientsTab onOpenClient={setSelectedId} /> : <AccessDenied />)}
        {mainTab === "preclients" && (can("preclients.view") ? <PreClientsView /> : <AccessDenied />)}
        {mainTab === "transfers"  && (can("transfers.view")  ? <TransfersView />  : <AccessDenied />)}
        {mainTab === "vendors"    && (can("vendors.view")    ? <SalesRepView />   : <AccessDenied />)}
        {mainTab === "finance"    && (can("finance.view")    ? <FinanceView />    : <AccessDenied />)}
        {mainTab === "users"      && (role === "superadmin"  ? <AdminUsersView /> : <AccessDenied />)}
        {mainTab === "settings"   && (role === "superadmin"  ? <SettingsView />   : <AccessDenied />)}
      </main>

      {selectedId && <ClientDrawer clientId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
}
