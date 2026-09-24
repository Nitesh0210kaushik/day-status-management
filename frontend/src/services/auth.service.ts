import { apiRequest, type AuthSession } from "../lib/api.service";

export function register(email: string, password: string, fullName: string) {
  return apiRequest<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      fullName,
    }),
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function refreshSession() {
  return apiRequest<AuthSession>("/auth/refresh", { method: "POST" });
}

export function getCurrentUser() {
  return apiRequest<AuthSession>("/auth/me");
}

export function logout() {
  return apiRequest<null>("/auth/logout", { method: "POST" });
}
