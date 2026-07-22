import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/session";

// FR-4.4 — all assignments with live status
export async function GET(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const company = searchParams.get("company");

    let sql = `
      SELECT a.assignment_id, a.status, a.is_manual, a.processed_qty,
             DATE_FORMAT(a.assigned_date, '%Y-%m-%d %H:%i') AS assigned_date,
             DATE_FORMAT(a.start_time,   '%Y-%m-%d %H:%i') AS start_time,
             DATE_FORMAT(a.end_time,     '%Y-%m-%d %H:%i') AS end_time,
             wc.collection_id, wc.quantity_kg,
             DATE_FORMAT(wc.collection_date, '%Y-%m-%d') AS collection_date,
             z.name AS zone_name,
             wt.waste_type_id, wt.name AS waste_type, wt.category,
             c.company_id, c.name AS company_name, c.efficiency_score,
             (SELECT COUNT(*) FROM Product p
              WHERE p.assignment_id = a.assignment_id) AS product_count
      FROM Assignment a
      JOIN WasteCollection wc ON a.collection_id = wc.collection_id
      JOIN Zone z             ON wc.zone_id = z.zone_id
      JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
      LEFT JOIN Company c     ON a.company_id = c.company_id
      WHERE 1 = 1
    `;
    const params = [];

    if (status)  { sql += " AND a.status = ?";     params.push(status); }
    if (company) { sql += " AND a.company_id = ?"; params.push(company); }

    sql += " ORDER BY FIELD(a.status,'Unassigned','Pending','In Progress','Completed','Failed'), a.assignment_id DESC";

    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}