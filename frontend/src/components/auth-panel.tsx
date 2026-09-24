"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import type { UseAuthResult } from "../hooks/use-auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/toast";

type AuthPanelProps = {
  auth: UseAuthResult;
  onSuccess: (message: string) => void;
  mode?: "login" | "register" | "both";
};

export function AuthPanel({ auth, onSuccess, mode = "login" }: AuthPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const showToast = useToast();

  async function submit(action: "login" | "register") {
    let hasError = false;

    if (action === "register" && !name.trim()) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (!email.trim()) {
      setEmailError(true);
      hasError = true;
    } else {
      setEmailError(false);
    }

    if (hasError) return;

    try {
      if (action === "register") {
        await auth.register(email, password, name.trim());
      } else {
        await auth.login(email, password);
      }
      onSuccess(
        action === "login"
          ? "Logged in successfully"
          : "Account created successfully",
      );
    } catch (error) {
      showToast({
        title: "Request failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(mode === "register" ? "register" : "login");
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/viewer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Calendar</span>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200">
            <Calendar className="h-6 w-6" />
          </span>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Day Status
          </span>
        </div>

        <h1 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {mode === "register" ? "Create an Account" : "Sign In"}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-xs">
          {mode === "register"
            ? "Sign up to start managing schedules and day status information."
            : "Enter your credentials to access your dashboard."}
        </p>
      </div>

      <form className="mt-6 sm:mt-7 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              <label htmlFor="name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
            </div>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
              className={`w-full ${
                nameError
                  ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                  : ""
              }`}
            />
            {nameError && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />
                Full Name is required
              </p>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            <label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.trim()) setEmailError(false);
            }}
            className={`w-full ${
              emailError
                ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                : ""
            }`}
          />
          {emailError && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Valid email is required
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            <label htmlFor="password" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Password</span>
            </label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={auth.isLoading}
          className="w-full mt-2 h-11 rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
        >
          {auth.isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : mode === "register" ? (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </>
          )}
        </Button>
      </form>

      {auth.error && (
        <div className="mt-4 flex items-center gap-2 text-center text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{auth.error}</span>
        </div>
      )}

      <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
        <Link
          href="/viewer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 sm:text-sm"
        >
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span>View Public Calendar</span>
        </Link>
        <p className="text-center text-xs text-slate-500">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-indigo-600 hover:underline"
              >
                Register here
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign in here
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
