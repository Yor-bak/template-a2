"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Users,
  DollarSign,
  Stethoscope,
  Settings,
  BarChart2,
  LogOut,
  X,
  HeadsetIcon,
  ClipboardList,
  CreditCard,
  Bell,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/citas", label: "Citas", icon: CalendarDays },
  { href: "/dashboard/calendario", label: "Calendario", icon: Calendar },
  { href: "/dashboard/pacientes", label: "Clientes", icon: Users },
  { href: "/dashboard/planes", label: "Planes de atención", icon: ClipboardList },
  { href: "/dashboard/pagos", label: "Pagos", icon: CreditCard },
  { href: "/dashboard/seguimientos", label: "Seguimientos", icon: Bell },
  { href: "/dashboard/ingresos", label: "Ingresos", icon: DollarSign },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart2 },
  { href: "/dashboard/servicios", label: "Servicios", icon: Stethoscope },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
  { href: "/dashboard/atencion", label: "Atención a cliente", icon: HeadsetIcon },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("") ?? "DS";

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 flex flex-col transition-transform duration-300",
          "bg-[var(--ds-sidebar-bg)] border-r border-[var(--ds-border)]",
          "md:translate-x-0 md:static md:z-auto"
        , open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--ds-sidebar-border)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--ds-sidebar-accent)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-[var(--ds-sidebar-bg)] text-xs font-extrabold tracking-tight">DS</span>
            </div>
            <div className="leading-tight">
              <p className="text-[var(--ds-sidebar-fg)] font-bold text-xs">Clínica Dental</p>
              <p className="text-[var(--ds-sidebar-accent)]/60 text-[10px] truncate max-w-[120px]">Panel de gestión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-[var(--ds-sidebar-muted)]/40 hover:text-[var(--ds-sidebar-fg)] hover:bg-[var(--ds-sidebar-hover-bg)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--ds-sidebar-active-bg)] text-[var(--ds-sidebar-accent)]"
                    : "text-[var(--ds-sidebar-muted)]/50 hover:bg-[var(--ds-sidebar-hover-bg)] hover:text-[var(--ds-sidebar-fg)]/80"
                )}
              >
                {/* Indicador activo izquierdo */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[var(--ds-sidebar-accent)]" />
                )}
                <item.icon
                  className={cn(
                    "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                    active ? "text-[var(--ds-sidebar-accent)]" : "text-[var(--ds-sidebar-muted)]/35"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer usuario */}
        <div className="px-3 py-4 border-t border-[var(--ds-sidebar-border)] space-y-1 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[var(--ds-sidebar-accent)]/20 border border-[var(--ds-sidebar-accent)]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--ds-sidebar-accent)] text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[var(--ds-sidebar-fg)]/80 text-xs font-semibold truncate">{user?.name ?? "Especialista"}</p>
              <p className="text-[var(--ds-sidebar-muted)]/50 text-[10px] truncate">{user?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--ds-sidebar-muted)] hover:bg-[var(--ds-sidebar-hover-bg)] hover:text-[var(--ds-sidebar-fg)]/60 transition-all w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
