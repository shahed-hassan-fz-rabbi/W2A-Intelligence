// Location: src/components/CompanyDashboardView.jsx
"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Award, DollarSign, TrendingUp, ShieldCheck, Factory, Leaf } from "lucide-react";

export default function CompanyDashboardView({ session }) {
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancials() {
      try {
        const res = await fetch("/api/finance/revenue");
        const data = await res.json();
        if (res.ok) setFinancials(data);
      } catch (e) {
        console.error("Failed to load company metrics:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchFinancials();
  }, []);

  const overview = financials?.overview || {};
  const transactions = financials?.transactions || [];

  const txColumns = [
    { key: "transaction_id", label: "TX ID", render: (r) => `#TX-${r.transaction_id}` },
    { key: "waste_type", label: "Procured Material" },
    { key: "quantity_kg", label: "Volume (kg)", render: (r) => `${Number(r.quantity_kg).toLocaleString()} kg` },
    { key: "rate_per_kg", label: "Rate (BDT)", render: (r) => `৳${r.rate_per_kg}/kg` },
    { key: "gross_amount", label: "Total Paid", render: (r) => `৳${Number(r.gross_amount).toLocaleString()}` },
    { key: "payment_status", label: "Status", render: (r) => <StatusBadge value={r.payment_status} /> },
    { key: "transaction_date", label: "Settled Date" },
  ];

  return (
    <div className="space-y-6">
      {/* Green Tier Badge Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white border border-emerald-900/50 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">{session?.name || "Recycling Partner"}</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                  Gold Certified Partner
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Verified Municipal Circular Economy Processor · ESG Tier-1 Leader
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Green Score</p>
              <p className="text-xl font-extrabold text-emerald-400 leading-tight">94.5 / 100</p>
            </div>
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Financial & Material Procurement KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Material Procured"
          value={Number(overview.total_monetized_kg || 0).toLocaleString()}
          unit="kg"
          icon="box"
        />
        <StatCard
          label="Total Spent (BDT)"
          value={`৳${Number(overview.total_gross_volume || 0).toLocaleString()}`}
          icon="clip"
          tone="blue"
        />
        <StatCard
          label="Platform Fee (7.5%)"
          value={`৳${Number(overview.total_platform_revenue || 0).toLocaleString()}`}
          icon="build"
          tone="amber"
        />
        <StatCard
          label="Settled Batches"
          value={overview.total_transactions || 0}
          icon="truck"
        />
      </div>

      {/* Transaction History Table */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-ink">B2B Material Procurement Transactions</h3>
            <p className="text-xs text-muted">Transparent ledger of acquired municipal waste loads</p>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-3 py-1 rounded-lg">
            Automated Settlement Active
          </span>
        </div>
        <DataTable
          columns={txColumns}
          rows={transactions.map((t) => ({ ...t, id: t.transaction_id }))}
          empty="No material procurement transactions logged yet"
        />
      </div>
    </div>
  );
}