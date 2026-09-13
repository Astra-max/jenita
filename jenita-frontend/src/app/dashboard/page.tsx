"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <nav className="bg-white border-b border-pink-200">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16 sm:h-[74px]">
          <Link href="/" className="text-2xl font-bold text-black tracking-tight">
            Jenita
          </Link>
          <button
            onClick={() => {
              dispatch(logout());
              toast.success("Signed out. See you soon.");
              router.push("/");
            }}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-base font-medium hover:bg-pink-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-16">
        <p className="text-sm font-medium text-pink-600 mb-3">Dashboard</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 tracking-tight">
          Good to see you, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-base sm:text-lg text-[#454545] max-w-xl">
          This is a placeholder home base for your day. Wire it up to your real
          schedule data next — the auth flow around it is ready to go.
        </p>
      </main>
    </div>
  );
}
