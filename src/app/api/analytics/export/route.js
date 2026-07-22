import { requireRole } from "@/lib/session";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getZoneStats, getCompanyStats, getCategoryStats } from "@/lib/analytics";

function toCSV(rows) {
  if (!rows || rows.length === 0) return "No data\n";
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\n");
}

export async function GET(request) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const report = searchParams.get("report") || "zones";

    let rows;
    if (report === "zones") {
      rows = await getZoneStats(null, null);
    } else if (report === "companies") {
      rows = await getCompanyStats();
    } else if (report === "categories") {
      rows = await getCategoryStats(null, null);
    } else if (report === "lifecycle") {
      rows = await query(
        `SELECT z.name AS zone, wt.name AS waste_type,
                wc.quantity_kg AS collected_kg,
                DATE_FORMAT(wc.collection_date,'%Y-%m-%d') AS collection_date,
                COALESCE(c.name,'-') AS company,
                COALESCE(a.status,'-') AS status,
                COALESCE(a.processed_qty,0) AS processed_kg,
                COALESCE(p.product_name,'-') AS product,
                COALESCE(p.quantity_produced,0) AS produced_qty
         FROM WasteCollection wc
         JOIN Zone z            ON wc.zone_id = z.zone_id
         JOIN WasteType wt      ON wc.waste_type_id = wt.waste_type_id
         LEFT JOIN Assignment a ON wc.collection_id = a.collection_id
         LEFT JOIN Company c    ON a.company_id = c.company_id
         LEFT JOIN Product p    ON a.assignment_id = p.assignment_id
         ORDER BY wc.collection_date DESC`
      );
    } else {
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
    }

    const csv = toCSV(rows);
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="w2a_${report}_${stamp}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}