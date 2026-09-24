import type { NextFunction, Request, Response } from "express";
import { findUserById } from "../repositories/user.repository";
import { getAccessTokenPayload } from "../services/auth.service";
import { AppError } from "../utils/errors";

type AccessTokenPayload = {
  sub: string;
  email: string;
};

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const authorization = request.header("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const token =
    bearerToken || (request.cookies.day_status_access as string | undefined);

  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  let payload: AccessTokenPayload;

  try {
    payload = getAccessTokenPayload(token) as AccessTokenPayload;
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }

  if (!payload.sub || !payload.email) {
    return next(new AppError(401, "Invalid token payload"));
  }

  const user = await findUserById(payload.sub);

  if (!user) {
    return next(new AppError(401, "User account is no longer active"));
  }

  request.user = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt,
  };
  return next();
}
