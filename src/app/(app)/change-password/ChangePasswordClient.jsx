"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";

export default function ChangePasswordClient() {
  const router = useRouter();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const strength =
    form.next.length === 0
      ? null
      : form.next.length < 6
      ? { label: "Too short", cls: "text-red-600", bar: "w-1/4 bg-red-500" }
      : form.next.length < 10
      ? { label: "Fair", cls: "text-amber-600", bar: "w-2/4 bg-amber-500" }
      : { label: "Strong", cls: "text-brand-700", bar: "w-full bg-brand-500" };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile/password", {
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
      setForm({ current: "", next: "", confirm: "" });
      router.push("/profile");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md rounded-2xl border border-line bg-surface p-5 sm:p-6"
    >
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">
        Current Password
      </label>
      <input
        type="password"
        value={form.current}
        onChange={(e) => setForm({ ...form, current: e.target.value })}
        required
        className={`${inputCls} mb-4`}
      />

      <label className="mb-1.5 block text-sm font-medium text-ink-soft">
        New Password
      </label>
      <input
        type="password"
        value={form.next}
        onChange={(e) => setForm({ ...form, next: e.target.value })}
        required
        minLength={6}
        className={inputCls}
      />
      {strength && (
        <div className="mt-2 mb-4">
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <div className={`h-full rounded-full transition-all ${strength.bar}`} />
          </div>
          <p className={`mt-1 text-xs font-medium ${strength.cls}`}>
            {strength.label}
          </p>
        </div>
      )}
      {!strength && <div className="mb-4" />}

      <label className="mb-1.5 block text-sm font-medium text-ink-soft">
        Confirm New Password
      </label>
      <input
        type="password"
        value={form.confirm}
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        required
        className={`${inputCls} mb-5`}
      />

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}