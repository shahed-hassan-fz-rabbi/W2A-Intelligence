import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import {
  getOverview,
  getZoneStats,
  getCompanyStats,
  getCategoryStats,
  getActivityFeed,
  getAlerts,
  getDailyTrend,
} from "@/lib/analytics";

export async function GET(request) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || null;
    const to = searchParams.get("to") || null;

    const [overview, zones, companies, categories, activity, alerts, trend] =
      await Promise.all([
        getOverview(from, to),
        getZoneStats(from, to),
        getCompanyStats(),
        getCategoryStats(from, to),
        getActivityFeed(15),
        getAlerts(),
        getDailyTrend(14),
      ]);

    return NextResponse.json({
      overview,
      zones,
      companies,
      categories,
      activity,
      alerts,
      trend,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}