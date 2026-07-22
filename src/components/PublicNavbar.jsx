"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, LayoutDashboard, User, Settings, LogOut,
  ChevronDown, Menu, X,
} from "lucide-react";
import { ROLE_LABEL } from "@/lib/roles";
import { notify } from "@/lib/toast";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#zones", label: "Zones" },
  { href: "#products", label: "Products" },
  { href: "#partners", label: "Partners" },
  { href: "#how", label: "How it works" },
];

export default function PublicNavbar({ session }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    notify.success("Signed out");
    setUserOpen(false);
    router.refresh();
  }

  const initials = session?.name
    ? session.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            W2A
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-ink">
              W2A Intelligence
            </span>
            <span className="hidden text-[11px] text-muted sm:block">
              City Waste Transparency Portal
            </span>
          </span>
        </Link>

        {/* Section links */}
        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition hover:text-brand-600"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex-1 lg:hidden" />

        {/* Right side — changes with auth state */}
        {session ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 sm:px-4"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-brand-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {initials}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </button>

              {userOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {session.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {ROLE_LABEL[session.role]}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 sm:px-4"
            >
              Register
              <ArrowRight className="hidden h-4 w-4 sm:block" />
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-ink-soft hover:bg-brand-50 lg:hidden"
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile section links */}
      {menuOpen && (
        <nav className="border-t border-line px-4 py-2 lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm text-ink-soft hover:text-brand-600"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}