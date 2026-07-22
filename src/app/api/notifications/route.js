import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const rows = await query(
      `SELECT 'Unassigned' AS type, 'alert' AS tone,
              CONCAT('Collection #', wc.collection_id, ' (', wt.name,
                     ') has no eligible company') AS message,
              a.assigned_date AS at_time,
              '/assignments' AS href
       FROM Assignment a
       JOIN WasteCollection wc ON a.collection_id = wc.collection_id
       JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
       WHERE a.status = 'Unassigned'

       UNION ALL

       SELECT 'Pending', 'info',
              CONCAT('Batch #', a.assignment_id, ' awaiting pickup by ',
                     COALESCE(c.name, 'unknown')),
              a.assigned_date,
              '/assignments'
       FROM Assignment a
       LEFT JOIN Company c ON a.company_id = c.company_id
       WHERE a.status = 'Pending'

       UNION ALL

       SELECT 'Completed', 'success',
              CONCAT('Batch #', a.assignment_id, ' completed by ',
                     COALESCE(c.name, 'unknown')),
              a.end_time,
              '/products'
       FROM Assignment a
       LEFT JOIN Company c ON a.company_id = c.company_id
       WHERE a.status = 'Completed' AND a.end_time IS NOT NULL

       ORDER BY at_time DESC
       LIMIT 10`
    );

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}