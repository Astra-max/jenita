"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/features/auth/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((state) => state.auth.status);
  const isLoading = status === "loading";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: typeof fieldErrors = {};
    if (!email.includes("@")) errors.email = "Enter a valid email address.";
    if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name.split(" ")[0]}.`);
      router.push("/dashboard");
    } else {
      const message = (result.payload as string) ?? "Something went wrong. Try again.";
      toast.error(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to Jenita"
      subtitle="Pick up your day right where you left off."
      footer={
        <p className="text-base text-[#828282]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-black font-medium hover:text-pink-600 transition-colors">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={fieldErrors.email}
          required
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldErrors.password}
          required
        />

        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-black hover:text-pink-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white py-3.5 rounded-lg text-base font-medium hover:bg-pink-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in…" : "Log in"}
        </button>

        <p className="text-xs text-[#a3a3a3] text-center">
          Demo account: demo@jenita.app · jenita123
        </p>
      </form>
    </AuthShell>
  );
}
