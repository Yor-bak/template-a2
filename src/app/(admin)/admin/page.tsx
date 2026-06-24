"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useAdminAuth, BUSINESS_TYPE_LABELS } from "@/store/adminStore";
import type { AdminClient, BusinessType } from "@/types/user";
import {
  S, BadgeEl, PlanBadge, AccessBadge, Th,
  PAYMENT_META, CLIENT_META, ONBOARDING_META,
  fmtDate,
} from "@/modules/admin/components/adminUi";
import { loadGlobalSettings, saveGlobalSettings } from "@/lib/globalSettings";
import { ClientDrawer } from "@/modules/admin/components/ClientDrawer";
import { SalesRepView } from "@/modules/admin/components/SalesRepView";
import { TransfersView } from "@/modules/admin/components/TransfersView";
import PreClientsView from "@/modules/admin/components/PreClientsView";
import { FinanceView } from "@/modules/admin/components/FinanceView";

// Suppress unused import warning
void fmtDate;
void ONBOARDING_META;

// ── Login ─────────────────────────────────────────────────────────────────────

function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("admin@templatea2.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(email, password)) setError("Credenciales incorrectas");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      <div className="w-full max-w-sm rounded-2xl p-8 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 bg-[var(--accent)]">
            <span className="text-[var(--bg-base)] text-sm font-bold">A2</span>
          </div>
          <h1 className="text-[var(--text-primary)] font-semibold text-base tracking-tight">Template A2</h1>
          <p className="text-[var(--text-muted)] text-xs mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={S.label}>Correo electrónico</label>
            <input className={S.input} type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoComplete="email" />
          </div>
          <div>
            <label className={S.label}>Contraseña</label>
            <input className={S.input} type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && (
            <p className="text-[var(--danger)] text-xs bg-[var(--bg-elevated)] border-[0.5px] border-[var(--danger)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button type="submit" className={`${S.btnPrimary} w-full mt-2`}>
            Ingresar
          </button>
        </form>
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-6">admin123</p>
      </div>
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────

type FilterKey =
  | "all" | "active" | "suspended" | "cancelled"
  | "plan_pro" | "plan_standard"
  | "paid" | "pending" | "overdue" | "grace_period" | "blocked"
  | "page_published" | "page_hidden"
  | "ob_not_started" | "ob_in_progress" | "ob_ready"
  | "bt_dentist" | "bt_doctor" | "bt_physiotherapist" | "bt_nutritionist"
  | "bt_psychologist" | "bt_veterinarian" | "bt_other"
  | "contract_expiring" | "contract_expired";

interface FilterGroup {
  label: string;
  filters: { key: FilterKey; label: string }[];
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: "Estado",
    filters: [
      { key: "all",       label: "Todos"       },
      { key: "active",    label: "Activos"     },
      { key: "suspended", label: "Suspendidos" },
      { key: "cancelled", label: "Cancelados"  },
    ],
  },
  {
    label: "Plan",
    filters: [
      { key: "plan_pro",      label: "Pro"      },
      { key: "plan_standard", label: "Standard" },
    ],
  },
  {
    label: "Pago",
    filters: [
      { key: "paid",    label: "Al día"    },
      { key: "pending", label: "Pendiente" },
      { key: "overdue", label: "Vencido"   },
      { key: "blocked", label: "Bloqueado" },
    ],
  },
  {
    label: "Página",
    filters: [
      { key: "page_published", label: "Publicada" },
      { key: "page_hidden",    label: "Oculta"    },
    ],
  },
  {
    label: "Onboarding",
    filters: [
      { key: "ob_not_started", label: "Sin config" },
      { key: "ob_in_progress", label: "En proceso" },
      { key: "ob_ready",       label: "Lista"      },
    ],
  },
  {
    label: "Tipo",
    filters: [
      { key: "bt_dentist",         label: "Dentista"       },
      { key: "bt_doctor",          label: "Médico"         },
      { key: "bt_physiotherapist", label: "Fisioterapeuta" },
      { key: "bt_nutritionist",    label: "Nutriólogo/a"   },
      { key: "bt_psychologist",    label: "Psicólogo/a"    },
      { key: "bt_veterinarian",    label: "Veterinario/a"  },
      { key: "bt_other",           label: "Otro"           },
    ],
  },
  {
    label: "Contrato",
    filters: [
      { key: "contract_expiring", label: "Vence en 30 días" },
      { key: "contract_expired",  label: "Vencido"          },
    ],
  },
];

function applyFilter(clients: AdminClient[], filter: FilterKey, search: string): AdminClient[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const in30 = new Date(now);
  in30.setDate(now.getDate() + 30);

  let result = clients;
  if (filter !== "all") {
    result = result.filter((c) => {
      const contractEnd = new Date(c.contractEndDate + "T00:00:00");
      if (filter === "active")        return c.clientStatus === "active";
      if (filter === "suspended")     return c.clientStatus === "suspended";
      if (filter === "cancelled")     return c.clientStatus === "cancelled";
      if (filter === "plan_pro")      return c.isPro;
      if (filter === "plan_standard") return !c.isPro;
      if (filter === "paid")          return c.paymentStatus === "paid";
      if (filter === "pending")       return c.paymentStatus === "pending";
      if (filter === "overdue")       return c.paymentStatus === "overdue";
      if (filter === "grace_period")  return c.paymentStatus === "grace_period";
      if (filter === "blocked")       return !c.accessActive;
      if (filter === "page_published") return c.publicPageStatus === "published";
      if (filter === "page_hidden")   return c.publicPageStatus === "hidden";
      if (filter === "ob_not_started") return c.onboardingStatus === "not_started";
      if (filter === "ob_in_progress") return c.onboardingStatus === "in_progress";
      if (filter === "ob_ready")      return c.onboardingStatus === "ready";
      if (filter === "bt_dentist")         return c.businessType === "dentist";
      if (filter === "bt_doctor")          return c.businessType === "doctor";
      if (filter === "bt_physiotherapist") return c.businessType === "physiotherapist";
      if (filter === "bt_nutritionist")    return c.businessType === "nutritionist";
      if (filter === "bt_psychologist")    return c.businessType === "psychologist";
      if (filter === "bt_veterinarian")    return c.businessType === "veterinarian";
      if (filter === "bt_other")           return c.businessType === "other";
      if (filter === "contract_expiring")  return contractEnd >= now && contractEnd <= in30;
      if (filter === "contract_expired")   return contractEnd < now;
      return true;
    });
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter((c) =>
      c.business.name.toLowerCase().includes(q) ||
      c.specialist.publicName.toLowerCase().includes(q) ||
      c.specialist.firstName.toLowerCase().includes(q) ||
      c.specialist.lastNamePaternal.toLowerCase().includes(q) ||
      c.clientNumber.toLowerCase().includes(q) ||
      (c.specialist.phone ?? "").includes(q) ||
      c.subdomain.includes(q) ||
      (c.salesRepName ?? "").toLowerCase().includes(q)
    );
  }
  return result;
}

// ── Alert bar ─────────────────────────────────────────────────────────────────

function AlertsBar() {
  const { clients, preClients } = useAdminStore();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(today.getDate() + 30);

  const items = [
    {
      count: clients.filter((c) => c.paymentStatus === "overdue").length,
      label: "pagos vencidos",
      cls: "text-[var(--danger)] border-[var(--danger)]",
    },
    {
      count: clients.filter((c) => {
        const end = new Date(c.contractEndDate + "T00:00:00");
        return end >= today && end <= in30 && c.clientStatus === "active";
      }).length,
      label: "contratos por vencer",
      cls: "text-[var(--accent)] border-[var(--accent)]",
    },
    {
      count: clients.filter((c) => {
        const end = new Date(c.contractEndDate + "T00:00:00");
        return end < today && c.clientStatus === "active";
      }).length,
      label: "contratos vencidos",
      cls: "text-[var(--danger)] border-[var(--danger)]",
    },
    {
      count: clients.filter((c) => c.onboardingStatus !== "ready" && c.clientStatus === "active").length,
      label: "onboarding incompleto",
      cls: "text-[var(--text-muted)] border-[var(--border)]",
    },
    {
      count: preClients.filter((p) => p.status === "new" || p.status === "contacted").length,
      label: "preclientes por contactar",
      cls: "text-[var(--text-muted)] border-[var(--border)]",
    },
    {
      count: preClients.filter((p) => p.status === "awaiting_payment").length,
      label: "preclientes esperando pago",
      cls: "text-[var(--accent)] border-[var(--accent)]",
    },
  ].filter((a) => a.count > 0);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((a) => (
        <span key={a.label}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border-[0.5px] bg-[var(--bg-elevated)] ${a.cls}`}>
          <span className="font-bold tabular-nums">{a.count}</span>
          {a.label}
        </span>
      ))}
    </div>
  );
}

// ── Stat cards ────────────────────────────────────────────────────────────────

function StatCards({ clients }: { clients: AdminClient[] }) {
  const { preClients } = useAdminStore();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(today.getDate() + 30);

  const pipeline = preClients.filter((p) => p.status !== "converted" && p.status !== "discarded").length;

  const stats = [
    { label: "Clientes",       value: clients.length,                                                               sub: `${clients.filter((c) => c.clientStatus === "active").length} activos`    },
    { label: "Plan Pro",       value: clients.filter((c) => c.isPro).length,                                        sub: `${clients.filter((c) => !c.isPro).length} Standard`                      },
    { label: "Al día",         value: clients.filter((c) => c.paymentStatus === "paid").length,                     sub: `${clients.filter((c) => c.paymentStatus === "overdue").length} vencidos`  },
    { label: "Por vencer",     value: clients.filter((c) => { const e = new Date(c.contractEndDate + "T00:00:00"); return e >= today && e <= in30; }).length, sub: "contratos ≤ 30 días"           },
    { label: "Preclientes",    value: pipeline,                                                                      sub: `${preClients.filter((p) => p.status === "converted").length} convertidos` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-7">
      {stats.map((s) => (
        <div key={s.label}
          className="rounded-xl px-4 py-4 relative overflow-hidden bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-[var(--accent)]" />
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">{s.label}</p>
          <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{s.value}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Clients tab ───────────────────────────────────────────────────────────────

type MainTab = "clients" | "preclients" | "transfers" | "vendors" | "finance" | "settings";

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "clients",    label: "Clientes"       },
  { key: "preclients", label: "Preclientes"    },
  { key: "transfers",  label: "Transferencias" },
  { key: "vendors",    label: "Vendedores"     },
  { key: "finance",    label: "Finanzas"       },
  { key: "settings",   label: "Configuración"  },
];

function ClientsTab({ onOpenClient }: { onOpenClient: (id: string) => void }) {
  const { clients } = useAdminStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => applyFilter(clients, filter, search), [clients, filter, search]);
  const hasActiveFilter = filter !== "all" || search.trim().length > 0;

  return (
    <>
      <AlertsBar />
      <StatCards clients={clients} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          className={`${S.input} max-w-xs`}
          placeholder="Buscar negocio, doctor, teléfono…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={showFilters || filter !== "all"
            ? "px-3 py-1.5 rounded-md bg-[var(--accent-muted)] text-[var(--accent)] border-[0.5px] border-[var(--accent)] text-xs font-medium transition-colors whitespace-nowrap"
            : S.btnGhost}
        >
          {showFilters ? "Ocultar filtros" : "Filtros"}
          {filter !== "all" && (
            <span className="ml-1.5 w-1.5 h-1.5 rounded-full inline-block bg-[var(--accent)]" />
          )}
        </button>
        {hasActiveFilter && (
          <button
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => { setFilter("all"); setSearch(""); }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-xl p-4 mb-4 space-y-3 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
          {FILTER_GROUPS.map((g) => (
            <div key={g.label} className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wide w-16 shrink-0">
                {g.label}
              </span>
              {g.filters.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key === filter ? "all" : f.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border-[0.5px] ${
                      active
                        ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
        <div className="px-5 py-3.5 border-b-[0.5px] border-[var(--border)] flex items-center justify-between">
          <p className="text-[11px] text-[var(--text-muted)]">
            {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
            {hasActiveFilter ? " · filtrados" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                <Th>N°</Th>
                <Th>Negocio</Th>
                <Th>Tipo</Th>
                <Th>Especialista</Th>
                <Th>Teléfono</Th>
                <Th>Plan</Th>
                <Th>Pago</Th>
                <Th>Contrato</Th>
                <Th>Acceso</Th>
                <Th>Vendedor</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center text-[var(--text-muted)] text-sm">
                    Sin resultados
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const contractEnd = new Date(c.contractEndDate + "T00:00:00");
                const todayD = new Date();
                todayD.setHours(0, 0, 0, 0);
                const in30D = new Date(todayD);
                in30D.setDate(todayD.getDate() + 30);
                const expired  = contractEnd < todayD;
                const expiring = !expired && contractEnd <= in30D;
                return (
                  <tr
                    key={c.id}
                    className="group border-b-[0.5px] border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--bg-elevated)]"
                    onClick={() => onOpenClient(c.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{c.clientNumber}</span>
                    </td>
                    <td className="px-5 py-3.5 min-w-[160px]">
                      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">{c.business.name}</p>
                      {c.business.city && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{c.business.city}</p>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {c.businessType ? (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {BUSINESS_TYPE_LABELS[c.businessType as BusinessType]}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--border)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 min-w-[140px]">
                      <p className="text-xs text-[var(--text-primary)]">{c.specialist.publicName}</p>
                      <BadgeEl meta={CLIENT_META[c.clientStatus]} />
                    </td>
                    <td className="px-5 py-3.5">
                      {c.specialist.phone ? (
                        <a href={`tel:${c.specialist.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-mono">
                          {c.specialist.phone}
                        </a>
                      ) : (
                        <span className="text-[11px] text-[var(--border)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <PlanBadge plan={c.plan} />
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeEl meta={PAYMENT_META[c.paymentStatus]} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {c.contractEndDate}
                      </div>
                      {expired && (
                        <div className="text-[10px] text-[var(--danger)]">Vencido</div>
                      )}
                      {expiring && (
                        <div className="text-[10px] text-amber-400">Por vencer</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <AccessBadge active={c.accessActive} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="text-[11px] text-[var(--text-muted)]">{c.salesRepName || "—"}</span>
                        {c.sellerNumber && (
                          <p className="text-[10px] font-mono text-[var(--accent)]">{c.sellerNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[var(--accent)]">
                        Ver →
                      </span>
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

// ── Settings tab ─────────────────────────────────────────────────────────────

function SettingsView() {
  const [phone, setPhone] = useState(() => loadGlobalSettings().customerSupport.phone);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveGlobalSettings({ customerSupport: { phone: phone.trim() } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Configuración global</h2>
        <p className="text-[11px] text-[var(--text-muted)]">Estos valores se muestran a todos los especialistas de la plataforma.</p>
      </div>

      <div className="rounded-xl p-5 bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] space-y-4">
        <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Atención a cliente</p>
        <div>
          <label className="text-[11px] text-[var(--text-muted)] block mb-1.5">Número telefónico</label>
          <input
            className={S.input}
            type="tel"
            placeholder="55 1234 5678"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Se mostrará en la sección "Atención a cliente" de cada especialista.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className={`${S.btnPrimary} px-5`}>
            Guardar
          </button>
          {saved && <span className="text-[11px] text-[var(--accent)]">¡Guardado correctamente!</span>}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [mainTab, setMainTab] = useState<MainTab>("clients");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--bg-base)] text-[10px] font-bold bg-[var(--accent)]">
              A2
            </div>
            <div>
              <span className="text-[var(--text-primary)] text-sm font-semibold">Template A2</span>
              <span className="text-[var(--text-muted)] text-sm"> / Admin</span>
            </div>
          </div>
          <button onClick={logout} className={S.btnGhost}>Salir</button>
        </div>

        {/* Tab nav */}
        <div className="max-w-[1440px] mx-auto px-6 flex border-t-[0.5px] border-[var(--border)]">
          {MAIN_TABS.map((t) => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              className={`px-4 py-3 text-[11px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                mainTab === t.key
                  ? "text-[var(--accent)] border-[var(--accent)]"
                  : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-7">
        {mainTab === "clients"   && <ClientsTab onOpenClient={setSelectedId} />}
        {mainTab === "preclients" && <PreClientsView />}
        {mainTab === "transfers" && <TransfersView />}
        {mainTab === "vendors"   && <SalesRepView />}
        {mainTab === "finance"   && <FinanceView />}
        {mainTab === "settings"  && <SettingsView />}
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
