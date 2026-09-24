const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ApiError = {
  error?: string;
  details?: Array<{ path: (string | number)[]; message: string }>;
};

export type DayStatus = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName?: string | null;
  createdAt: string;
};

export type AuthSession = {
  user: AuthUser;
};

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;

  if (csrfRequest) return csrfRequest;

  csrfRequest = fetch(`${API_URL}/auth/csrf`, {
    credentials: "include",
  })
    .then(async (response) => {
      const body = (await response.json()) as {
        csrfToken?: string;
        error?: string;
      };

      if (!response.ok || !body.csrfToken) {
        throw new Error(body.error ?? "Unable to initialize secure session");
      }

      csrfToken = body.csrfToken;
      return body.csrfToken;
    })
    .finally(() => {
      csrfRequest = null;
    });

  return csrfRequest;
}

async function request<T>(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const body =
    response.status === 204 ? null : ((await response.json()) as T & ApiError);

  return { response, body };
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(method);
  const headers = new Headers(options?.headers);

  if (isStateChanging && path !== "/auth/csrf") {
    headers.set("X-CSRF-Token", await getCsrfToken());
  }

  const requestOptions = isStateChanging ? { ...options, headers } : options;
  let result = await request<T>(path, requestOptions);

  if (result.response.status === 401 && !path.startsWith("/auth/")) {
    const refreshResult = await request<AuthSession>("/auth/refresh", {
      method: "POST",
      headers: { "X-CSRF-Token": await getCsrfToken() },
    });

    if (refreshResult.response.ok) {
      result = await request<T>(path, requestOptions);
    }
  }

  if (!result.response.ok) {
    throw new Error(result.body?.error ?? "Request failed");
  }

  return result.body as T;
}
