// Location: src/app/(app)/analytics/AnalyticsClient.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#d97706", "#0284c7", "#059669", "#dc2626", "#8b5cf6", "#64748b"];

export default function AnalyticsClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await fetch(`/api/analytics?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const overview = data?.overview || {};
  const monthly = Array.isArray(data?.monthly) ? data.monthly : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const companies = Array.isArray(data?.companies) ? data.companies : [];
  const activity = Array.isArray(data?.activity) ? data.activity : [];

  const companyColumns = [
    { key: "name", label: "Company" },
    { key: "efficiency_score", label: "Efficiency", render: (r) => `${r.efficiency_score}%` },
    { key: "completed_jobs", label: "Completed" },
    { key: "active_jobs", label: "Active" },
    { key: "processed_kg", label: "Processed (kg)", render: (r) => Number(r.processed_kg || 0).toLocaleString() },
    { key: "completion_rate", label: "Rate", render: (r) => `${r.completion_rate}%` },
  ];

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <span>From:</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <span>To:</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="button"
          onClick={() => { setFrom(""); setTo(""); }}
          className="text-xs text-muted hover:text-brand-600 underline font-medium ml-auto"
        >
          Reset Dates
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Collected"
          value={Number(overview.total_collected_kg || 0).toLocaleString()}
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
          label="Completed Batches"
          value={overview.completed_jobs ?? 0}
          icon="box"
          tone="amber"
        />
        <StatCard
          label="Carbon Avoided"
          value={Number(overview.carbon_saved_kg || 0).toLocaleString()}
          unit="kg CO₂"
          icon="chart"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend Bar Chart */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h3 className="text-sm font-bold text-ink mb-4">Monthly Collection Volume</h3>
          <div className="h-64 w-full">
            {monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => [`${Number(val).toLocaleString()} kg`, "Collected"]} />
                  <Bar dataKey="collected_kg" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                {loading ? "Loading chart data..." : "No trend data recorded"}
              </div>
            )}
          </div>
        </div>

        {/* Waste Category Pie Chart */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h3 className="text-sm font-bold text-ink mb-4">Waste Category Distribution</h3>
          <div className="h-64 w-full">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="collected_kg"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${Number(val).toLocaleString()} kg`, "Volume"]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                {loading ? "Loading category data..." : "No category data recorded"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Performance Table */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h3 className="text-sm font-bold text-ink mb-3">Certified Recycling Partner Metrics</h3>
        <DataTable
          columns={companyColumns}
          rows={companies.map((c) => ({ ...c, id: c.company_id }))}
          empty="No active recycling companies registered"
        />
      </div>

      {/* Activity Feed */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h3 className="text-sm font-bold text-ink mb-3">Live System Activity Feed</h3>
        <div className="divide-y divide-line">
          {activity.slice(0, 10).map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-xs">
              <span className="text-ink font-medium">{a.description}</span>
              <span className="text-muted">
                {a.event_date ? String(a.event_date).slice(0, 10) : "Recent"}
              </span>
            </div>
          ))}
          {activity.length === 0 && !loading && (
            <p className="py-4 text-center text-xs text-muted">No recent operations logged</p>
          )}
        </div>
      </div>
    </div>
  );
}