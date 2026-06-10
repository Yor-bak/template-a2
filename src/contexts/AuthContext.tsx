"use client";
/**
 * Auth mockeada para MVP.
 * TODO: reemplazar DEMO_USERS y la lógica de login por una llamada real
 * a /api/auth/login que devuelva un JWT o session cookie.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
  name: string;
  email: string;
  role: "dentist" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// ── Demo credentials ──────────────────────────────────────────────────────────
// TODO: eliminar cuando haya backend real
const DEMO_USERS: Array<{ email: string; password: string; user: AuthUser }> = [
  {
    email: "dentista@demo.com",
    password: "demo123",
    user: { name: "Dra. Mariana López", email: "dentista@demo.com", role: "dentist" },
  },
  {
    email: "admin@clinicasonrisa.com",
    password: "demo1234",
    user: { name: "Dra. Mariana López", email: "admin@clinicasonrisa.com", role: "admin" },
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_KEY = "dental_auth_user";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    // TODO: reemplazar por fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
    const match = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!match) return false;
    setUser(match.user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(match.user));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
