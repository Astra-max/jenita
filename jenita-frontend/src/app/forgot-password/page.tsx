"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { requestPasswordReset } from "@/store/features/auth/authSlice";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();

  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const resetEmailSent = useAppSelector((state) => state.auth.resetEmailSent);
  const isLoading = status === "loading";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);

    const result = await dispatch(requestPasswordReset({ email }));
    if (requestPasswordReset.fulfilled.match(result)) {
      toast.success("Reset link sent — check your inbox.");
    } else {
      toast.error((result.payload as string) ?? "Something went wrong. Try again.");
    }
  };

  return (
    <AuthShell
      eyebrow="Reset your password"
      title="Forgot password?"
      subtitle="Enter the email on your account and we'll send you a reset link."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-base font-medium text-black hover:text-pink-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to log in
        </Link>
      }
    >
      {resetEmailSent ? (
        <div className="rounded-xl border border-pink-200 bg-pink-50 p-6 flex flex-col items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <MailCheck size={18} className="text-white" />
          </div>
          <p className="text-base font-medium text-black">Check your email</p>
          <p className="text-sm text-[#454545] leading-relaxed">
            If an account exists for <span className="font-medium">{email}</span>, a
            password reset link is on its way.
          </p>
          <button
            onClick={() => dispatch(requestPasswordReset({ email }))}
            className="text-sm font-medium text-black hover:text-pink-600 transition-colors"
          >
            Resend link
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            error={error}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white py-3.5 rounded-lg text-base font-medium hover:bg-pink-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending link…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
