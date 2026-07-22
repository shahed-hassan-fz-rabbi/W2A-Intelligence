"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power, KeyRound } from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { ROLE_LABEL } from "@/lib/roles";
import { notify, confirmToast } from "@/lib/toast";

const ROLES = ["admin", "collector", "company"];

const EMPTY = {
  name: "",
  email: "",
  password: "",
  role: "",
  zone_id: "",
  company_id: "",
};

export default function UsersClient({ zones, companies, currentUserId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [pwUser, setPwUser] = useState(null);
  const [newPw, setNewPw] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row.user_id);
    setForm({
      name: row.name,
      email: row.email,
      password: "",
      role: row.role,
      zone_id: row.zone_id || "",
      company_id: row.company_id || "",
    });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/users/${editing}` : "/api/users",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error);
        return;
      }
      notify.success(data.message);
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    const res = await fetch(`/api/users/${pwUser.user_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPw }),
    });
    const data = await res.json();
    if (!res.ok) {
      notify.error(data.error);
      return;
    }
    notify.success(`Password reset for ${pwUser.name}`);
    setPwUser(null);
    setNewPw("");
  }

  async function toggleActive(row) {
    const res = await fetch(`/api/users/${row.user_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !row.is_active }),
    });
    const data = await res.json();
    if (!res.ok) {
      notify.error(data.error);
      return;
    }
    notify.success(data.message);
    load();
  }

  function handleDelete(row) {
    confirmToast(`Delete account "${row.name}"?`, async () => {
      const res = await fetch(`/api/users/${row.user_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error);
        return;
      }
      notify.success(data.message);
      load();
    });
  }

  const visible = filter ? rows.filter((r) => r.role === filter) : rows;
  const counts = {
    admin: rows.filter((r) => r.role === "admin").length,
    collector: rows.filter((r) => r.role === "collector").length,
    company: rows.filter((r) => r.role === "company").length,
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (r) => (
        <span>
          <span className="block font-medium text-ink">
            {r.name}
            {r.user_id === currentUserId && (
              <span className="ml-1.5 text-[10px] text-brand-600">you</span>
            )}
          </span>
          <span className="block text-xs text-muted">{r.email}</span>
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <span className="whitespace-nowrap text-xs font-medium">
          {ROLE_LABEL[r.role]}
        </span>
      ),
    },
    {
      key: "assigned",
      label: "Assigned To",
      render: (r) => r.zone_name || r.company_name || "—",
    },
    { key: "collections", label: "Collections" },
    { key: "joined", label: "Joined" },
    {
      key: "is_active",
      label: "Status",
      render: (r) => <StatusBadge value={r.is_active ? "Completed" : "Failed"} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex justify-end gap-2 md:justify-start">
          <button
            onClick={() => openEdit(r)}
            className="rounded-md bg-canvas p-1.5 text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPwUser(r)}
            className="rounded-md bg-canvas p-1.5 text-ink-soft transition hover:bg-blue-50 hover:text-blue-700"
            aria-label="Reset password"
          >
            <KeyRound className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => toggleActive(r)}
            disabled={r.user_id === currentUserId}
            className="rounded-md bg-canvas p-1.5 text-ink-soft transition hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30"
            aria-label="Toggle"
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(r)}
            disabled={r.user_id === currentUserId}
            className="rounded-md bg-canvas p-1.5 text-ink-soft transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Administrators" value={counts.admin} icon="user" />
        <StatCard label="Collectors" value={counts.collector} icon="truck" tone="blue" />
        <StatCard label="Company Managers" value={counts.company} icon="build" tone="amber" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === ""
                ? "bg-brand-600 text-white"
                : "bg-canvas text-ink-soft hover:bg-brand-50"
            }`}
          >
            All ({rows.length})
          </button>
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === r
                  ? "bg-brand-600 text-white"
                  : "bg-canvas text-ink-soft hover:bg-brand-50"
              }`}
            >
              {ROLE_LABEL[r]} ({counts[r]})
            </button>
          ))}
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={visible.map((r) => ({ ...r, id: r.user_id }))}
        empty={loading ? "Loading…" : "No users found"}
      />

      {/* Add / edit modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit User" : "Add New User"}
        subtitle="Administrators can create accounts for any role"
      >
        <form onSubmit={handleSubmit}>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Full Name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={3}
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
            className={`${inputCls} mb-4`}
          />

          {!editing && (
            <>
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
            </>
          )}

          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Role
          </label>
          <div className="mb-4 flex gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setForm({ ...form, role: r, zone_id: "", company_id: "" })
                }
                className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition ${
                  form.role === r
                    ? "bg-brand-600 text-white"
                    : "bg-canvas text-ink-soft hover:bg-brand-50"
                }`}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>

          {form.role === "collector" && (
            <>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Assigned Zone
              </label>
              <select
                value={form.zone_id}
                onChange={(e) => setForm({ ...form, zone_id: e.target.value })}
                required
                className={`${inputCls} mb-4`}
              >
                <option value="">Select zone</option>
                {zones.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.name} ({z.area_code})
                  </option>
                ))}
              </select>
            </>
          )}

          {form.role === "company" && (
            <>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Company
              </label>
              <select
                value={form.company_id}
                onChange={(e) =>
                  setForm({ ...form, company_id: e.target.value })
                }
                required
                className={`${inputCls} mb-4`}
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-line py-2.5 text-sm font-medium text-ink-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Password reset modal */}
      <Modal
        open={!!pwUser}
        onClose={() => {
          setPwUser(null);
          setNewPw("");
        }}
        title="Reset Password"
        subtitle={pwUser ? `Setting a new password for ${pwUser.name}` : ""}
      >
        <form onSubmit={submitPassword}>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            New Password
          </label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
            className={`${inputCls} mb-5`}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setPwUser(null);
                setNewPw("");
              }}
              className="flex-1 rounded-lg border border-line py-2.5 text-sm font-medium text-ink-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white"
            >
              Reset Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}