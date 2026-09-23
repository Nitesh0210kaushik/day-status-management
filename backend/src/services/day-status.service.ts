import {
  findByDate,
  findByMonth,
  upsertByDate,
} from "../repositories/day-status.repository";
import { formatDateOnly, parseDateOnly } from "../utils/date";
import type { DayStatusDto } from "../types/api";

export function getByDate(dateValue: string) {
  return findByDate(parseDateOnly(dateValue));
}

export function getByMonth(year: number, month: number) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  return findByMonth(startDate, endDate);
}

export function saveForDate(
  dateValue: string,
  content: string,
  userId: string,
) {
  return upsertByDate(parseDateOnly(dateValue), content, userId);
}

export function serializeStatus(
  status: Awaited<ReturnType<typeof getByDate>>,
): DayStatusDto | null {
  return status
    ? {
        id: status.id,
        date: formatDateOnly(status.date),
        content: status.content,
        createdAt: status.createdAt.toISOString(),
        updatedAt: status.updatedAt.toISOString(),
      }
    : null;
}

export function serializeStatuses(
  statuses: Awaited<ReturnType<typeof getByMonth>>,
): DayStatusDto[] {
  return statuses.map((status) => ({
    id: status.id,
    date: formatDateOnly(status.date),
    content: status.content,
    createdAt: status.createdAt.toISOString(),
    updatedAt: status.updatedAt.toISOString(),
  }));
}
