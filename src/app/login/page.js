// Location: src/app/login/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { ArrowLeft, Shield, Truck, Building2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@w2a.com", password: "Admin@123", icon: Shield },
  { label: "Collector", email: "rakib@w2a.com", password: "collect123", icon: Truck },
  { label: "Company", email: "green@w2a.com", password: "company123", icon: Building2 },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function performLogin(targetEmail, targetPassword) {
    const eMail = targetEmail || email;
    const pWord = targetPassword || password;

    if (!eMail || !pWord) {
      notify.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: eMail, password: pWord }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || "Invalid credentials");
        return;
      }

      notify.success(`Welcome, ${data.name ? data.name.split(" ")[0] : "User"}`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      notify.error("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  function handleDemoFill(demoEmail, demoPassword) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    performLogin(demoEmail, demoPassword);
  }

  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4 relative">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-600 transition-colors bg-surface border border-line px-3.5 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Public Portal
        </Link>
      </div>

      <div className="w-full max-w-sm mt-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-md">
            W2A
          </div>
          <h1 className="text-xl font-bold text-ink">W2A Intelligence</h1>
          <p className="mt-1 text-sm text-muted">
            Smart Waste-to-Assets Management
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            performLogin();
          }}
          className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
        >
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${inputCls} mb-4`}
            placeholder="admin@w2a.com"
          />

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputCls} mb-5`}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 shadow-md"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {/* Quick Demo Credentials Selection */}
          <div className="mt-5 pt-4 border-t border-line">
            <p className="text-[11px] font-semibold text-muted mb-2 text-center uppercase tracking-wider">
              Quick 1-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => handleDemoFill(acc.email, acc.password)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-line hover:border-brand-500 bg-canvas hover:bg-brand-50 text-[11px] font-medium text-ink transition-all shadow-sm active:scale-95"
                  >
                    <IconComponent className="h-4 w-4 mb-1 text-brand-600" />
                    {acc.label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-600 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}