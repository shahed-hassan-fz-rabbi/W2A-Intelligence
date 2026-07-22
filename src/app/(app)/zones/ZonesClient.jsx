"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { notify, confirmToast } from "@/lib/toast";

const EMPTY = { name: "", area_code: "", population: "" };

export default function ZonesClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/zones");
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
    setEditing(row.zone_id);
    setForm({
      name: row.name,
      area_code: row.area_code,
      population: row.population,
    });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/zones/${editing}` : "/api/zones",
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

  function handleDelete(row) {
    confirmToast(`Delete zone "${row.name}"?`, async () => {
      const res = await fetch(`/api/zones/${row.zone_id}`, { method: "DELETE" });
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
    { key: "name", label: "Zone Name" },
    {
      key: "area_code",
      label: "Area Code",
      render: (r) => (
        <span className="rounded bg-canvas px-2 py-0.5 font-mono text-xs">
          {r.area_code}
        </span>
      ),
    },
    {
      key: "population",
      label: "Population",
      render: (r) => Number(r.population).toLocaleString(),
    },
    { key: "collectors", label: "Collectors" },
    { key: "collections", label: "Collections" },
    {
      key: "total_kg",
      label: "Waste Collected",
      render: (r) => `${Number(r.total_kg).toLocaleString()} kg`,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {loading ? "Loading…" : `${rows.length} zone(s)`}
        </span>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add Zone
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows.map((r) => ({ ...r, id: r.zone_id }))}
        empty="No zones registered yet"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Zone" : "Add New Zone"}
        subtitle="Zones are the geographic units used for collection and analytics"
      >
        <form onSubmit={handleSubmit}>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Zone Name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="e.g. Kandirpar"
            className={`${inputCls} mb-4`}
          />

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Area Code
          </label>
          <input
            value={form.area_code}
            onChange={(e) => setForm({ ...form, area_code: e.target.value })}
            required
            placeholder="e.g. CMP-07"
            className={`${inputCls} mb-4`}
          />

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Population
          </label>
          <input
            type="number"
            min="0"
            value={form.population}
            onChange={(e) => setForm({ ...form, population: e.target.value })}
            required
            placeholder="e.g. 45000"
            className={`${inputCls} mb-5`}
          />

          <div className="flex gap-3">
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
              {saving ? "Saving…" : editing ? "Update Zone" : "Create Zone"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}