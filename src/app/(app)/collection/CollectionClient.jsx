"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { notify, confirmToast } from "@/lib/toast";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function CollectionClient({ zones, wasteTypes, role }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ zone: "", type: "", from: "", to: "" });

  const [form, setForm] = useState({
    zone_id: "",
    waste_type_id: "",
    quantity_kg: "",
    collection_date: todayStr(),
  });
  const [saving, setSaving] = useState(false);

  // Group zones by city so the dropdowns stay readable across many cities
  const zonesByCity = useMemo(
    () =>
      Object.entries(
        zones.reduce((acc, z) => {
          (acc[z.city] ||= []).push(z);
          return acc;
        }, {})
      ),
    [zones]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    const res = await fetch(`/api/collections?${qs}`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error);
        return;
      }
      notify.success(data.message);
      setForm({
        zone_id: "",
        waste_type_id: "",
        quantity_kg: "",
        collection_date: todayStr(),
      });
      load();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(row) {
    confirmToast("Delete this collection record permanently?", async () => {
      const res = await fetch(`/api/collections/${row.collection_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error || "Could not delete record");
        return;
      }
      notify.success("Record deleted");
      load();
    });
  }

  const columns = [
    { key: "collection_id", label: "ID", render: (r) => `#${r.collection_id}` },
    { key: "zone_name", label: "Zone" },
    { key: "waste_type", label: "Waste Type" },
    {
      key: "category",
      label: "Category",
      render: (r) => <StatusBadge value={r.category} />,
    },
    {
      key: "quantity_kg",
      label: "Quantity",
      render: (r) => `${Number(r.quantity_kg).toFixed(2)} kg`,
    },
    { key: "collection_date", label: "Date" },
    { key: "collector_name", label: "Collector" },
    {
      key: "assignment_status",
      label: "Status",
      render: (r) => <StatusBadge value={r.assignment_status || "Unassigned"} />,
    },
    ...(role === "admin"
      ? [
          {
            key: "actions",
            label: "Action",
            render: (r) => (
              <button
                onClick={() => handleDelete(r)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Delete
              </button>
            ),
          },
        ]
      : []),
  ];

  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-6">
      {/* Entry form */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">
          New Collection Entry
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Zone
              </label>
              <select
                value={form.zone_id}
                onChange={(e) => setForm({ ...form, zone_id: e.target.value })}
                required
                className={inputCls}
              >
                <option value="">Select zone</option>
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
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Waste Type
              </label>
              <select
                value={form.waste_type_id}
                onChange={(e) =>
                  setForm({ ...form, waste_type_id: e.target.value })
                }
                required
                className={inputCls}
              >
                <option value="">Select type</option>
                {wasteTypes.map((w) => (
                  <option key={w.waste_type_id} value={w.waste_type_id}>
                    {w.name} — {w.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Quantity (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.quantity_kg}
                onChange={(e) =>
                  setForm({ ...form, quantity_kg: e.target.value })
                }
                required
                placeholder="0.00"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Collection Date
              </label>
              <input
                type="date"
                max={todayStr()}
                value={form.collection_date}
                onChange={(e) =>
                  setForm({ ...form, collection_date: e.target.value })
                }
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
            {saving ? "Saving…" : "Register Collection"}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={filters.zone}
            onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            className={inputCls}
          >
            <option value="">All zones</option>
            {zonesByCity.map(([city, list]) => (
              <optgroup key={city} label={city}>
                {list.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className={inputCls}
          >
            <option value="">All waste types</option>
            {wasteTypes.map((w) => (
              <option key={w.waste_type_id} value={w.waste_type_id}>
                {w.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className={inputCls}
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className={inputCls}
          />

          <button
            onClick={() => setFilters({ zone: "", type: "", from: "", to: "" })}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-canvas"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">
            Collection Records
          </h2>
          <span className="text-sm text-muted">
            {loading ? "Loading…" : `${rows.length} record(s)`}
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={rows.map((r) => ({ ...r, id: r.collection_id }))}
          empty="No collection records match the current filters"
        />
      </div>
    </div>
  );
}