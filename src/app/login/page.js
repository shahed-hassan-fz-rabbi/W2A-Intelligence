"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO = [
  { label: "Admin",     email: "admin@w2a.com",  password: "admin123" },
  { label: "Collector", email: "rakib@w2a.com",  password: "collect123" },
  { label: "Company",   email: "green@w2a.com",  password: "company123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            W2A
          </div>
          <h1 className="text-xl font-bold text-ink">W2A Intelligence</h1>
          <p className="mt-1 text-sm text-muted">
            Smart Waste-to-Assets Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
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
            className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
            className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="••••••••"
          />

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 rounded-xl border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-semibold text-muted">DEMO ACCOUNTS</p>
          <div className="flex flex-wrap gap-2">
            {DEMO.map((d) => (
              <button
                key={d.email}
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                }}
                className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}