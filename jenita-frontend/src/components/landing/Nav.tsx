"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out. See you soon.");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-pink-200">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16 sm:h-[74px]">
        <Link href="/" className="text-2xl font-bold text-black tracking-tight">
          Jenita
        </Link>

        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-base lg:text-lg font-medium text-black hover:text-pink-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-black/70">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="bg-black text-white px-5 py-2.5 rounded-lg text-base font-medium hover:bg-pink-600 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-5 py-2.5 rounded-lg text-base font-medium hover:bg-pink-600 transition-colors"
            >
              Register/Log in
            </Link>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-[5px] p-1"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-black transition-transform ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-6 h-0.5 bg-black transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-black transition-transform ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-pink-200 px-5 py-4 flex flex-col gap-4">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-base font-medium text-black"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {user ? (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="bg-black text-white px-5 py-2.5 rounded-lg text-base font-medium self-start"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-black text-white px-5 py-2.5 rounded-lg text-base font-medium self-start"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
