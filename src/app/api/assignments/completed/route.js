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
      `SELECT a.assignment_id, a.processed_qty,
              wc.quantity_kg, z.name AS zone_name,
              wt.name AS waste_type, wt.category,
              c.name AS company_name,
              (SELECT COUNT(*) FROM Product p
               WHERE p.assignment_id = a.assignment_id) AS product_count
       FROM Assignment a
       JOIN WasteCollection wc ON a.collection_id = wc.collection_id
       JOIN Zone z             ON wc.zone_id = z.zone_id
       JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
       LEFT JOIN Company c     ON a.company_id = c.company_id
       WHERE a.status = 'Completed'
       ORDER BY a.end_time DESC`
    );
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}