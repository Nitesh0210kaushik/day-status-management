import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";
import { sendSuccess, type AuthResponse } from "../types/api";
import { env } from "../config/env";
import { randomBytes } from "node:crypto";
import { CSRF_COOKIE } from "../middleware/csrf.middleware";

const REFRESH_COOKIE = "day_status_refresh";
const ACCESS_COOKIE = "day_status_access";
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.secureCookies,
  sameSite: "lax" as const,
  path: "/api/v1/auth",
};

function sendSession(
  response: Response,
  session: Awaited<ReturnType<typeof authService.register>>,
  statusCode = 200,
) {
  response.cookie(ACCESS_COOKIE, session.accessToken, {
    ...refreshCookieOptions,
    maxAge: env.accessTokenCookieMaxAgeMs,
    path: "/api/v1",
  });
  response.cookie(REFRESH_COOKIE, session.refreshToken, {
    ...refreshCookieOptions,
    maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
  });
  const data: AuthResponse = {
    user: { ...session.user, createdAt: session.user.createdAt.toISOString() },
  };
  return sendSuccess(response, data, statusCode);
}

export async function register(request: Request, response: Response) {
  const input = registerSchema.parse(request.body);
  const result = await authService.register(input.email, input.password);
  sendSession(response, result, 201);
}

export function csrf(request: Request, response: Response) {
  const token =
    (request.cookies[CSRF_COOKIE] as string | undefined) ??
    randomBytes(32).toString("hex");
  response.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: env.secureCookies,
    sameSite: "lax",
    path: "/api/v1",
  });
  return sendSuccess(response, { csrfToken: token });
}

export async function login(request: Request, response: Response) {
  const input = loginSchema.parse(request.body);
  const result = await authService.login(input.email, input.password);
  sendSession(response, result);
}

export async function refresh(request: Request, response: Response) {
  const refreshToken = request.cookies.day_status_refresh as string | undefined;

  if (!refreshToken) {
    response.status(401).json({ error: "Refresh token required" });
    return;
  }

  const result = await authService.refresh(refreshToken);
  sendSession(response, result);
}

export async function logout(request: Request, response: Response) {
  await authService.logout(
    request.cookies.day_status_refresh as string | undefined,
  );
  response.clearCookie(ACCESS_COOKIE, {
    ...refreshCookieOptions,
    path: "/api/v1",
  });
  response.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  response.status(204).send();
}
