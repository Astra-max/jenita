"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, UserCheck, LogOut, ArrowRight } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const registerSchema = z.object({
  full_name: z.string().min(2, "Full name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, register: signUp, loginDemo, logout, isLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@jenita.ai", password: "jenitademo123" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onLoginSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      router.push("/dashboard");
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onRegisterSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, values.full_name);
      router.push("/dashboard");
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoSignIn() {
    setIsSubmitting(true);
    try {
      await loginDemo();
      router.push("/dashboard");
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-bloom-50 px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-bloom-100 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bloom-100 text-bloom-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-ink">{user.full_name}</h1>
              <p className="text-xs text-ink-soft">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-sand-50 p-4 text-xs text-ink-soft space-y-2">
            <div className="flex justify-between">
              <span>Account Status:</span>
              <span className="font-semibold text-emerald-600">Active · Pro Trial</span>
            </div>
            <div className="flex justify-between">
              <span>Voice Service:</span>
              <span className="font-semibold text-bloom-600">Gemini LiveStream</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-full bg-bloom-500 py-3 text-sm font-semibold text-white shadow hover:bg-bloom-600 transition-colors"
            >
              Go to Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-full border border-bloom-200 py-2.5 text-sm font-medium text-ink-soft hover:bg-sand-100 hover:text-ink transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-bloom-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-bloom-100 bg-white p-8 shadow-xl">
        <h1 className="font-display text-2xl font-bold text-ink">
          {tab === "login" ? "Sign in to Jenita" : "Create an Account"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Voice-first scheduling and spoken reminders.
        </p>

        {/* 1-Click Demo Login Banner */}
        <div className="mt-5 rounded-xl border border-bloom-200 bg-bloom-50/70 p-3.5 text-xs">
          <div className="flex items-center gap-2 text-bloom-800 font-semibold mb-1">
            <Sparkles className="h-4 w-4 text-bloom-600" />
            Instant Demo Access
          </div>
          <p className="text-ink-soft leading-relaxed">
            Test the live voice assistant and agenda immediately with the pre-configured Sarah Connor account.
          </p>
          <button
            onClick={handleDemoSignIn}
            disabled={isSubmitting}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-bloom-600 py-2 font-semibold text-white shadow-sm hover:bg-bloom-700 transition-colors"
          >
            1-Click Demo Sign In
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex border-b border-bloom-100 text-sm">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 pb-2 font-semibold transition-colors ${
              tab === "login"
                ? "border-b-2 border-bloom-500 text-ink"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 pb-2 font-semibold transition-colors ${
              tab === "register"
                ? "border-b-2 border-bloom-500 text-ink"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Email
              </label>
              <input
                type="email"
                {...loginForm.register("email")}
                className="mt-1.5 h-11 w-full rounded-xl border border-bloom-200 px-4 text-sm text-ink outline-none focus:border-bloom-400"
                placeholder="you@work.com"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-rose-500">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Password
              </label>
              <input
                type="password"
                {...loginForm.register("password")}
                className="mt-1.5 h-11 w-full rounded-xl border border-bloom-200 px-4 text-sm text-ink outline-none focus:border-bloom-400"
                placeholder="••••••••"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-rose-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Full Name
              </label>
              <input
                type="text"
                {...registerForm.register("full_name")}
                className="mt-1.5 h-11 w-full rounded-xl border border-bloom-200 px-4 text-sm text-ink outline-none focus:border-bloom-400"
                placeholder="Sarah Connor"
              />
              {registerForm.formState.errors.full_name && (
                <p className="mt-1 text-xs text-rose-500">
                  {registerForm.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Email
              </label>
              <input
                type="email"
                {...registerForm.register("email")}
                className="mt-1.5 h-11 w-full rounded-xl border border-bloom-200 px-4 text-sm text-ink outline-none focus:border-bloom-400"
                placeholder="you@work.com"
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-xs text-rose-500">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Password
              </label>
              <input
                type="password"
                {...registerForm.register("password")}
                className="mt-1.5 h-11 w-full rounded-xl border border-bloom-200 px-4 text-sm text-ink outline-none focus:border-bloom-400"
                placeholder="••••••••"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-rose-500">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account…" : "Create Account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
