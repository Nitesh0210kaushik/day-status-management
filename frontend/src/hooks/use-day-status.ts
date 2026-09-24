"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDayStatus,
  getMonthStatuses,
  getYearStatuses,
  updateDayStatus,
} from "../services/day-status.service";
import type { DayStatus } from "../lib/api.service";

const DAY_STATUS_STALE_TIME = 60 * 1000;
const DAY_STATUS_CACHE_TIME = 5 * 60 * 1000;

export type ReturnTypeOfDayStatusHook = ReturnType<typeof useDayStatus>;

export function useMonthStatuses(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: ["day-status", "month", year, month],
    queryFn: () => getMonthStatuses(year, month),
    staleTime: DAY_STATUS_STALE_TIME,
    gcTime: DAY_STATUS_CACHE_TIME,
    refetchOnWindowFocus: true,
    retry: false,
    enabled,
  });
}

export function useYearStatuses(year: number, enabled = true) {
  const query = useQuery({
    queryKey: ["day-status", "year", year],
    queryFn: () => getYearStatuses(year),
    staleTime: DAY_STATUS_STALE_TIME,
    gcTime: DAY_STATUS_CACHE_TIME,
    refetchOnWindowFocus: true,
    retry: false,
    enabled,
  });

  return {
    statuses: query.data ?? [],
    isLoading: query.isLoading,
    hasError: query.isError,
  };
}

export function useDayStatus(date: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["day-status", date],
    queryFn: () => getDayStatus(date),
    enabled: Boolean(date),
    staleTime: DAY_STATUS_STALE_TIME,
    gcTime: DAY_STATUS_CACHE_TIME,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const saveMutation = useMutation({
    mutationFn: (content: string) => {
      return updateDayStatus(date, content);
    },
    onSuccess: (updatedStatus) => {
      queryClient.setQueryData(["day-status", date], updatedStatus);

      const monthKey = [
        "day-status",
        "month",
        Number(date.slice(0, 4)),
        Number(date.slice(5, 7)),
      ];

      queryClient.setQueryData<DayStatus[]>(monthKey, (current = []) => {
        const withoutCurrentDate = current.filter(
          (status) => status.date !== updatedStatus.date,
        );

        return [...withoutCurrentDate, updatedStatus].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
      });

      const yearKey = ["day-status", "year", Number(date.slice(0, 4))];
      queryClient.setQueryData<DayStatus[]>(yearKey, (current = []) => {
        const withoutCurrentDate = current.filter(
          (status) => status.date !== updatedStatus.date,
        );

        return [...withoutCurrentDate, updatedStatus].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
      });
    },
  });

  async function save(content: string) {
    return saveMutation.mutateAsync(content);
  }

  const status: DayStatus | null = query.data ?? null;

  return {
    status,
    isLoading: query.isLoading,
    error: query.error?.message ?? saveMutation.error?.message ?? "",
    isSaving: saveMutation.isPending,
    save,
    refresh: query.refetch,
  };
}
