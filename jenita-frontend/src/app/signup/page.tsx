"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signupUser } from "@/store/features/auth/authSlice";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((state) => state.auth.status);
  const isLoading = status === "loading";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: FieldErrors = {};
    if (name.trim().length < 2) errors.name = "Enter your full name.";
    if (!email.includes("@")) errors.email = "Enter a valid email address.";
    if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await dispatch(signupUser({ name, email, password }));
    if (signupUser.fulfilled.match(result)) {
      toast.success(`Account created. Welcome, ${result.payload.name.split(" ")[0]}.`);
      router.push("/dashboard");
    } else {
      const message = (result.payload as string) ?? "Something went wrong. Try again.";
      toast.error(message);
    }
  };

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="Set up Jenita in under a minute and let your day plan itself."
      footer={
        <p className="text-base text-[#828282]">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-medium hover:text-pink-600 transition-colors">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <FormField
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Jane Doe"
          autoComplete="name"
          error={fieldErrors.name}
          required
        />
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          error={fieldErrors.password}
          required
        />
        <FormField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white py-3.5 rounded-lg text-base font-medium hover:bg-pink-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-xs text-[#a3a3a3] text-center">
          By continuing, you agree to Jenita&apos;s Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
