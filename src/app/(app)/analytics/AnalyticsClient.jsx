"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import BarRow from "@/components/BarRow";
import StatusBadge from "@/components/StatusBadge";

const CATEGORY_TONE = { Plastic: "blue", Organic: "brand", Metal: "ink" };

export default function AnalyticsClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ from: "", to: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams(
      Object.entries(range).filter(([, v]) => v)
    ).toString();
    const res = await fetch(`/api/analytics?${qs}`);
    const json = await res.json();
    setData(res.ok ? json : null);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const inputCls =
    "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-muted">
        Loading analytics…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-red-600">
        Could not load analytics data.
      </div>
    );
  }

  const { overview, zones, companies, categories, activity, alerts, trend } = data;
  const maxZone = Math.max(...zones.map((z) => Number(z.total_waste_kg)), 1);
  const maxCompany = Math.max(...companies.map((c) => Number(c.processed_kg)), 1);
  const maxCat = Math.max(...categories.map((c) => Number(c.collected_kg)), 1);
  const maxTrend = Math.max(...trend.map((t) => Number(t.collected_kg)), 1);

  return (
    <div className="space-y-6">
      {/* Date range + export */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              From
            </label>
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              To
            </label>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setRange({ from: "", to: "" })}
              className="w-full rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas"
            >
              Reset Range
            </button>
          </div>
          <div className="flex items-end">
            <div className="flex w-full flex-wrap gap-2">
              {["zones", "companies", "categories", "lifecycle"].map((r) => (
                <a
                  key={r}
                  href={`/api/analytics/export?report=${r}`}
                  className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                >
                  CSV: {r}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards — FR-6.1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Waste Collected"
          value={Number(overview.total_collected_kg).toLocaleString()}
          unit="kg"
          icon="truck"
        />
        <StatCard
          label="Assignment Rate"
          value={overview.assignment_rate ?? 0}
          unit="%"
          icon="clip"
          tone="blue"
        />
        <StatCard
          label="Completed Jobs"
          value={overview.completed_jobs ?? 0}
          icon="box"
          tone="amber"
        />
        <StatCard
          label="Carbon Saved"
          value={Number(overview.carbon_saved_kg).toLocaleString()}
          unit="kg CO₂"
          icon="chart"
        />
      </div>

      {/* Alerts — UNION ALL */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-3 text-sm font-semibold text-amber-800">
            System Alerts ({alerts.length})
          </h2>
          <ul className="space-y-1.5">
            {alerts.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900">
                  {a.alert_type}
                </span>
                <span className="text-amber-900">{a.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Zone heatmap — FR-6.2 */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-1 text-base font-semibold text-ink">
            Zone Waste Distribution
          </h2>
          <p className="mb-3 text-xs text-muted">
            Total waste collected per city zone
          </p>
          {zones.map((z) => (
            <BarRow
              key={z.zone_id}
              label={`${z.zone_name} (${z.area_code})`}
              value={Number(z.total_waste_kg)}
              max={maxZone}
              sub={`${z.collection_count} collections · ${z.kg_per_1000} kg per 1000 residents`}
            />
          ))}
        </div>

        {/* Company performance — FR-6.3 */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-1 text-base font-semibold text-ink">
            Company Performance
          </h2>
          <p className="mb-3 text-xs text-muted">
            Total waste processed and completion rate
          </p>
          {companies.map((c) => (
            <BarRow
              key={c.company_id}
              label={c.name}
              value={Number(c.processed_kg)}
              max={maxCompany}
              tone="blue"
              sub={`${c.completed_jobs}/${c.total_assignments} completed (${c.completion_rate}%) · efficiency ${c.efficiency_score}`}
            />
          ))}
        </div>

        {/* Category + carbon — FR-6.4 */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-1 text-base font-semibold text-ink">
            Category Breakdown & Carbon Impact
          </h2>
          <p className="mb-3 text-xs text-muted">
            CO₂ saved = processed quantity × carbon factor
          </p>
          {categories.map((c) => (
            <BarRow
              key={c.category}
              label={c.category}
              value={Number(c.collected_kg)}
              max={maxCat}
              tone={CATEGORY_TONE[c.category] || "brand"}
              sub={`${Number(c.processed_kg).toFixed(0)} kg processed · ${Number(
                c.carbon_saved_kg
              ).toLocaleString()} kg CO₂ saved`}
            />
          ))}
        </div>

        {/* Daily trend */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-1 text-base font-semibold text-ink">
            Collection Trend
          </h2>
          <p className="mb-4 text-xs text-muted">Last 14 days</p>
          {trend.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No collections in this period
            </p>
          ) : (
            <div className="flex h-40 items-end gap-1.5">
              {trend.map((t) => (
                <div
                  key={t.day}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="w-full rounded-t bg-brand-400 transition hover:bg-brand-600"
                    style={{
                      height: `${(Number(t.collected_kg) / maxTrend) * 100}%`,
                    }}
                  />
                  <span className="mt-1 text-[9px] text-muted">
                    {t.day.slice(5)}
                  </span>
                  <span className="absolute -top-6 hidden rounded bg-ink px-2 py-0.5 text-[10px] text-white group-hover:block">
                    {Number(t.collected_kg).toFixed(0)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity feed — UNION */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-1 text-base font-semibold text-ink">
          City Activity Feed
        </h2>
        <p className="mb-4 text-xs text-muted">
          Unified timeline built with a SQL UNION across collections,
          assignments and production
        </p>
        <div className="divide-y divide-line">
          {activity.map((a, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <StatusBadge
                  value={
                    a.event_type === "Collection"
                      ? "Plastic"
                      : a.event_type === "Assignment"
                      ? "Pending"
                      : "Completed"
                  }
                />
                <span className="truncate text-sm text-ink-soft">
                  {a.description}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium text-ink">
                  {Number(a.quantity).toFixed(0)} kg
                </span>
                <span className="text-xs text-muted">
                  {String(a.event_date).slice(0, 10)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}