import { apiFetch, setAuthToken, clearAuthToken } from "./client";

export interface AuthMeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  clinicId: string;
  isPremium: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export async function login(email: string, password: string): Promise<AuthMeResponse> {
  const res = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    public: true,
  });
  setAuthToken(res.accessToken);
  return getMe();
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // Stateless JWT — always clear token regardless
  } finally {
    clearAuthToken();
  }
}

export async function getMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>("/auth/me");
}
