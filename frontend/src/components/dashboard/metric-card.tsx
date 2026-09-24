import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  description: string;
  color: "indigo" | "green" | "slate";
  icon: ReactNode;
};

export function MetricCard({
  label,
  value,
  detail,
  description,
  color,
  icon,
}: MetricCardProps) {
  const colorStyles = {
    indigo: {
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      bar: "bg-indigo-600",
      iconBg: "bg-indigo-50 text-indigo-600",
    },
    green: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bar: "bg-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    slate: {
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      bar: "bg-slate-400",
      iconBg: "bg-slate-100 text-slate-600",
    },
  }[color];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {value}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-bold ${colorStyles.badge}`}
            >
              {detail}
            </span>
          </div>
        </div>
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl sm:h-11 sm:w-11 ${colorStyles.iconBg}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
      <div className={`mt-3.5 h-1.5 rounded-full ${colorStyles.bar}`} />
    </div>
  );
}
