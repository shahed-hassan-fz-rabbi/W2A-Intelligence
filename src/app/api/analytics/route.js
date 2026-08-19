// Location: src/app/api/analytics/route.js
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import {
  getOverview,
  getZoneStats,
  getCompanyStats,
  getCategoryStats,
  getActivityFeed,
  getMonthlyTrend,
} from "@/lib/analytics";

export async function GET(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const [overview, zones, companies, categories, activity, monthly] =
      await Promise.all([
        getOverview(from, to),
        getZoneStats(from, to),
        getCompanyStats(),
        getCategoryStats(from, to),
        getActivityFeed(10),
        getMonthlyTrend(),
      ]);

    // Format numbers explicitly so Recharts can render properly
    const formattedMonthly = (monthly || []).map((m) => ({
      month: m.month,
      collected_kg: Number(m.collected_kg || m.kg || 0),
    }));

    const formattedCategories = (categories || []).map((c) => ({
      category: c.category,
      collected_kg: Number(c.collected_kg || 0),
    }));

    return NextResponse.json({
      overview,
      zones,
      companies,
      categories: formattedCategories,
      activity,
      monthly: formattedMonthly,
    });
  } catch (err) {
    console.error("ANALYTICS API ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}