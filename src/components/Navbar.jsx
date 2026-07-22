"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import GlobalSearch from "./GlobalSearch";
import { useTheme } from "./ThemeProvider";
import { labelForPath, quickActionsFor, ROLE_LABEL } from "@/lib/roles";
import { notify } from "@/lib/toast";

import {
  Menu, Bell, Sun, Moon, Plus, ChevronDown, User, Settings,
  KeyRound, LogOut, Circle, ChevronRight, PanelLeft,
} from "lucide-react";

const TONE_DOT = {
  alert: "text-red-500",
  info: "text-amber-500",
  success: "text-brand-500",
};

export default function Navbar({ session, onMenuClick, onDesktopToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const [now, setNow] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [openMenu, setOpenMenu] = useState(null); // 'bell' | 'user' | 'quick'
  const [dbOk, setDbOk] = useState(true);
  const wrapRef = useRef(null);

  const crumb = labelForPath(pathname);
  const quick = quickActionsFor(session.role);

  // Live clock
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Notifications + health
  useEffect(() => {
    async function load() {
      try {
        const [nRes, hRes] = await Promise.all([
          fetch("/api/notifications"),
          fetch("/api/health"),
        ]);
        const nData = await nRes.json();
        const hData = await hRes.json();
        setNotifs(Array.isArray(nData) ? nData : []);
        setDbOk(hData.ok === true);
      } catch {
        setDbOk(false);
      }
    }
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    notify.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const initials = session.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const alertCount = notifs.filter((n) => n.tone === "alert").length;

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 lg:px-6">
        {/* Sidebar toggle — mobile drawer */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink-soft hover:bg-brand-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Sidebar toggle — desktop pin */}
        <button
          onClick={onDesktopToggle}
          className="hidden rounded-lg p-2 text-ink-soft hover:bg-brand-50 lg:block"
          aria-label="Toggle sidebar"
          title="Pin / unpin sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden items-center gap-1.5 text-sm sm:flex">
          <Link href="/dashboard" className="text-muted hover:text-brand-600">
            Dashboard
          </Link>
          {crumb !== "Dashboard" && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted" />
              <span className="font-medium text-ink">{crumb}</span>
            </>
          )}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <div className="hidden flex-1 justify-end md:flex">
          <GlobalSearch />
        </div>

        {/* Date + time */}
        <div className="hidden text-right leading-tight xl:block">
          <p className="text-xs font-medium text-ink">
            {now
              ? now.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
          <p className="text-[11px] text-muted">
            {now
              ? now.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "—"}
          </p>
        </div>

        {/* System status */}
        <div className="hidden items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1.5 lg:flex">
          <Circle
            className={`h-2 w-2 ${
              dbOk ? "fill-brand-500 text-brand-500" : "fill-red-500 text-red-500"
            }`}
          />
          <span className="text-xs font-medium text-ink-soft">
            {dbOk ? "Online" : "DB Down"}
          </span>
        </div>

        {/* Quick actions */}
        {quick.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "quick" ? null : "quick")}
              className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-2 text-white transition hover:bg-brand-700"
              aria-label="Quick actions"
            >
              <Plus className="h-4 w-4" />
              <ChevronDown className="hidden h-3 w-3 sm:block" />
            </button>
            {openMenu === "quick" && (
              <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                {quick.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    onClick={() => setOpenMenu(null)}
                    className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "bell" ? null : "bell")}
            className="relative rounded-lg p-2 text-ink-soft hover:bg-brand-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifs.length > 0 && (
              <span
                className={`absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                  alertCount > 0 ? "bg-red-500" : "bg-brand-600"
                }`}
              >
                {notifs.length > 9 ? "9+" : notifs.length}
              </span>
            )}
          </button>

          {openMenu === "bell" && (
            <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-line bg-surface shadow-lg">
              <div className="border-b border-line px-4 py-2.5">
                <p className="text-sm font-semibold text-ink">Notifications</p>
              </div>
              {notifs.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted">
                  Nothing to show
                </p>
              )}
              {notifs.map((n, i) => (
                <Link
                  key={i}
                  href={n.href}
                  onClick={() => setOpenMenu(null)}
                  className="flex gap-2.5 border-b border-line px-4 py-2.5 last:border-0 hover:bg-brand-50"
                >
                  <Circle
                    className={`mt-1.5 h-2 w-2 shrink-0 fill-current ${
                      TONE_DOT[n.tone] || "text-muted"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-ink-soft">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {n.at_time ? String(n.at_time).slice(0, 10) : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-ink-soft hover:bg-brand-50"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-brand-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium text-ink">
                {session.name.split(" ")[0]}
              </span>
              <span className="block text-[10px] text-muted">
                {ROLE_LABEL[session.role]}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </button>

          {openMenu === "user" && (
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
                href="/profile"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50"
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <Link
                href="/change-password"
                onClick={() => setOpenMenu(null)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-brand-50"
              >
                <KeyRound className="h-4 w-4" /> Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-t border-line px-4 py-2 md:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}