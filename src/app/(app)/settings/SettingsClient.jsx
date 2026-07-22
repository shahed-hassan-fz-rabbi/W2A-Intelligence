"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Database, Shield, Clock } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsClient({ role, email }) {
  const { theme, toggle } = useTheme();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Appearance */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-1 text-base font-semibold text-ink">Appearance</h2>
        <p className="mb-4 text-xs text-muted">
          Choose how W2A Intelligence looks on this device
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => theme === "dark" && toggle()}
            className={`flex flex-1 items-center gap-3 rounded-xl border p-4 transition ${
              theme === "light"
                ? "border-brand-500 bg-brand-50"
                : "border-line hover:bg-canvas"
            }`}
          >
            <Sun className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-ink">Light</span>
          </button>
          <button
            onClick={() => theme === "light" && toggle()}
            className={`flex flex-1 items-center gap-3 rounded-xl border p-4 transition ${
              theme === "dark"
                ? "border-brand-500 bg-brand-50"
                : "border-line hover:bg-canvas"
            }`}
          >
            <Moon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-ink">Dark</span>
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">Account</h2>
        <dl className="divide-y divide-line text-sm">
          <div className="flex justify-between py-2.5">
            <dt className="text-muted">Signed in as</dt>
            <dd className="font-medium text-ink">{email}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium text-ink">{role}</dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="flex items-center gap-2 text-muted">
              <Clock className="h-4 w-4" /> Session timeout
            </dt>
            <dd className="font-medium text-ink">30 minutes idle</dd>
          </div>
        </dl>
      </div>

      {/* System */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">System</h2>
        <dl className="divide-y divide-line text-sm">
          <div className="flex items-center justify-between py-2.5">
            <dt className="flex items-center gap-2 text-muted">
              <Database className="h-4 w-4" /> Database
            </dt>
            <dd
              className={`font-medium ${
                health?.ok ? "text-brand-700" : "text-red-600"
              }`}
            >
              {health === null
                ? "Checking…"
                : health.ok
                ? "MySQL connected"
                : "Disconnected"}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="flex items-center gap-2 text-muted">
              <Shield className="h-4 w-4" /> Access control
            </dt>
            <dd className="font-medium text-ink">Role-based (RBAC)</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-muted">Normalization</dt>
            <dd className="font-medium text-ink">Third Normal Form (3NF)</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-muted">Version</dt>
            <dd className="font-medium text-ink">1.0.0 — Academic build</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}