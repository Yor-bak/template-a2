"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEquipo } from "@/contexts/EquipoContext";
import { Eye, EyeOff } from "lucide-react";

export const WORKER_SESSION_KEY = "template-a2-worker-session";

export default function WorkerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { authenticateWorker } = useEquipo();
  const router = useRouter();

  // If already logged in, go to portal
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKER_SESSION_KEY);
      if (raw) router.replace("/trabajador");
    } catch { /* noop */ }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    const worker = authenticateWorker(email.trim(), password);
    setLoading(false);

    if (!worker) {
      setError("Correo o contraseña incorrectos, o la cuenta está inactiva.");
      return;
    }

    localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify({ workerId: worker.id }));
    router.push("/trabajador");
  }

  const inp = "w-full border border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--ds-accent)] transition-colors placeholder:text-[var(--ds-text-muted)]";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--ds-bg)] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--ds-primary)] mb-4">
            <span className="text-white text-xl font-extrabold tracking-tight">DS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Portal de trabajador</h1>
          <p className="text-sm text-[var(--ds-text-muted)] mt-1">Inicia sesión para ver tus tareas</p>
        </div>

        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ds-text-muted)] mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="tu@correo.com"
                autoComplete="username"
                className={inp}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ds-text-muted)] mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inp} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[var(--ds-error)] bg-[var(--ds-surface-muted)] border border-[var(--ds-border)] rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--ds-primary)] text-[var(--ds-primary-fg)] font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {loading ? "Verificando…" : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--ds-text-muted)] mt-6">
          Portal exclusivo para colaboradores del consultorio
        </p>
      </div>
    </div>
  );
}
