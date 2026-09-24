import type { Response } from "express";

export type ApiError = {
  error: string;
  details?: Array<{ path: (string | number)[]; message: string }>;
};

export type AuthUserDto = {
  id: string;
  email: string;
  fullName?: string | null;
  createdAt: string;
};

export type DayStatusDto = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = { user: AuthUserDto };

export function sendSuccess<T>(response: Response, data: T, statusCode = 200) {
  response.locals.responseBody = data;
  return response.status(statusCode).json(data);
}

export function sendError(
  response: Response,
  message: string,
  statusCode: number,
  details?: ApiError["details"],
) {
  return response.status(statusCode).json({
    error: message,
    ...(details ? { details } : {}),
  } satisfies ApiError);
}
