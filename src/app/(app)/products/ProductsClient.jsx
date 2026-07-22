"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { PRODUCT_SUGGESTIONS, UNITS } from "@/lib/products";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ProductsClient({ summary, role }) {
  const [rows, setRows] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    assignment_id: "",
    product_name: "",
    quantity_produced: "",
    unit: "kg",
    production_date: todayStr(),
  });

  const load = useCallback(async () => {
    setLoading(true);
    const qs = category ? `?category=${category}` : "";
    const [pRes, cRes] = await Promise.all([
      fetch(`/api/products${qs}`),
      fetch("/api/assignments/completed"),
    ]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    setRows(Array.isArray(pData) ? pData : []);
    setCompleted(Array.isArray(cData) ? cData : []);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedAsg = completed.find(
    (c) => String(c.assignment_id) === String(form.assignment_id)
  );
  const suggestions = selectedAsg
    ? PRODUCT_SUGGESTIONS[selectedAsg.category] || []
    : [];

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error });
        return;
      }
      setMsg({ type: "success", text: data.message });
      setForm({
        assignment_id: "",
        product_name: "",
        quantity_produced: "",
        unit: "kg",
        production_date: todayStr(),
      });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product record permanently?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  const columns = [
    { key: "product_name", label: "Product" },
    {
      key: "quantity_produced",
      label: "Produced",
      render: (r) => `${Number(r.quantity_produced).toFixed(2)} ${r.unit}`,
    },
    { key: "waste_type", label: "Source Waste" },
    {
      key: "category",
      label: "Category",
      render: (r) => <StatusBadge value={r.category} />,
    },
    { key: "zone_name", label: "Origin Zone" },
    { key: "company_name", label: "Processed By" },
    {
      key: "conversion_ratio",
      label: "Conversion",
      render: (r) => (
        <span className="font-medium text-brand-700">
          {r.conversion_ratio}%
        </span>
      ),
    },
    { key: "production_date", label: "Date" },
    ...(role === "admin"
      ? [
          {
            key: "actions",
            label: "Action",
            render: (r) => (
              <button
                onClick={() => handleDelete(r.product_id)}
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
    "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={summary.total_products} icon="box" />
        <StatCard label="Total Output" value={Number(summary.total_kg).toFixed(0)} unit="kg" icon="build" tone="blue" />
        <StatCard label="Batches Converted" value={summary.batches} icon="clip" tone="amber" />
        <StatCard label="Avg Conversion" value={summary.avg_ratio} unit="%" icon="chart" />
      </div>

      {/* Entry form */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">
          Record Generated Asset
        </h2>

        {completed.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
            No completed assignments available. Complete a batch on the
            Assignments page first.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Completed Assignment
                </label>
                <select
                  value={form.assignment_id}
                  onChange={(e) =>
                    setForm({ ...form, assignment_id: e.target.value, product_name: "" })
                  }
                  required
                  className={inputCls}
                >
                  <option value="">Select assignment</option>
                  {completed.map((c) => (
                    <option key={c.assignment_id} value={c.assignment_id}>
                      #{c.assignment_id} · {c.waste_type} · {c.zone_name} ·{" "}
                      {Number(c.processed_qty ?? c.quantity_kg).toFixed(0)} kg
                      {c.product_count > 0 ? ` (${c.product_count} recorded)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Production Date
                </label>
                <input
                  type="date"
                  max={todayStr()}
                  value={form.production_date}
                  onChange={(e) =>
                    setForm({ ...form, production_date: e.target.value })
                  }
                  required
                  className={inputCls}
                />
              </div>

              <div className="lg:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Product Name
                </label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={(e) =>
                    setForm({ ...form, product_name: e.target.value })
                  }
                  required
                  placeholder="e.g. Plastic Pellets"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Quantity Produced
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.quantity_produced}
                  onChange={(e) =>
                    setForm({ ...form, quantity_produced: e.target.value })
                  }
                  required
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className={inputCls}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted">
                  SUGGESTED FOR {selectedAsg.category.toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, product_name: s })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        form.product_name === s
                          ? "bg-brand-600 text-white"
                          : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msg && (
              <p
                className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                  msg.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-brand-50 text-brand-700"
                }`}
              >
                {msg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-4 w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Saving…" : "Record Asset"}
            </button>
          </form>
        )}
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            <option value="">All categories</option>
            <option value="Plastic">Plastic</option>
            <option value="Organic">Organic</option>
            <option value="Metal">Metal</option>
          </select>
          <button
            onClick={() => setCategory("")}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-canvas sm:col-start-3"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">
            Generated Assets
          </h2>
          <span className="text-sm text-muted">
            {loading ? "Loading…" : `${rows.length} record(s)`}
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={rows.map((r) => ({ ...r, id: r.product_id }))}
          empty="No products recorded yet"
        />
      </div>
    </div>
  );
}