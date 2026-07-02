"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Phone } from "lucide-react";
import { validatePhoneNumber } from "@/lib/phoneUtils";
import { SPECIALIST_DEMO_ACCOUNT } from "@/lib/clientAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.mustChangePassword) {
        router.replace("/dashboard/configuracion?tab=seguridad");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone.trim() || !password.trim()) {
      setError("Completa todos los campos.");
      return;
    }
    setSubmitting(true);
    try {
      const ok = await login(phone.trim(), password);
      if (!ok) {
        setError("Número de teléfono o contraseña incorrectos.");
        setSubmitting(false);
      }
      // redirect handled by useEffect
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  if (isLoading) return null;

  const phoneValid = !phone || validatePhoneNumber(phone).valid;

  return (
    <div className="min-h-screen bg-[var(--ds-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[var(--ds-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7 text-[var(--ds-primary-fg)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Acceso al panel</h1>
          <p className="text-[var(--ds-text-muted)] text-sm mt-1">Ingresa con tu número de teléfono</p>
        </div>

        <div className="bg-[var(--ds-surface)] rounded-2xl border border-[var(--ds-border)] shadow-sm p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ds-text-muted)] mb-1">
                Número de teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                autoComplete="tel"
                placeholder="Ej. 55 1234 5678"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[var(--ds-text)] bg-[var(--ds-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 focus:border-[var(--ds-ring)] transition-colors ${
                  phone && !phoneValid ? "border-[var(--ds-error)]" : "border-[var(--ds-border)]"
                }`}
              />
              {phone && !phoneValid && (
                <p className="text-xs text-[var(--ds-error)] mt-1">Ingresa al menos 10 dígitos.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ds-text-muted)] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                  className="w-full border border-[var(--ds-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ds-text)] bg-[var(--ds-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 focus:border-[var(--ds-ring)] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]"
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[var(--ds-error)] bg-[var(--ds-error)]/8 border border-[var(--ds-error)]/20 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {submitting ? "Verificando…" : "Iniciar sesión"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-3 bg-[var(--ds-surface-muted)] rounded-xl text-xs text-[var(--ds-text-muted)] space-y-0.5">
            <p className="font-semibold text-[var(--ds-text)] mb-1">Credenciales demo</p>
            <p>Teléfono: <span className="font-mono">{SPECIALIST_DEMO_ACCOUNT.phone}</span></p>
            <p>Contraseña: <span className="font-mono">{SPECIALIST_DEMO_ACCOUNT.password}</span></p>
            <p className="opacity-60 mt-1 text-[11px]">
              ⚠️ Mock frontend — acceso por teléfono no valida con backend real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
