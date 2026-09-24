import type { Request, Response } from "express";
import * as dayStatusService from "../services/day-status.service";
import {
  monthQuerySchema,
  dayStatusSchema,
} from "../schemas/day-status.schema";
import { AppError } from "../utils/errors";
import { sendSuccess } from "../types/api";

function getDateParam(request: Request): string {
  const value = request.params.date;

  if (Array.isArray(value)) {
    throw new AppError(400, "Date parameter is invalid");
  }

  return value;
}

export async function getStatus(request: Request, response: Response) {
  const status = await dayStatusService.getByDate(getDateParam(request));
  return sendSuccess(response, dayStatusService.serializeStatus(status));
}

export async function getMonthStatuses(request: Request, response: Response) {
  const { year, month } = monthQuerySchema.parse(request.query);
  const statuses = month
    ? await dayStatusService.getByMonth(year, month)
    : await dayStatusService.getByYear(year);
  return sendSuccess(response, dayStatusService.serializeStatuses(statuses));
}

export async function upsertStatus(request: Request, response: Response) {
  if (!request.user) {
    throw new AppError(401, "Authentication required");
  }

  const input = dayStatusSchema.parse(request.body);
  const status = await dayStatusService.saveForDate(
    getDateParam(request),
    input.content,
    request.user.id,
  );

  return sendSuccess(response, dayStatusService.serializeStatus(status));
}
