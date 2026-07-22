"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Building2, CalendarDays, KeyRound } from "lucide-react";
import StatCard from "@/components/StatCard";
import { ROLE_LABEL } from "@/lib/roles";
import { notify } from "@/lib/toast";

export default function ProfileClient() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/profile");
    const json = await res.json();
    if (!res.ok) {
      notify.error(json.error || "Could not load profile");
      return;
    }
    setData(json);
    setForm({ name: json.user.name, email: json.user.email });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        notify.error(json.error);
        return;
      }
      notify.success(json.message);
      load();
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <div className="h-48 animate-pulse rounded-2xl border border-line bg-surface" />
    );
  }

  const { user, stats } = data;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink">{user.name}</h2>
            <p className="text-sm text-muted">{ROLE_LABEL[user.role]}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </span>
              {user.zone_name && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {user.zone_name}
                </span>
              )}
              {user.company_name && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {user.company_name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Joined {user.joined}
              </span>
            </div>
          </div>
          <Link
            href="/change-password"
            className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-canvas"
          >
            <KeyRound className="h-4 w-4" /> Change Password
          </Link>
        </div>
      </div>

      {/* Activity stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {user.role === "collector" && (
          <>
            <StatCard label="Collections Logged" value={stats.collections} icon="truck" />
            <StatCard
              label="Total Waste Collected"
              value={Number(stats.total_kg).toLocaleString()}
              unit="kg"
              icon="box"
              tone="blue"
            />
          </>
        )}
        {user.role === "company" && (
          <>
            <StatCard label="Assignments Received" value={stats.assignments} icon="clip" />
            <StatCard label="Completed" value={stats.completed} icon="box" tone="blue" />
            <StatCard
              label="Total Processed"
              value={Number(stats.processed_kg).toLocaleString()}
              unit="kg"
              icon="chart"
              tone="amber"
            />
          </>
        )}
        {user.role === "admin" && (
          <>
            <StatCard label="Total Collections" value={stats.collections} icon="truck" />
            <StatCard label="Registered Companies" value={stats.companies} icon="build" tone="blue" />
            <StatCard label="System Users" value={stats.users} icon="user" tone="amber" />
          </>
        )}
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
      >
        <h2 className="mb-4 text-base font-semibold text-ink">
          Edit Account Details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={3}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}