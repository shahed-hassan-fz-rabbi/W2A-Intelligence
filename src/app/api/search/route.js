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
    const q = (searchParams.get("q") || "").trim();
    if (q.length < 2) return NextResponse.json([]);

    const like = `%${q}%`;

    const rows = await query(
      `SELECT 'Collection' AS kind,
              CONCAT('#', wc.collection_id) AS ref,
              CONCAT(wt.name, ' · ', z.name, ' · ', wc.quantity_kg, ' kg') AS label,
              '/collection' AS href
       FROM WasteCollection wc
       JOIN Zone z       ON wc.zone_id = z.zone_id
       JOIN WasteType wt ON wc.waste_type_id = wt.waste_type_id
       WHERE wt.name LIKE ? OR z.name LIKE ? OR CAST(wc.collection_id AS CHAR) = ?

       UNION ALL

       SELECT 'Company', c.name,
              CONCAT(c.location, ' · efficiency ', c.efficiency_score),
              '/companies'
       FROM Company c
       WHERE c.name LIKE ? OR c.location LIKE ?

       UNION ALL

       SELECT 'Zone', z.name,
              CONCAT(z.area_code, ' · population ', z.population),
              '/analytics'
       FROM Zone z
       WHERE z.name LIKE ? OR z.area_code LIKE ?

       UNION ALL

       SELECT 'Waste Type', wt.name,
              CONCAT(wt.category, ' · ', COALESCE(wt.output_products, '')),
              '/waste-types'
       FROM WasteType wt
       WHERE wt.name LIKE ? OR wt.category LIKE ?

       UNION ALL

       SELECT 'Product', p.product_name,
              CONCAT(p.quantity_produced, ' ', p.unit),
              '/products'
       FROM Product p
       WHERE p.product_name LIKE ?

       LIMIT 12`,
      [like, like, q, like, like, like, like, like, like, like]
    );

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}