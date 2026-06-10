"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();

  const [email, setEmail] = useState("dentista@demo.com");
  const [password, setPassword] = useState("demo123");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos.");
      return;
    }
    setSubmitting(true);
    const ok = await login(email, password);
    if (ok) {
      router.replace("/dashboard");
    } else {
      setError("Credenciales incorrectas. Revisa tu correo y contraseña.");
      setSubmitting(false);
    }
  }

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Panel dental</h1>
          <p className="text-gray-500 text-sm mt-1">Acceso exclusivo para el dentista</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors disabled:opacity-60 mt-2"
            >
              {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-5 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-0.5">
            <p className="font-semibold text-gray-700 mb-1">Credenciales demo</p>
            <p>Email: <span className="font-mono">dentista@demo.com</span></p>
            <p>Contraseña: <span className="font-mono">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
