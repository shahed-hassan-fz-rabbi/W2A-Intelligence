"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Pencil, Trash2, MapPin, Globe } from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { notify, confirmToast } from "@/lib/toast";
import { COUNTRIES, BD_CITIES, suggestAreaPrefix } from "@/lib/locations";

const EMPTY = {
  name: "",
  city: "",
  district: "",
  country: "Bangladesh",
  area_code: "",
  population: "",
  latitude: "",
  longitude: "",
};

export default function ZonesClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
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

  // Cities already present in the database, for the filter chips
  const cities = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => map.set(r.city, (map.get(r.city) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const visible = cityFilter ? rows.filter((r) => r.city === cityFilter) : rows;

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row.zone_id);
    setForm({
      name: row.name,
      city: row.city,
      district: row.district || "",
      country: row.country,
      area_code: row.area_code,
      population: row.population,
      latitude: row.latitude ?? "",
      longitude: row.longitude ?? "",
    });
    setOpen(true);
  }

  function pickCity(entry) {
    setForm((f) => ({
      ...f,
      city: entry.city,
      district: entry.district,
      country: "Bangladesh",
      area_code:
        f.area_code || `${suggestAreaPrefix(entry.city)}-`,
    }));
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
    confirmToast(`Delete zone "${row.name}, ${row.city}"?`, async () => {
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
    {
      key: "name",
      label: "Zone",
      render: (r) => (
        <span>
          <span className="block font-medium text-ink">{r.name}</span>
          <span className="block text-xs text-muted">
            {r.city}
            {r.district && r.district !== r.city ? `, ${r.district}` : ""} ·{" "}
            {r.country}
          </span>
        </span>
      ),
    },
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
    {
      key: "coords",
      label: "Coordinates",
      render: (r) =>
        r.latitude != null && r.longitude != null ? (
          <span className="font-mono text-xs text-muted">
            {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
          </span>
        ) : (
          <span className="text-xs text-muted">—</span>
        ),
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
      {/* City filter */}
      {cities.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCityFilter("")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              cityFilter === ""
                ? "bg-brand-600 text-white"
                : "bg-canvas text-ink-soft hover:bg-brand-50"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            All cities ({rows.length})
          </button>
          {cities.map(([c, n]) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                cityFilter === c
                  ? "bg-brand-600 text-white"
                  : "bg-canvas text-ink-soft hover:bg-brand-50"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              {c} ({n})
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {loading ? "Loading…" : `${visible.length} zone(s)`}
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
        rows={visible.map((r) => ({ ...r, id: r.zone_id }))}
        empty="No zones registered yet"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Zone" : "Add New Zone"}
        subtitle="Zones can belong to any city or country — the system is location independent"
        wide
      >
        <form onSubmit={handleSubmit}>
          {/* Quick city picker */}
          {!editing && (
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium text-muted">
                QUICK PICK — BANGLADESH
              </p>
              <div className="flex flex-wrap gap-2">
                {BD_CITIES.map((c) => (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => pickCity(c)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      form.city === c.city
                        ? "bg-brand-600 text-white"
                        : "bg-canvas text-ink-soft hover:bg-brand-50"
                    }`}
                  >
                    {c.city}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                Not listed? Just type any city name below.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Zone / Area Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Gulshan"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                City
              </label>
              <input
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                    area_code:
                      form.area_code ||
                      `${suggestAreaPrefix(e.target.value)}-`,
                  })
                }
                required
                placeholder="e.g. Dhaka"
                list="city-list"
                className={inputCls}
              />
              <datalist id="city-list">
                {BD_CITIES.map((c) => (
                  <option key={c.city} value={c.city} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                District / State{" "}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="e.g. Dhaka"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Country
              </label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
                list="country-list"
                className={inputCls}
              />
              <datalist id="country-list">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Area Code
              </label>
              <input
                value={form.area_code}
                onChange={(e) =>
                  setForm({ ...form, area_code: e.target.value })
                }
                required
                placeholder="e.g. DHK-01"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-muted">
                Must be unique within the city
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Population
              </label>
              <input
                type="number"
                min="0"
                value={form.population}
                onChange={(e) =>
                  setForm({ ...form, population: e.target.value })
                }
                required
                placeholder="e.g. 45000"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Latitude{" "}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                type="number"
                step="0.0000001"
                min="-90"
                max="90"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="23.7808875"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Longitude{" "}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                type="number"
                step="0.0000001"
                min="-180"
                max="180"
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                placeholder="90.2792371"
                className={inputCls}
              />
            </div>
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
              {saving ? "Saving…" : editing ? "Update Zone" : "Create Zone"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}