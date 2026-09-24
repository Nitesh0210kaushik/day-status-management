"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlignLeft,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Info,
  LogIn,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useDayStatus, useMonthStatuses } from "../hooks/use-day-status";
import { Button } from "./ui/button";

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function PublicDayViewer() {
  const today = new Date();
  const todayStr = toDateString(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  const [monthDate, setMonthDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const auth = useAuth();
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;
  const monthQuery = useMonthStatuses(year, month);
  const selectedQuery = useDayStatus(selectedDate);

  const statuses = useMemo(
    () =>
      new Map((monthQuery.data ?? []).map((status) => [status.date, status])),
    [monthQuery.data],
  );

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  // Generate calendar grid with overflow days from previous and next month
  const calendarCells = useMemo(() => {
    const cells = [];

    // Previous month overflow days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateStr: "",
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        day,
        isCurrentMonth: true,
        dateStr: toDateString(year, month, day),
      });
    }

    // Next month overflow days to complete 35 or 42 grid cells
    const remaining = (cells.length > 35 ? 42 : 35) - cells.length;
    for (let day = 1; day <= remaining; day++) {
      cells.push({
        day,
        isCurrentMonth: false,
        dateStr: "",
      });
    }

    return cells;
  }, [firstDay, daysInMonth, prevMonthDays, year, month]);

  const selectedStatus = selectedQuery.status;

  function handleJumpToday() {
    const now = new Date();
    setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
  }

  function handlePrevMonth() {
    const targetMonth = month - 2;
    const newMonthDate = new Date(year, targetMonth, 1);
    setMonthDate(newMonthDate);
    const newYear = newMonthDate.getFullYear();
    const newMonth = newMonthDate.getMonth() + 1;
    if (today.getFullYear() === newYear && today.getMonth() + 1 === newMonth) {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate(toDateString(newYear, newMonth, 1));
    }
  }

  function handleNextMonth() {
    const targetMonth = month;
    const newMonthDate = new Date(year, targetMonth, 1);
    setMonthDate(newMonthDate);
    const newYear = newMonthDate.getFullYear();
    const newMonth = newMonthDate.getMonth() + 1;
    if (today.getFullYear() === newYear && today.getMonth() + 1 === newMonth) {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate(toDateString(newYear, newMonth, 1));
    }
  }

  const specialStatusesCount = statuses.size;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#0f172a] text-white border-b border-slate-800 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base sm:text-lg group"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </span>
            <span className="tracking-tight font-extrabold text-white">
              Day Status
            </span>
          </Link>

          <div>
            {!auth.isReady ? (
              <div className="h-9 w-20 sm:w-24 animate-pulse rounded-xl bg-slate-800" />
            ) : auth.user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden text-xs font-medium text-slate-400 sm:inline truncate max-w-48">
                  {auth.user.fullName || auth.user.email}
                </span>
                <Link
                  href="/admin"
                  className="px-2 py-2 text-xs font-semibold text-slate-300 transition hover:text-white sm:px-3.5 sm:text-sm"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-indigo-600 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition"
              >
                <span>Login</span>
                <LogIn className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Calendar & Schedule Viewer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
              Select any date to check operational notes, holiday schedules, and
              daily status details.
            </p>
          </div>

          {/* Quick Jump Today Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToday}
            className="self-start sm:self-auto text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 shadow-xs flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
            <span>Today</span>
          </Button>
        </div>

        {/* Calendar & Details Grid */}
        <div className="grid gap-6 lg:grid-cols-7 items-start">
          {/* Calendar Widget (4 cols) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs lg:col-span-4 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Controls */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border-slate-200 text-slate-700"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center gap-2 min-w-36 sm:min-w-40 justify-center font-extrabold text-slate-900 text-sm sm:text-base">
                    <CalendarDays className="h-4 w-4 text-indigo-600 shrink-0" />
                    {monthNames[month - 1]} {year}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border-slate-200 text-slate-700"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {specialStatusesCount > 0 ? (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-indigo-600" />
                    {specialStatusesCount}{" "}
                    {specialStatusesCount === 1 ? "note" : "notes"} in{" "}
                    {monthNames[month - 1]}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    Standard monthly schedule
                  </span>
                )}
              </div>

              {/* Weekdays Header */}
              <div className="mb-2 grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider">
                {weekdays.map((day) => (
                  <span
                    key={day}
                    className={
                      day === "SUN"
                        ? "text-rose-500"
                        : day === "SAT"
                          ? "text-indigo-400"
                          : ""
                    }
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {calendarCells.map((cell, idx) => {
                  if (!cell.isCurrentMonth) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="flex min-h-12.5 sm:min-h-16 flex-col items-center justify-between rounded-xl p-1.5 sm:p-2 text-xs sm:text-sm text-slate-300 bg-slate-50/60 select-none"
                      >
                        <span className="font-medium text-[11px] sm:text-xs">
                          {cell.day}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                      </div>
                    );
                  }

                  const hasStatus = statuses.has(cell.dateStr);
                  const isSelected = selectedDate === cell.dateStr;
                  const isToday = cell.dateStr === todayStr;

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      className={`flex min-h-12.5 sm:min-h-16 flex-col items-center justify-between rounded-xl p-1 sm:p-2 text-xs sm:text-sm transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.97] ${
                        isSelected
                          ? "bg-indigo-50 border-2 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                          : "hover:bg-slate-50 border border-slate-100 text-slate-700"
                      }`}
                      onClick={() => setSelectedDate(cell.dateStr)}
                    >
                      <span
                        className={`text-xs sm:text-sm ${
                          isSelected
                            ? "grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full bg-indigo-600 font-bold text-white shadow-xs"
                            : isToday
                              ? "grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700"
                              : idx % 7 === 0
                                ? "text-rose-500 font-medium"
                                : "font-medium"
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* Status indicator dot */}
                      <span
                        className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all ${
                          hasStatus
                            ? "bg-emerald-500 ring-2 ring-emerald-100"
                            : "bg-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50/80 p-3 text-[11px] sm:text-xs font-medium text-slate-600 border border-slate-100">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Special Note / Event
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  Regular Schedule
                </span>
              </div>
              <span className="flex items-center gap-1 text-slate-400">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                Tap any day to view details
              </span>
            </div>
          </section>

          {/* Details Card (3 cols on desktop, responsive stack on mobile) */}
          <section
            id="day-details-panel"
            className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs lg:col-span-3 transition-all"
          >
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5 text-indigo-600" />
                  Schedule Details
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {formatDate(selectedDate)}
                </h2>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedStatus
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {selectedStatus ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <CalendarCheck className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    {selectedStatus ? "Special Schedule" : "Regular Schedule"}
                  </span>
                </div>
              </div>

              {/* Description Box */}
              <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100/80">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
                  <span>Notes & Information</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-800 wrap-break-word">
                  {selectedQuery.isLoading ? (
                    <span className="text-slate-400 italic">
                      Loading schedule details...
                    </span>
                  ) : (
                    (selectedStatus?.content ??
                    "No status has been added for this date yet.")
                  )}
                </p>
              </div>

              {/* Last Modified (Only shown when a custom note exists) */}
              {selectedStatus && (
                <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    {new Date(selectedStatus.updatedAt).toLocaleString(
                      "en-US",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </p>
                </div>
              )}

              {/* Additional Information */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Day of Week
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                      },
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    Month
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
