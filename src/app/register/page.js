"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, Building2, ArrowLeft } from "lucide-react";
import { notify } from "@/lib/toast";

const ROLES = [
  {
    value: "collector",
    label: "Waste Collector",
    desc: "Register waste collection events from your assigned city zone",
    icon: Truck,
  },
  {
    value: "company",
    label: "Company Manager",
    desc: "Update processing status and record generated assets",
    icon: Building2,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState({ zones: [], companies: [] });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "",
    zone_id: "",
    company_id: "",
  });

  useEffect(() => {
    fetch("/api/public/options")
      .then((r) => r.json())
      .then((d) => setOptions(d.error ? { zones: [], companies: [] } : d))
      .catch(() => notify.error("Could not load zones and companies"));
  }, []);

  const zonesByCity = useMemo(
    () =>
      Object.entries(
        options.zones.reduce((acc, z) => {
          (acc[z.city] ||= []).push(z);
          return acc;
        }, {})
      ),
    [options.zones]
  );

  function pickRole(role) {
    setForm({ ...form, role, zone_id: "", company_id: "" });
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirm) {
      notify.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || "Registration failed");
        return;
      }

      notify.success(`Welcome, ${data.name}! Your account is ready.`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      notify.error("Could not reach the server");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white"
          >
            W2A
          </Link>
          <h1 className="text-xl font-bold text-ink">Create an account</h1>
          <p className="mt-1 text-sm text-muted">
            {step === 1
              ? "First, tell us what you do"
              : "Now fill in your details"}
          </p>
        </div>

        {/* Step 1 — role selection */}
        {step === 1 && (
          <div className="space-y-3">
            {ROLES.map((r) => {
              const RoleIcon = r.icon;
              return (
                <button
                  key={r.value}
                  onClick={() => pickRole(r.value)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-line bg-surface p-5 text-left transition hover:border-brand-500 hover:bg-brand-50"
                >
                  <span className="rounded-lg bg-brand-100 p-2.5 text-brand-700">
                    <RoleIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {r.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {r.desc}
                    </span>
                  </span>
                </button>
              );
            })}

            <p className="rounded-lg bg-canvas px-4 py-3 text-xs text-muted">
              Administrator accounts are created by the system administrator and
              cannot be registered here.
            </p>
          </div>
        )}

        {/* Step 2 — details */}
        {step === 2 && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-line bg-surface p-6"
          >
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-4 flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Change role
            </button>

            <div className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
              Registering as {ROLES.find((r) => r.value === form.role)?.label}
            </div>

            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={3}
              placeholder="Rakib Hasan"
              className={`${inputCls} mb-4`}
            />

            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
              className={`${inputCls} mb-4`}
            />

            {form.role === "collector" && (
              <>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Assigned Zone
                </label>
                <select
                  value={form.zone_id}
                  onChange={(e) =>
                    setForm({ ...form, zone_id: e.target.value })
                  }
                  required
                  className={`${inputCls} mb-4`}
                >
                  <option value="">Select your zone</option>
                  {zonesByCity.map(([city, list]) => (
                    <optgroup key={city} label={city}>
                      {list.map((z) => (
                        <option key={z.zone_id} value={z.zone_id}>
                          {z.name} ({z.area_code})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </>
            )}

            {form.role === "company" && (
              <>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Your Company
                </label>
                <select
                  value={form.company_id}
                  onChange={(e) =>
                    setForm({ ...form, company_id: e.target.value })
                  }
                  required
                  className={`${inputCls} mb-4`}
                >
                  <option value="">Select your company</option>
                  {options.companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={`${inputCls} mb-4`}
            />

            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
              placeholder="Re-enter your password"
              className={`${inputCls} mb-5`}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
