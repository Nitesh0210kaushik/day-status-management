"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  LayoutGrid,
  LogOut,
  Table,
  UserRound,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import {
  useDayStatus,
  useMonthStatuses,
  useYearStatuses,
} from "../hooks/use-day-status";
import { Button } from "./ui/button";
import { useToast } from "./ui/toast";
import { MetricCard } from "./dashboard/metric-card";
import { StatusModal } from "./dashboard/status-modal";

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const monthFullNames = [
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

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function dateFor(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDate(date: string) {
  if (!date) return "Select a Date";
  const parsed = new Date(`${date}T00:00:00`);
  if (isNaN(parsed.getTime())) return "Select a Date";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function AdminDashboard() {
  const auth = useAuth();
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const [selectedDate, setSelectedDate] = useState("");
  const [editing, setEditing] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "matrix">("month");
  const [activeMonthIndex, setActiveMonthIndex] = useState(now.getMonth());
  const showToast = useToast();

  const annual = useYearStatuses(year, viewMode === "matrix");
  const monthly = useMonthStatuses(
    year,
    activeMonthIndex + 1,
    viewMode === "month",
  );
  const selectedQuery = useDayStatus(selectedDate);

  const statuses = useMemo(
    () =>
      new Map(
        (viewMode === "matrix" ? annual.statuses : (monthly.data ?? [])).map(
          (status) => [status.date, status],
        ),
      ),
    [annual.statuses, monthly.data, viewMode],
  );

  const totalDays =
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
  const statusCount = statuses.size;
  const content = selectedQuery.status?.content ?? "";

  function openEdit(dateToEdit?: string) {
    const target =
      dateToEdit || selectedDate || dateFor(year, activeMonthIndex + 1, 1);
    setSelectedDate(target);
    setEditing(true);
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    setSelectedDate("");
  }

  async function saveStatus(value: string) {
    await selectedQuery.save(value);
    setEditing(false);
    showToast({
      title: "Status updated",
      description: `Status updated for ${formatDate(selectedDate)}`,
      variant: "success",
    });
  }

  function handleLogout() {
    auth.logout();
    router.push("/login");
  }

  // Monthly View calculations
  const activeMonthDaysCount = new Date(
    year,
    activeMonthIndex + 1,
    0,
  ).getDate();
  const displayTotalDays =
    viewMode === "matrix" ? totalDays : activeMonthDaysCount;
  const activeMonthFirstDay = new Date(year, activeMonthIndex, 1).getDay();
  const activePrevMonthDays = new Date(year, activeMonthIndex, 0).getDate();

  const monthlyGridCells = useMemo(() => {
    const cells = [];
    for (let i = activeMonthFirstDay - 1; i >= 0; i--) {
      cells.push({
        day: activePrevMonthDays - i,
        isCurrentMonth: false,
        dateStr: "",
      });
    }
    for (let day = 1; day <= activeMonthDaysCount; day++) {
      cells.push({
        day,
        isCurrentMonth: true,
        dateStr: dateFor(year, activeMonthIndex + 1, day),
      });
    }
    const remaining = (cells.length > 35 ? 42 : 35) - cells.length;
    for (let day = 1; day <= remaining; day++) {
      cells.push({
        day,
        isCurrentMonth: false,
        dateStr: "",
      });
    }
    return cells;
  }, [
    activeMonthFirstDay,
    activeMonthDaysCount,
    activePrevMonthDays,
    year,
    activeMonthIndex,
  ]);

  if (!auth.isReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc] p-6 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            Loading secure workspace...
          </p>
        </div>
      </main>
    );
  }

  if (!auth.user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc] p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-lg border border-slate-100">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <UserRound className="h-6 w-6" />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Admin Workspace
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
            Login Required
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in to manage day status information and operational
            calendars.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0f172a] text-white border-b border-slate-800 shadow-sm">
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1600px] items-center justify-between px-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-6">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-base font-bold tracking-tight group sm:text-xl"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <CalendarDays className="h-5 w-5" />
              </span>
              <span>Day Status</span>
            </Link>

            <nav className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-slate-300 sm:gap-1 sm:text-sm">
              <Link
                href="/admin"
                className="px-1.5 py-2 font-semibold text-white transition hover:text-indigo-300 sm:px-3.5"
              >
                Dashboard
              </Link>
              <Link
                href="/viewer"
                className="rounded-lg px-1.5 py-2 transition hover:bg-slate-800 hover:text-white sm:px-3.5"
              >
                <span className="sm:hidden">Viewer</span>
                <span className="hidden sm:inline">Public Day Viewer</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/80 px-1.5 py-1.5 sm:gap-3 sm:px-3.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="hidden max-w-44 truncate text-xs font-semibold text-slate-200 sm:inline">
                {auth.user.fullName || auth.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="ml-1 text-xs text-slate-400 hover:text-red-400 transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1">
        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Day Status Management
                </h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                View, audit, and configure operational status information for
                all 365 calendar days.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold shadow-xs sm:text-sm">
                <CalendarRange className="h-4 w-4 text-indigo-600" />
                <span className="sr-only">Select year</span>
                <select
                  value={year}
                  onChange={(event) =>
                    handleYearChange(Number(event.target.value))
                  }
                  className="cursor-pointer appearance-none bg-transparent pr-1 font-bold text-slate-900 outline-none"
                  aria-label="Select year"
                >
                  {Array.from(
                    { length: 11 },
                    (_, index) => now.getFullYear() - 5 + index,
                  ).map((optionYear) => (
                    <option key={optionYear} value={optionYear}>
                      {optionYear}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                onClick={() => openEdit()}
                size="default"
                className="shadow-xs"
              >
                <Edit3 className="mr-1.5 h-4 w-4" />
                Update Status
              </Button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <section className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-3">
            <MetricCard
              label="TOTAL DAYS"
              value={String(displayTotalDays)}
              detail={
                viewMode === "matrix" ? "Year Calendar" : "Month Calendar"
              }
              description={
                viewMode === "matrix"
                  ? `All calendar days for ${year}`
                  : `All days in ${monthFullNames[activeMonthIndex]} ${year}`
              }
              color="indigo"
              icon={<CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />}
            />
            <MetricCard
              label="DAYS WITH STATUS"
              value={String(statusCount)}
              detail={`${Math.round((statusCount / displayTotalDays) * 100)}%`}
              description="Active scheduled days"
              color="green"
              icon={<CalendarCheck2 className="h-5 w-5 sm:h-6 sm:w-6" />}
            />
            <MetricCard
              label="NO STATUS"
              value={String(displayTotalDays - statusCount)}
              detail={`${Math.round(((displayTotalDays - statusCount) / displayTotalDays) * 100)}%`}
              description="Unassigned or open days"
              color="slate"
              icon={<Clock3 className="h-5 w-5 sm:h-6 sm:w-6" />}
            />
          </section>

          {/* View Switcher Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-3 sm:p-4 border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "month"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Monthly View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "matrix"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>Annual Matrix</span>
              </button>
            </div>

            {/* Quick Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Special Schedule / Note
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Standard Schedule
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                Selected
              </span>
            </div>
          </div>

          {/* View Mode 1: Monthly View (Ultra-responsive for Mobile & Tablets) */}
          {viewMode === "month" && (
            <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4">
              {/* Month Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    disabled={activeMonthIndex === 0}
                    onClick={() =>
                      setActiveMonthIndex((prev) => Math.max(0, prev - 1))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-extrabold text-slate-800 text-sm sm:text-base min-w-32 text-center">
                    {monthFullNames[activeMonthIndex]} {year}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    disabled={activeMonthIndex === 11}
                    onClick={() =>
                      setActiveMonthIndex((prev) => Math.min(11, prev + 1))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick month pills */}
                <div className="hidden xl:flex items-center gap-1">
                  {months.map((mName, idx) => (
                    <button
                      key={mName}
                      onClick={() => setActiveMonthIndex(idx)}
                      className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                        idx === activeMonthIndex
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {mName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Days Grid */}
              <div>
                <div className="mb-2 grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-slate-400">
                  {weekdays.map((d) => (
                    <span
                      key={d}
                      className={d === "SUN" ? "text-rose-500" : ""}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {monthlyGridCells.map((cell, idx) => {
                    if (!cell.isCurrentMonth) {
                      return (
                        <div
                          key={`empty-m-${idx}`}
                          className="flex min-h-12 sm:min-h-16 flex-col items-center justify-between rounded-xl p-1.5 text-xs text-slate-300 bg-slate-50/50"
                        >
                          <span>{cell.day}</span>
                        </div>
                      );
                    }

                    const hasStatus = statuses.has(cell.dateStr);
                    const isSelected = selectedDate === cell.dateStr;

                    return (
                      <button
                        key={cell.dateStr}
                        onClick={() => {
                          setSelectedDate(cell.dateStr);
                          setEditing(false);
                        }}
                        className={`flex min-h-12 sm:min-h-16 flex-col items-center justify-between rounded-xl p-1.5 sm:p-2 text-xs sm:text-sm transition relative border ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                            : hasStatus
                              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                              : "border-slate-100 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span
                          className={
                            isSelected
                              ? "grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-white font-bold text-xs"
                              : "font-semibold"
                          }
                        >
                          {cell.day}
                        </span>

                        <span className="flex items-center gap-1 text-[10px] font-medium">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              hasStatus ? "bg-emerald-600" : "bg-slate-300"
                            }`}
                          />
                          <span className="hidden sm:inline">
                            {hasStatus ? "Configured" : "None"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Click any day to inspect details or update its operational
                  status.
                </span>
                {selectedDate && (
                  <Button size="sm" onClick={() => openEdit(selectedDate)}>
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                    Edit Selected Day ({selectedDate})
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* View Mode 2: Annual Matrix Table */}
          {viewMode === "matrix" && (
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="flex items-center justify-between bg-indigo-50/60 px-5 py-4 border-b border-indigo-100/60">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Annual 365-Day Schedule Matrix — Fiscal {year}
                </h2>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Auto-sync Active
                </span>
              </div>

              {/* Scrollable Container with sticky Day column */}
              <div className="overflow-x-auto relative">
                <div className="min-w-225">
                  {/* Table Header */}
                  <div className="grid grid-cols-[60px_repeat(12,minmax(65px,1fr))] bg-indigo-100/70 px-2 py-2.5 text-center text-xs font-bold text-slate-700 tracking-wider sticky top-0 z-10 border-b border-indigo-200/70">
                    <span className="sticky left-0 bg-indigo-100/95 font-black text-slate-800">
                      DAY
                    </span>
                    {months.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>

                  {/* 31 Rows */}
                  {Array.from({ length: 31 }, (_, index) => index + 1).map(
                    (day) => (
                      <div
                        key={day}
                        className="grid grid-cols-[60px_repeat(12,minmax(65px,1fr))] border-b border-slate-100 px-2 text-center text-xs hover:bg-slate-50/50"
                      >
                        <span className="py-2.5 font-bold text-slate-700 sticky left-0 bg-white">
                          {day}
                        </span>
                        {months.map((_, monthIndex) => {
                          const valid =
                            day <= new Date(year, monthIndex + 1, 0).getDate();
                          const date = dateFor(year, monthIndex + 1, day);
                          const status = statuses.get(date);
                          const selected = selectedDate === date;

                          return (
                            <button
                              key={date}
                              disabled={!valid}
                              onClick={() => {
                                setSelectedDate(date);
                                setEditing(false);
                              }}
                              className={`m-0.5 min-h-8 rounded-lg px-1 text-[11px] font-semibold transition ${
                                !valid
                                  ? "cursor-not-allowed bg-slate-50/60 text-slate-300"
                                  : selected
                                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-xs"
                                    : status
                                      ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                      : "text-slate-400 hover:bg-indigo-50/80"
                              }`}
                            >
                              {!valid ? "×" : status ? "● Note" : "—"}
                            </button>
                          );
                        })}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-5 py-3 text-xs text-slate-500 border-t border-slate-200/70">
                <span>
                  Displaying 31 operational day rows across 12 calendar tracks.
                </span>
                <Button variant="outline" size="sm" onClick={() => openEdit()}>
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                  Edit Status
                </Button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Edit Status Modal */}
      {editing && (
        <StatusModal
          key={selectedDate}
          date={selectedDate}
          initialValue={content}
          isSaving={selectedQuery.isSaving}
          error={selectedQuery.error}
          onDateChange={setSelectedDate}
          onClose={() => setEditing(false)}
          onSave={saveStatus}
        />
      )}
    </div>
  );
}
