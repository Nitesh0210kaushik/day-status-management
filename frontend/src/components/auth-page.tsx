"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { AuthPanel } from "./auth-panel";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "./ui/toast";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const auth = useAuth();
  const showToast = useToast();

  return (
    <main className="min-h-svh bg-linear-to-br from-slate-50 via-indigo-50/30 to-slate-100 px-4 py-5 selection:bg-indigo-100 selection:text-indigo-900 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100svh-2.5rem)] max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-20">
        <section className="hidden max-w-xl lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <CalendarDays className="h-4 w-4" />
            Day Status Management
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 xl:text-5xl">
            Keep every day&apos;s status clear and accessible.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            Sign in to manage daily updates, or create an account to start
            maintaining your day status schedule.
          </p>
        </section>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <AuthPanel
            auth={auth}
            mode={mode}
            onSuccess={(message) => {
              showToast({
                title:
                  mode === "login" ? "Login successful" : "Account created",
                description: message,
                variant: "success",
              });
              router.push("/admin");
            }}
          />
        </div>
      </div>
    </main>
  );
}
