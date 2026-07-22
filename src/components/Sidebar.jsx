"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Pin, PinOff } from "lucide-react";
import Icon from "./Icon";
import { navFor, ROLE_LABEL } from "@/lib/roles";

export default function Sidebar({
  session,
  mobileOpen,
  onMobileClose,
  pinned,
  onTogglePin,
  hovered,
  onHoverChange,
}) {
  const pathname = usePathname();
  const items = navFor(session.role);

  // Wide when pinned, hovered, or open on mobile
  const wide = pinned || hovered || mobileOpen;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-[#0a0a0a] transition-all duration-200 ${
          mobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${wide ? "lg:w-64" : "lg:w-16"} ${
          !pinned && hovered ? "lg:shadow-2xl" : ""
        }`}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white"
          >
            W2A
          </Link>
          <span
            className={`min-w-0 flex-1 leading-tight whitespace-nowrap transition-opacity duration-150 ${
              wide ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="block truncate text-sm font-bold text-white">
              Intelligence
            </span>
            <span className="block truncate text-[11px] text-white/50">
              Waste-to-Assets
            </span>
          </span>

          {/* Pin toggle (desktop) */}
          {wide && (
            <button
              onClick={onTogglePin}
              className="hidden shrink-0 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white lg:block"
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              title={pinned ? "Unpin sidebar" : "Keep sidebar open"}
            >
              {pinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Close (mobile) */}
          <button
            onClick={onMobileClose}
            className="shrink-0 rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-3">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={wide ? undefined : item.label}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                <span
                  className={`truncate whitespace-nowrap transition-opacity duration-150 ${
                    wide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-white/10 p-2">
          <Link
            href="/profile"
            onClick={onMobileClose}
            className="flex items-center gap-3 rounded-lg px-1.5 py-2 transition hover:bg-white/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {session.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <span
              className={`min-w-0 flex-1 leading-tight whitespace-nowrap transition-opacity duration-150 ${
                wide ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="block truncate text-sm font-medium text-white">
                {session.name}
              </span>
              <span className="block truncate text-[11px] text-white/50">
                {ROLE_LABEL[session.role]}
              </span>
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}