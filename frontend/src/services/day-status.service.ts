import { apiRequest, type DayStatus } from "../lib/api.service";

export function getDayStatus(date: string) {
  return apiRequest<DayStatus | null>(
    `/day-status/${encodeURIComponent(date)}`,
  );
}

export function getMonthStatuses(year: number, month: number) {
  const query = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  return apiRequest<DayStatus[]>(`/day-status?${query.toString()}`);
}

export function getYearStatuses(year: number) {
  return apiRequest<DayStatus[]>(`/day-status?year=${year}`);
}

export function updateDayStatus(date: string, content: string) {
  return apiRequest<DayStatus>(`/day-status/${encodeURIComponent(date)}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}
