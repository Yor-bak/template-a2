"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useAdminAuth, CLIENT_TYPE_LABELS } from "@/store/adminStore";
import type { AdminClient, ClientType, OnboardingStatus, PublicPageStatus } from "@/types/user";
import {
  S, BadgeEl, ProBadge, AccessBadge, Th,
  PAYMENT_META, CLIENT_META, ONBOARDING_META, PAGE_META, CLIENT_TYPE_LABEL,
  fmtDate,
} from "@/modules/admin/components/adminUi";
import { NewClientModal } from "@/modules/admin/components/NewClientModal";
import { ClientDrawer } from "@/modules/admin/components/ClientDrawer";

// ── Login ─────────────────────────────────────────────────────────────────────

function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("admin@templatea2.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(email, password)) setError("Credenciales incorrectas");
  }

  return (
    <div className="min-h-screen bg-[#09080d] flex items-center justify-center p-4">
      <div className="bg-[#100d18] border border-[#1e1830] rounded-2xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#1e1830] mb-2">
            <span className="text-lg">🔐</span>
          </div>
          <h1 className="text-[#ede8f5] font-semibold text-lg">Template A2</h1>
          <p className="text-[#4a4260] text-xs">Panel de administración</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={S.label}>Correo</label>
            <input
              className={S.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@templatea2.com"
            />
          </div>
          <div>
            <label className={S.label}>Contraseña</label>
            <input
              className={S.input}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-[#a84040] text-xs">{error}</p>}
          <button type="submit" className={`${S.btnPrimary} w-full`}>
            Ingresar
          </button>
        </form>
        <p className="text-center text-[10px] text-[#4a4260]">admin123</p>
      </div>
    </div>
  );
}

// ── Filter definition ─────────────────────────────────────────────────────────

type FilterKey =
  | "all" | "active" | "inactive" | "trial" | "suspended" | "cancelled_s"
  | "pro" | "free"
  | "paid" | "pending" | "overdue" | "grace_period" | "blocked"
  | "page_published" | "page_hidden"
  | "ob_not_started" | "ob_in_progress" | "ob_ready"
  | `type_${ClientType}`;

interface FilterGroup { label: string; filters: { key: FilterKey; label: string }[] }

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: "Estado", filters: [
      { key: "all", label: "Todos" },
      { key: "active", label: "Activos" },
      { key: "inactive", label: "Inactivos" },
      { key: "trial", label: "Trial" },
      { key: "suspended", label: "Suspendidos" },
    ],
  },
  {
    label: "Plan", filters: [
      { key: "pro", label: "Pro" },
      { key: "free", label: "Free" },
    ],
  },
  {
    label: "Pago", filters: [
      { key: "paid", label: "Pagados" },
      { key: "pending", label: "Pendientes" },
      { key: "overdue", label: "Vencidos" },
      { key: "grace_period", label: "Gracia" },
      { key: "blocked", label: "Bloqueados" },
    ],
  },
  {
    label: "Página", filters: [
      { key: "page_published", label: "Publicada" },
      { key: "page_hidden", label: "Oculta" },
    ],
  },
  {
    label: "Onboarding", filters: [
      { key: "ob_not_started", label: "Sin config" },
      { key: "ob_in_progress", label: "En proceso" },
      { key: "ob_ready", label: "Lista" },
    ],
  },
  {
    label: "Tipo", filters: (Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((k) => ({
      key: `type_${k}` as FilterKey,
      label: CLIENT_TYPE_LABELS[k],
    })),
  },
];

