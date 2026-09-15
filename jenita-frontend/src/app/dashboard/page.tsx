"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { DashboardMainContent } from "@/components/dashboard/DashboardMainContent";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { logout } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out. See you soon.");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <nav className="bg-white border-b border-pink-200 sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16 sm:h-[74px]">
          <Link href="/" className="text-2xl font-bold text-black tracking-tight">
            Jenita
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast("You&apos;re all caught up.", { icon: <Bell size={16} /> })}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-pink-50 transition-colors text-[#454545]"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <p className="hidden sm:block text-sm text-[#454545]">{user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <DashboardSidebar />
          <DashboardMainContent user={user} />
        </div>
      </main>
    </div>
  );
}
