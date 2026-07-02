"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout, getMe } from "@/lib/api/authApi";
import { getAuthToken, clearAuthToken, ApiError } from "@/lib/api/client";
import { loginClient } from "@/lib/clientAuth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  clinicId: string;
  isPremium: boolean;
  // Extended fields for phone-based client login
  phone?: string;
  clientNumber?: string;
  mustChangePassword?: boolean;
  authMethod?: "email" | "phone";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearMustChange: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if token exists, validate it with /auth/me
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        clearAuthToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for 401 events dispatched by the client
  useEffect(() => {
    function handle() {
      setUser(null);
      clearAuthToken();
    }
    window.addEventListener("ds:unauthorized", handle);
    return () => window.removeEventListener("ds:unauthorized", handle);
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<boolean> => {
    // 1. Try phone-based client login (mock service)
    const clientSession = loginClient(identifier, password);
    if (clientSession) {
      setUser({
        id: clientSession.clientId,
        name: clientSession.ownerName,
        email: "",
        role: "specialist",
        clinicId: clientSession.clientId,
        isPremium: clientSession.plan === "pro",
        phone: clientSession.accessPhone,
        clientNumber: clientSession.clientNumber,
        mustChangePassword: clientSession.mustChangePassword,
        authMethod: "phone",
      });
      return true;
    }

    // 2. Fall back to real API (email-based)
    try {
      const me = await apiLogin(identifier, password);
      setUser({ ...me, authMethod: "email" });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return false;
      // Network error — real backend not available
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch {}
    setUser(null);
  }, []);

  const clearMustChange = useCallback(() => {
    setUser((prev) => prev ? { ...prev, mustChangePassword: false } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, clearMustChange }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