function applyFilter(clients: AdminClient[], filter: FilterKey, search: string): AdminClient[] {
  let result = clients;

  if (filter !== "all") {
    result = result.filter((c) => {
      if (filter === "active") return c.clientStatus === "active";
      if (filter === "inactive") return c.clientStatus === "inactive";
      if (filter === "trial") return c.clientStatus === "trial";
      if (filter === "suspended") return c.clientStatus === "suspended";
      if (filter === "cancelled_s") return c.clientStatus === "cancelled";
      if (filter === "pro") return c.isPro;
      if (filter === "free") return !c.isPro;
      if (filter === "paid") return c.paymentStatus === "paid";
      if (filter === "pending") return c.paymentStatus === "pending";
      if (filter === "overdue") return c.paymentStatus === "overdue";
      if (filter === "grace_period") return c.paymentStatus === "grace_period";
      if (filter === "blocked") return !c.accessActive;
      if (filter === "page_published") return c.publicPageStatus === "published";
      if (filter === "page_hidden") return c.publicPageStatus === "hidden";
      if (filter === "ob_not_started") return c.onboardingStatus === "not_started";
      if (filter === "ob_in_progress") return c.onboardingStatus === "in_progress";
      if (filter === "ob_ready") return c.onboardingStatus === "ready";
      if (filter.startsWith("type_")) return c.clientType === filter.slice(5);
      return true;
    });
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.clinicName.toLowerCase().includes(q) ||
        c.specialistName.toLowerCase().includes(q) ||
        c.clientNumber.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.subdomain.includes(q)
    );
  }

  return result;
}

// ── Alerts bar ────────────────────────────────────────────────────────────────

