"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";
import { navFor, ROLE_LABEL } from "@/lib/roles";

export default function Sidebar({ session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = navFor(session.role);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = session.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-ink hover:bg-brand-50"
          aria-label="Open menu"
        >
          <Icon name="menu" />
        </button>
        <span className="font-bold text-ink">W2A Intelligence</span>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold">
              W2A
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">Intelligence</p>
              <p className="text-[11px] text-white/50">Waste-to-Assets</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{session.name}</p>
              <p className="truncate text-[11px] text-white/50">
                {ROLE_LABEL[session.role]}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-red-500/20 hover:text-red-300"
          >
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}