"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { notify, confirmToast } from "@/lib/toast";

const EMPTY = {
  name: "",
  location: "",
  contact_email: "",
  contact_phone: "",
  efficiency_score: "",
  capacity_kg: "",
  waste_types: [],
};

export default function CompaniesClient({ wasteTypes }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/companies");
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
    setEditing(row.company_id);
    setForm({
      name: row.name,
      location: row.location,
      contact_email: row.contact_email || "",
      contact_phone: row.contact_phone || "",
      efficiency_score: row.efficiency_score,
      capacity_kg: row.capacity_kg,
      waste_types: row.capability_ids
        ? row.capability_ids.split(",").map(Number)
        : [],
    });
    setOpen(true);
  }

  function toggleType(id) {
    setForm((f) => ({
      ...f,
      waste_types: f.waste_types.includes(id)
        ? f.waste_types.filter((x) => x !== id)
        : [...f.waste_types, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/companies/${editing}` : "/api/companies",
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

  async function toggleActive(row) {
    const res = await fetch(`/api/companies/${row.company_id}`, {
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
    confirmToast(`Delete "${row.name}" permanently?`, async () => {
      const res = await fetch(`/api/companies/${row.company_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error);
        return;
      }
      notify.success(data.message);
      load();
    });
  }

  const columns = [
    {
      key: "name",
      label: "Company",
      render: (r) => (
        <span>
          <span className="block font-medium text-ink">{r.name}</span>
          <span className="block text-xs text-muted">{r.location}</span>
        </span>
      ),
    },
    { key: "capabilities", label: "Can Process" },
    {
      key: "efficiency_score",
      label: "Efficiency",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${r.efficiency_score}%` }}
            />
          </div>
          <span className="text-xs font-medium">{r.efficiency_score}</span>
        </div>
      ),
    },
    {
      key: "capacity_kg",
      label: "Capacity",
      render: (r) => `${Number(r.capacity_kg).toLocaleString()} kg`,
    },
    {
      key: "active_load",
      label: "Active Load",
      render: (r) => (
        <span
          className={`font-semibold ${
            r.active_load > 2 ? "text-amber-600" : "text-brand-600"
          }`}
        >
          {r.active_load}
        </span>
      ),
    },
    { key: "completed_jobs", label: "Completed" },
    {
      key: "is_active",
      label: "Status",
      render: (r) => (
        <StatusBadge value={r.is_active ? "Completed" : "Failed"} />
      ),
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
            onClick={() => toggleActive(r)}
            className="rounded-md bg-canvas p-1.5 text-ink-soft transition hover:bg-amber-50 hover:text-amber-700"
            aria-label="Toggle active"
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(r)}
            className="rounded-md bg-canvas p-1.5 text-ink-soft transition hover:bg-red-50 hover:text-red-600"
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

  const grouped = wasteTypes.reduce((acc, w) => {
    (acc[w.category] ||= []).push(w);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {loading ? "Loading…" : `${rows.length} company(ies)`}
        </span>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add Company
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows.map((r) => ({ ...r, id: r.company_id }))}
        empty="No companies registered yet"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Company" : "Register New Company"}
        subtitle="Capabilities determine which waste batches the allocation engine can assign"
        wide
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Company Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. GreenCycle Ltd"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                placeholder="e.g. Comilla Industrial Area"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Contact Email
              </label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) =>
                  setForm({ ...form, contact_email: e.target.value })
                }
                placeholder="info@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Contact Phone
              </label>
              <input
                value={form.contact_phone}
                onChange={(e) =>
                  setForm({ ...form, contact_phone: e.target.value })
                }
                placeholder="01700000000"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Efficiency Score (0–100)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.efficiency_score}
                onChange={(e) =>
                  setForm({ ...form, efficiency_score: e.target.value })
                }
                required
                placeholder="85.50"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Capacity (kg)
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity_kg}
                onChange={(e) =>
                  setForm({ ...form, capacity_kg: e.target.value })
                }
                required
                placeholder="5000"
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-ink-soft">
              Processing Capabilities
            </label>
            <div className="space-y-3 rounded-xl border border-line p-4">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <p className="mb-1.5 text-xs font-semibold text-muted uppercase">
                    {cat}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((w) => (
                      <button
                        key={w.waste_type_id}
                        type="button"
                        onClick={() => toggleType(w.waste_type_id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          form.waste_types.includes(w.waste_type_id)
                            ? "bg-brand-600 text-white"
                            : "bg-canvas text-ink-soft hover:bg-brand-50"
                        }`}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {form.waste_types.length} type(s) selected
            </p>
          </div>

          <div className="mt-5 flex gap-3">
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
              {saving ? "Saving…" : editing ? "Update Company" : "Register"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}