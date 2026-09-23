import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

export const CSRF_COOKIE = "day_status_csrf";

export function requireCsrf(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  if (
    ["GET", "HEAD", "OPTIONS"].includes(request.method) ||
    request.path === "/auth/csrf"
  ) {
    return next();
  }

  const cookieToken = request.cookies[CSRF_COOKIE] as string | undefined;
  const headerToken = request.header("x-csrf-token");

  if (!cookieToken || !headerToken) {
    return next(new AppError(403, "CSRF token required"));
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    return next(new AppError(403, "Invalid CSRF token"));
  }

  return next();
}
