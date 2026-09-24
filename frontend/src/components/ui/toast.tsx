"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastVariant = "success" | "error";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(toast: Omit<Toast, "id">) {
    const id = Date.now();
    setToasts((current) => [...current, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }

  function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const isSuccess = toast.variant === "success";
          const Icon = isSuccess ? CheckCircle2 : AlertCircle;

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
                isSuccess ? "border-emerald-200" : "border-rose-200"
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  isSuccess ? "text-emerald-600" : "text-rose-600"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-1 text-xs text-slate-600">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 transition hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context.showToast;
}
