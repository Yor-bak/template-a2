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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  clinicId: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const me = await apiLogin(email, password);
      setUser(me);
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return false;
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

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
