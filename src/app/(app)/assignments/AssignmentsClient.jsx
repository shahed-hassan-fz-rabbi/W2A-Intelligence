"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const STATUSES = ["Unassigned", "Pending", "In Progress", "Completed", "Failed"];

export default function AssignmentsClient({ companies, role }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", company: "" });
  const [msg, setMsg] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [override, setOverride] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    const res = await fetch(`/api/assignments?${qs}`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(id, body, okText) {
    setMsg(null);
    const res = await fetch(`/api/assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ type: "error", text: data.error });
      return false;
    }
    setMsg({ type: "success", text: okText || data.message });
    load();
    return true;
  }

  function handleStart(row) {
    patch(row.assignment_id, { status: "In Progress" });
  }

  function handleComplete(row) {
    const input = prompt(
      `Processed quantity in kg (collected: ${row.quantity_kg} kg)`,
      row.quantity_kg
    );
    if (input === null) return;
    patch(row.assignment_id, {
      status: "Completed",
      processed_qty: Number(input),
    });
  }

  async function showRanking(row) {
    const res = await fetch(`/api/assignments/${row.assignment_id}/ranking`);
    const data = await res.json();
    if (res.ok) setRanking({ ...data, assignment_id: row.assignment_id });
  }

  async function openOverride(row) {
    const res = await fetch(`/api/companies?waste_type=${row.waste_type_id}`);
    const eligible = await res.json();
    setOverride({ row, eligible, selected: "" });
  }

  async function submitOverride() {
    if (!override?.selected) return;
    const ok = await patch(override.row.assignment_id, {
      company_id: Number(override.selected),
    });
    if (ok) setOverride(null);
  }

  const columns = [
    {
      key: "assignment_id",
      label: "ID",
      render: (r) => (
        <span className="font-medium">
          #{r.assignment_id}
          {r.is_manual ? (
            <span className="ml-1 text-[10px] text-amber-600">manual</span>
          ) : null}
        </span>
      ),
    },
    { key: "zone_name", label: "Zone" },
    { key: "waste_type", label: "Waste Type" },
    {
      key: "quantity_kg",
      label: "Quantity",
      render: (r) => `${Number(r.quantity_kg).toFixed(2)} kg`,
    },
    {
      key: "company_name",
      label: "Assigned Company",
      render: (r) =>
        r.company_name ? (
          <span>
            {r.company_name}
            <span className="ml-1 text-xs text-muted">
              ({r.efficiency_score})
            </span>
          </span>
        ) : (
          <span className="text-red-600">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge value={r.status} />,
    },
    { key: "collection_date", label: "Collected" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap justify-end gap-2 md:justify-start">
          {r.status === "Pending" && (
            <button
              onClick={() => handleStart(r)}
              className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Start
            </button>
          )}
          {r.status === "In Progress" && (
            <button
              onClick={() => handleComplete(r)}
              className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
            >
              Complete
            </button>
          )}
          {role === "admin" && (
            <>
              <button
                onClick={() => showRanking(r)}
                className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-gray-200"
              >
                Why?
              </button>
              {r.status !== "Completed" && (
                <button
                  onClick={() => openOverride(r)}
                  className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                >
                  Override
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const inputCls =
    "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={inputCls}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            className={inputCls}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.company_id} value={c.company_id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ status: "", company: "" })}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-canvas"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {msg && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            msg.type === "error"
              ? "bg-red-50 text-red-600"
              : "bg-brand-50 text-brand-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Assignments</h2>
          <span className="text-sm text-muted">
            {loading ? "Loading…" : `${rows.length} record(s)`}
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={rows.map((r) => ({ ...r, id: r.assignment_id }))}
          empty="No assignments found"
        />
      </div>

      {/* Ranking modal — allocation transparency */}
      {ranking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6">
            <h3 className="text-base font-semibold text-ink">
              Allocation Ranking — {ranking.waste_type}
            </h3>
            <p className="mt-1 mb-4 text-sm text-muted">
              Ordered by active load (ascending), then efficiency (descending)
            </p>

            <div className="space-y-2">
              {ranking.ranking.map((c, i) => (
                <div
                  key={c.company_id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                    c.company_id === ranking.assigned_company_id
                      ? "border-brand-500 bg-brand-50"
                      : "border-line"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-ink">{c.name}</p>
                      <p className="text-xs text-muted">
                        Load: {c.active_load} · Efficiency: {c.efficiency_score}
                      </p>
                    </div>
                  </div>
                  {c.company_id === ranking.assigned_company_id && (
                    <StatusBadge value="Completed" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setRanking(null)}
              className="mt-5 w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Manual override modal */}
      {override && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6">
            <h3 className="text-base font-semibold text-ink">
              Manual Override — Assignment #{override.row.assignment_id}
            </h3>
            <p className="mt-1 mb-4 text-sm text-muted">
              Only companies capable of processing {override.row.waste_type} are
              listed.
            </p>

            <select
              value={override.selected}
              onChange={(e) =>
                setOverride({ ...override, selected: e.target.value })
              }
              className={inputCls}
            >
              <option value="">Select company</option>
              {override.eligible.map((c) => (
                <option key={c.company_id} value={c.company_id}>
                  {c.name} — load {c.active_load}, eff {c.efficiency_score}
                </option>
              ))}
            </select>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setOverride(null)}
                className="flex-1 rounded-lg border border-line py-2.5 text-sm font-medium text-ink-soft"
              >
                Cancel
              </button>
              <button
                onClick={submitOverride}
                disabled={!override.selected}
                className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}