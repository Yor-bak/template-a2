/**
 * Cliente HTTP centralizado para el backend FastAPI.
 * Maneja: token Bearer, errores, 401/403, JSON parsing.
 */

if (
  typeof window !== "undefined" &&
  !process.env.NEXT_PUBLIC_API_URL
) {
  console.warn(
    "[API] Falta NEXT_PUBLIC_API_URL en .env.local — usando fallback http://localhost:8000/api/v1\n" +
    "  Crea el archivo: cp .env.local.example .env.local"
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "ds_auth_token";

// ── Token helpers ──────────────────────────────────────────────────────────────

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

// ── API error ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch ─────────────────────────────────────────────────────────────────

interface ApiFetchOptions extends RequestInit {
  /** When true, do not attach Authorization header (public endpoints). */
  public?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { public: isPublic, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> | undefined),
  };

  if (!isPublic) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers, signal: controller.signal });
  } catch (networkError) {
    throw new ApiError(0, "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.", networkError);
  } finally {
    clearTimeout(timeoutId);
  }

  // No content
  if (res.status === 204) return undefined as T;

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Error ${res.status}`;

    if (res.status === 401) {
      clearAuthToken();
      // Trigger re-render by dispatching a storage event (AuthContext listens)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ds:unauthorized"));
      }
    }

    throw new ApiError(res.status, detail, body);
  }

  return body as T;
}
