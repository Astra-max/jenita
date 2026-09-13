"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeMobileMenu, toggleMobileMenu } from "@/store/slices/navSlice";
import { LinkButton } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenuOpen = useAppSelector((s) => s.nav.mobileMenuOpen);
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-bloom-100 bg-white/90 backdrop-blur">
      <div className="section-shell flex h-[76px] items-center justify-between">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Jenita
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[15px] font-medium text-ink-soft transition-colors hover:text-ink",
                pathname === link.href && "text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <LinkButton href="/account">{user ? user.full_name.split(" ")[0] : "My Account"}</LinkButton>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => dispatch(toggleMobileMenu())}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-bloom-100 bg-white md:hidden">
          <div className="section-shell flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => dispatch(closeMobileMenu())}
                className="rounded-lg px-2 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-sand-100 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => dispatch(closeMobileMenu())}
              className="mt-2 rounded-full bg-ink px-4 py-2.5 text-center text-[15px] font-semibold text-white"
            >
              {user ? user.full_name.split(" ")[0] : "My Account"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
