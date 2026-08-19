// Location: src/app/api/ai/chat/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOverview, getZoneStats, getCompanyStats, getAlerts } from "@/lib/analytics";
import { askSmartAssistant } from "@/lib/gemini";

export async function POST(request) {
  try {
    const session = await getSession();
    const { message, history = [] } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch live system snapshot from MySQL
    const [overview, zones, companies, alerts] = await Promise.all([
      getOverview(),
      getZoneStats(),
      getCompanyStats(),
      getAlerts(),
    ]);

    const liveContext = {
      currentUserRole: session?.role || "citizen",
      currentUserName: session?.name || "Guest Citizen",
      systemOverview: {
        totalCollectedKg: overview?.total_collected_kg || 0,
        totalProcessedKg: overview?.total_processed_kg || 0,
        carbonSavedKg: overview?.carbon_saved_kg || 0,
        completedJobs: overview?.completed_jobs || 0,
        assignmentRate: overview?.assignment_rate || 0,
      },
      topZones: (zones || []).slice(0, 4),
      recyclingPartners: (companies || []).map((c) => ({
        name: c.name,
        efficiencyScore: c.efficiency_score,
        activeJobs: c.active_jobs,
        processedKg: c.processed_kg,
      })),
      alerts: alerts || [],
    };

    // 2. Try Gemini API first; Fall back to live SQL heuristic generator if API key is missing
    let reply = "";
    try {
      if (process.env.GEMINI_API_KEY) {
        reply = await askSmartAssistant(message, liveContext, history);
      } else {
        throw new Error("No GEMINI_API_KEY found");
      }
    } catch (aiErr) {
      console.warn("Falling back to local intelligent heuristic response:", aiErr.message);

      const lower = message.toLowerCase();
      const topCompany = companies?.[0] || { name: "EcoGreen Ltd", efficiency_score: 94.5 };
      const topZone = zones?.[0] || { zone_name: "Zone 1 (North)", total_waste_kg: 1200 };

      if (lower.includes("summary") || lower.includes("city")) {
        reply = `**W2A City Summary**: A total of **${Number(liveContext.systemOverview.totalCollectedKg).toLocaleString()} kg** of waste has been collected across municipal zones with a **${liveContext.systemOverview.assignmentRate}%** automated allocation rate. We have prevented **${Number(liveContext.systemOverview.carbonSavedKg).toLocaleString()} kg of CO₂** emissions.`;
      } else if (lower.includes("carbon") || lower.includes("co2") || lower.includes("impact")) {
        reply = `**Carbon Impact Analysis**: We have verified **${Number(liveContext.systemOverview.carbonSavedKg).toLocaleString()} kg CO₂** avoided through certified circular conversions. Carbon savings are calculated per material type (e.g. 1.8 kg CO₂ per kg plastic recycled).`;
      } else if (lower.includes("company") || lower.includes("recycler") || lower.includes("efficiency")) {
        reply = `**Top Recycling Partner**: **${topCompany.name}** is currently leading with an efficiency score of **${topCompany.efficiency_score}%** and ${topCompany.active_jobs || 0} active batch assignments.`;
      } else if (lower.includes("hotspot") || lower.includes("zone") || lower.includes("highest")) {
        reply = `**Municipal Hotspot**: **${topZone.zone_name}** has generated the highest volume with **${Number(topZone.total_waste_kg || 0).toLocaleString()} kg** collected.`;
      } else {
        reply = `Hello! I am connected to the live W2A MySQL database. We have collected **${Number(liveContext.systemOverview.totalCollectedKg).toLocaleString()} kg** of waste and saved **${Number(liveContext.systemOverview.carbonSavedKg).toLocaleString()} kg CO₂**. How else can I assist your municipal circular operations?`;
      }
    }

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err) {
    console.error("AI CHAT API ERROR:", err);
    return NextResponse.json(
      { error: "AI Assistant is currently unavailable. Please try again." },
      { status: 500 }
    );
  }
}