import type { ErrorRequestHandler, RequestHandler } from "express";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { sendError } from "../types/api";
import { AppError } from "../utils/errors";

export const notFoundHandler: RequestHandler = (request, response) => {
  return sendError(
    response,
    `Route ${request.method} ${request.originalUrl} not found`,
    404,
  );
};

function isMalformedJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError && "status" in error && error.status === 400
  );
}

export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isMalformedJsonError(error)) {
    sendError(response, "Request body contains invalid JSON", 400);
    return;
  }

  if (error instanceof ZodError) {
    sendError(
      response,
      "Validation failed",
      400,
      error.issues.map((issue) => ({
        path: issue.path.map((segment) => String(segment)),
        message: issue.message,
      })),
    );
    return;
  }

  if (error instanceof AppError) {
    sendError(response, error.message, error.statusCode);
    return;
  }

  if (error instanceof PrismaClientInitializationError) {
    request.log.error({ err: error }, "Database initialization failed");
    sendError(response, "Database is unavailable", 503);
    return;
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      sendError(response, "A record with these values already exists", 409);
      return;
    }

    if (error.code === "P2025") {
      sendError(response, "The requested record was not found", 404);
      return;
    }

    if (error.code === "P2003") {
      sendError(
        response,
        "The requested operation violates a data relationship",
        409,
      );
      return;
    }
  }

  request.log.error({ err: error }, "Unhandled request error");
  sendError(response, "Internal server error", 500);
};
