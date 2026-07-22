"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power, AlertTriangle } from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { notify, confirmToast } from "@/lib/toast";

const CATEGORIES = ["Plastic", "Organic", "Metal"];

const SUGGESTED_OUTPUTS = {
  Plastic: "Construction materials, Plastic pellets, Fiber",
  Organic: "Compost, Fertilizer, Biogas",
  Metal: "Industrial metal, Alloys, Wire",
};

const EMPTY = {
  name: "",
  category: "",
  description: "",
  carbon_factor: "",
  output_products: "",
};

export default function WasteTypesClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/waste-types${showAll ? "?all=1" : ""}`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [showAll]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row.waste_type_id);
    setForm({
      name: row.name,
      category: row.category,
      description: row.description || "",
      carbon_factor: row.carbon_factor,
      output_products: row.output_products || "",
    });
    setOpen(true);
  }

  function pickCategory(cat) {
    setForm((f) => ({
      ...f,
      category: cat,
      output_products: f.output_products || SUGGESTED_OUTPUTS[cat],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/waste-types/${editing}` : "/api/waste-types",
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
    const res = await fetch(`/api/waste-types/${row.waste_type_id}`, {
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
    confirmToast(`Delete waste type "${row.name}"?`, async () => {
      const res = await fetch(`/api/waste-types/${row.waste_type_id}`, {
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

  const orphans = rows.filter((r) => r.capable_companies === 0 && r.is_active);

  const columns = [
    {
      key: "name",
      label: "Waste Type",
      render: (r) => (
        <span>
          <span className="block font-medium text-ink">{r.name}</span>
          {r.description && (
            <span className="block text-xs text-muted">{r.description}</span>
          )}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (r) => <StatusBadge value={r.category} />,
    },
    { key: "output_products", label: "Output Products" },
    {
      key: "carbon_factor",
      label: "Carbon Factor",
      render: (r) => (
        <span className="whitespace-nowrap">{r.carbon_factor} kg CO₂/kg</span>
      ),
    },
    {
      key: "capable_companies",
      label: "Companies",
      render: (r) => (
        <span
          className={
            r.capable_companies === 0
              ? "font-semibold text-red-600"
              : "font-medium text-brand-700"
          }
        >
          {r.capable_companies}
        </span>
      ),
    },
    {
      key: "total_kg",
      label: "Collected",
      render: (r) => `${Number(r.total_kg).toLocaleString()} kg`,
    },
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
            onClick={() => toggleActive(r)}
            className="rounded-md bg-canvas p-1.5 text-ink-soft transition hover:bg-amber-50 hover:text-amber-700"
            aria-label="Toggle"
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

  return (
    <div className="space-y-4">
      {orphans.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            {orphans.length} active waste type(s) have no capable company —
            collections of these types will be flagged Unassigned:{" "}
            <span className="font-medium">
              {orphans.map((o) => o.name).join(", ")}
            </span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Include inactive types
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            {loading ? "Loading…" : `${rows.length} type(s)`}
          </span>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Add Waste Type
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows.map((r) => ({ ...r, id: r.waste_type_id }))}
        empty="No waste types defined"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Waste Type" : "Add Waste Type"}
        subtitle="Carbon factor is used to estimate CO₂ savings in analytics"
      >
        <form onSubmit={handleSubmit}>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="e.g. LDPE Film"
            className={`${inputCls} mb-4`}
          />

          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Category
          </label>
          <div className="mb-4 flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => pickCategory(c)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  form.category === c
                    ? "bg-brand-600 text-white"
                    : "bg-canvas text-ink-soft hover:bg-brand-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Description
          </label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description of the material"
            className={`${inputCls} mb-4`}
          />

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Output Products
          </label>
          <input
            value={form.output_products}
            onChange={(e) =>
              setForm({ ...form, output_products: e.target.value })
            }
            placeholder="Comma separated list"
            className={`${inputCls} mb-4`}
          />

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Carbon Factor (kg CO₂ saved per kg)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={form.carbon_factor}
            onChange={(e) =>
              setForm({ ...form, carbon_factor: e.target.value })
            }
            required
            placeholder="e.g. 2.150"
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
              {saving ? "Saving…" : editing ? "Update" : "Add Type"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}