function AlertsBar({ clients }: { clients: AdminClient[] }) {
  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(today.getDate() + 30);

  const overdue = clients.filter((c) => c.paymentStatus === "overdue").length;
  const expiring = clients.filter((c) => {
    const end = new Date(c.contractEndDate + "T00:00:00");
    return end >= today && end <= in30 && c.accessActive;
  }).length;
  const notConfigured = clients.filter((c) => c.onboardingStatus === "not_started").length;
  const blocked = clients.filter((c) => !c.accessActive).length;
  const hiddenActive = clients.filter(
    (c) => c.publicPageStatus === "hidden" && c.accessActive
  ).length;

  const alerts = [
    { count: overdue, label: "pagos vencidos", color: "text-[#a84040] bg-[#1a0808] border-[#280e0e]" },
    { count: blocked, label: "acceso bloqueado", color: "text-[#c47d3a] bg-[#1e1408] border-[#2e2210]" },
    { count: expiring, label: "contratos por vencer", color: "text-[#c49a42] bg-[#1e160a] border-[#2e2210]" },
    { count: notConfigured, label: "sin configurar", color: "text-[#4a4260] bg-[#100d18] border-[#1e1830]" },
    { count: hiddenActive, label: "páginas ocultas", color: "text-[#7a6aaa] bg-[#130f1e] border-[#1e1830]" },
  ].filter((a) => a.count > 0);

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {alerts.map((a) => (
        <span
          key={a.label}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium ${a.color}`}
        >
          <span className="font-bold">{a.count}</span>
          {a.label}
        </span>
      ))}
    </div>
  );
}

// ── Stat cards ────────────────────────────────────────────────────────────────

function StatCards({ clients }: { clients: AdminClient[] }) {
  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(today.getDate() + 30);

  const stats = [
    {
      label: "Total clientes",
      value: clients.length,
      sub: `${clients.filter((c) => c.clientStatus === "active").length} activos`,
      color: "text-[#9c6fd4]",
    },
    {
      label: "Plan Pro",
      value: clients.filter((c) => c.isPro).length,
      sub: `${clients.filter((c) => !c.isPro).length} Free`,
      color: "text-[#c4728a]",
    },
    {
      label: "Pagos al día",
      value: clients.filter((c) => c.paymentStatus === "paid").length,
      sub: `${clients.filter((c) => c.paymentStatus === "overdue").length} vencidos`,
      color: "text-[#4a9e6e]",
    },
    {
      label: "Por vencer",
      value: clients.filter((c) => {
        const end = new Date(c.contractEndDate + "T00:00:00");
        return end >= today && end <= in30;
      }).length,
      sub: "contratos ≤30 días",
      color: "text-[#c49a42]",
    },
    {
      label: "Sin configurar",
      value: clients.filter((c) => c.onboardingStatus === "not_started").length,
      sub: `${clients.filter((c) => c.onboardingStatus === "ready").length} listos`,
      color: "text-[#4a4260]",
    },
    {
      label: "Ingreso mensual",
      value: `$${clients
        .filter((c) => c.accessActive && c.monthlyAmount)
        .reduce((s, c) => s + (c.monthlyAmount ?? 0), 0)
        .toLocaleString("es-MX")}`,
      sub: "MXN activos",
      color: "text-[#9c6fd4]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`${S.card} px-4 py-3`}>
          <p className="text-[10px] font-medium text-[#4a4260] uppercase tracking-wide mb-1">{s.label}</p>
          <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-[10px] text-[#4a4260] mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

function AdminDashboard() {
  const { clients } = useAdminStore();
  const { logout } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => applyFilter(clients, filter, search),
    [clients, filter, search]
  );

  return (
    <div className="min-h-screen bg-[#09080d] text-[#ede8f5]">
      {/* Top bar */}
      <header className="border-b border-[#1e1830] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#ede8f5] font-semibold text-sm tracking-wide">
            Template A2 <span className="text-[#4a4260] font-normal">/ Admin</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className={S.btnPrimary}>
            + Nuevo cliente
          </button>
          <button onClick={logout} className={S.btnGhost}>
            Salir
          </button>
        </div>
      </header>

      <main className="px-6 py-6 max-w-[1400px] mx-auto">
        {/* Alertas */}
        <AlertsBar clients={clients} />

        {/* Stats */}
        <StatCards clients={clients} />

        {/* Filtros */}
        <div className={`${S.card} p-4 mb-4 space-y-3`}>
          <div className="flex gap-3 items-center">
            <input
              className={`${S.input} max-w-xs`}
              placeholder="Buscar clínica, especialista, teléfono…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {(search || filter !== "all") && (
              <button
                className={S.btnGhost}
                onClick={() => { setSearch(""); setFilter("all"); }}
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="space-y-2">
            {FILTER_GROUPS.map((g) => (
              <div key={g.label} className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-[#4a4260] w-16 shrink-0">{g.label}</span>
                {g.filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      filter === f.key
                        ? "bg-[#6b3fa8] text-white"
                        : "bg-[#16121f] border border-[#2a2240] text-[#6a6080] hover:text-[#ede8f5]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className={`${S.card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-[#1e1830] flex items-center justify-between">
            <p className="text-xs text-[#4a4260]">
              {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
              {filter !== "all" || search ? " (filtrados)" : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1e1830]">
                <tr>
                  <Th>N°</Th>
                  <Th>Clínica / Especialista</Th>
                  <Th>Teléfono</Th>
                  <Th>Tipo</Th>
                  <Th>Plan</Th>
                  <Th>Pago</Th>
                  <Th>Acceso</Th>
                  <Th>Onboarding</Th>
                  <Th>Página</Th>
                  <Th>Contrato</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-[#4a4260] text-sm">
                      Sin resultados
                    </td>
                  </tr>
                )}
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#1a1628] transition-colors hover:bg-[#100d18] ${
                      i % 2 === 0 ? "" : "bg-[#0d0a14]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-[#4a4260]">{c.clientNumber}</span>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <p className="text-xs font-medium text-[#ede8f5] leading-tight">{c.clinicName}</p>
                      <p className="text-[10px] text-[#4a4260] mt-0.5">{c.specialistName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${c.phone}`} className="text-xs text-[#9c6fd4] hover:underline">
                        {c.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-[#6a6080]">
                        {CLIENT_TYPE_LABEL[c.clientType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProBadge isPro={c.isPro} />
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEl meta={PAYMENT_META[c.paymentStatus]} />
                    </td>
                    <td className="px-4 py-3">
                      <AccessBadge active={c.accessActive} />
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEl meta={ONBOARDING_META[c.onboardingStatus]} />
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEl meta={PAGE_META[c.publicPageStatus]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[11px] text-[#4a4260]">
                        <p className="text-[#6a6080]">{c.contractType === "one_year" ? "1 año" : "6 meses"}</p>
                        <p className={new Date(c.contractEndDate) < new Date() ? "text-[#a84040]" : ""}>
                          hasta {fmtDate(c.contractEndDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(c.id)}
                        className={S.btnGhost}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && <NewClientModal onClose={() => setShowModal(false)} />}
      {selectedId && (
        <ClientDrawer clientId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
}
