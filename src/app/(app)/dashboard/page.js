import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { getSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/roles";
import { getOverview, getActivityFeed, getAlerts } from "@/lib/analytics";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const isAdmin = session.role === "admin";

  const overview = await getOverview(null, null);
  const activity = await getActivityFeed(8);
  const alerts = isAdmin ? await getAlerts() : [];

  const recent = await query(
    `SELECT a.assignment_id, a.status,
            z.name AS zone_name, wt.name AS waste_type,
            wc.quantity_kg, c.name AS company_name
     FROM Assignment a
     JOIN WasteCollection wc ON a.collection_id = wc.collection_id
     JOIN Zone z             ON wc.zone_id = z.zone_id
     JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
     LEFT JOIN Company c     ON a.company_id = c.company_id
     ORDER BY a.assignment_id DESC
     LIMIT 6`
  );

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.name.split(" ")[0]}`}
        subtitle={`Signed in as ${ROLE_LABEL[session.role]}`}
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Waste"
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

        {alerts.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-amber-800">
              Attention Required
            </h2>
            <ul className="space-y-1.5">
              {alerts.slice(0, 4).map((a, i) => (
                <li key={i} className="text-sm text-amber-900">
                  <span className="font-medium">{a.alert_type}:</span> {a.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">
                Recent Assignments
              </h2>
              <Link
                href="/assignments"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-line">
              {recent.map((r) => (
                <div
                  key={r.assignment_id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.waste_type} · {r.zone_name}
                    </p>
                    <p className="text-xs text-muted">
                      {r.company_name || "Unassigned"} ·{" "}
                      {Number(r.quantity_kg).toFixed(0)} kg
                    </p>
                  </div>
                  <StatusBadge value={r.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-ink">
              Latest Activity
            </h2>
            <div className="divide-y divide-line">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="truncate text-sm text-ink-soft">
                    {a.description}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {String(a.event_date).slice(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}