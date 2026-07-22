import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const wasteType = searchParams.get("waste_type");

    // Only companies capable of a given waste type (for the override dropdown)
    if (wasteType) {
      const rows = await query(
        `SELECT c.company_id, c.name, c.efficiency_score,
                COUNT(a.assignment_id) AS active_load
         FROM Company c
         JOIN CompanyWasteType cwt ON c.company_id = cwt.company_id
         LEFT JOIN Assignment a ON c.company_id = a.company_id
              AND a.status IN ('Pending','In Progress')
         WHERE cwt.waste_type_id = ? AND c.is_active = TRUE
         GROUP BY c.company_id, c.name, c.efficiency_score
         ORDER BY active_load ASC, c.efficiency_score DESC`,
        [wasteType]
      );
      return NextResponse.json(rows);
    }

    // Full company list with capabilities and live workload
    const rows = await query(
      `SELECT c.company_id, c.name, c.location, c.contact_email, c.contact_phone,
              c.efficiency_score, c.capacity_kg, c.is_active,
              GROUP_CONCAT(DISTINCT wt.name ORDER BY wt.name SEPARATOR ', ')
                AS capabilities,
              (SELECT COUNT(*) FROM Assignment a
               WHERE a.company_id = c.company_id
                 AND a.status IN ('Pending','In Progress')) AS active_load
       FROM Company c
       LEFT JOIN CompanyWasteType cwt ON c.company_id = cwt.company_id
       LEFT JOIN WasteType wt ON cwt.waste_type_id = wt.waste_type_id
       GROUP BY c.company_id
       ORDER BY c.efficiency_score DESC`
    );
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}