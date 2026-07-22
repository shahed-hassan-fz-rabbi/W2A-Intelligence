import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

// FR-1.3 — filterable list
export async function GET(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone");
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let sql = `
      SELECT wc.collection_id,
             wc.quantity_kg,
             DATE_FORMAT(wc.collection_date, '%Y-%m-%d') AS collection_date,
             z.zone_id, z.name AS zone_name,
             wt.waste_type_id, wt.name AS waste_type, wt.category,
             u.user_id, u.name AS collector_name,
             a.assignment_id, a.status AS assignment_status,
             c.name AS company_name
      FROM WasteCollection wc
      JOIN Zone z            ON wc.zone_id = z.zone_id
      JOIN WasteType wt      ON wc.waste_type_id = wt.waste_type_id
      JOIN User u            ON wc.user_id = u.user_id
      LEFT JOIN Assignment a ON wc.collection_id = a.collection_id
      LEFT JOIN Company c    ON a.company_id = c.company_id
      WHERE 1 = 1
    `;
    const params = [];

    if (zone)  { sql += " AND wc.zone_id = ?";         params.push(zone); }
    if (type)  { sql += " AND wc.waste_type_id = ?";   params.push(type); }
    if (from)  { sql += " AND wc.collection_date >= ?"; params.push(from); }
    if (to)    { sql += " AND wc.collection_date <= ?"; params.push(to); }

    // Collectors only see their own entries
    if (auth.session.role === "collector") {
      sql += " AND wc.user_id = ?";
      params.push(auth.session.user_id);
    }

    sql += " ORDER BY wc.collection_date DESC, wc.collection_id DESC";

    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// FR-1.1, FR-1.2, FR-1.4, FR-1.5
export async function POST(request) {
  const auth = await requireRole("admin", "collector");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const zone_id = Number(body.zone_id);
    const waste_type_id = Number(body.waste_type_id);
    const quantity_kg = Number(body.quantity_kg);
    const collection_date = body.collection_date;

    // FR-1.2 — required fields
    if (!zone_id || !waste_type_id || !collection_date) {
      return NextResponse.json(
        { error: "Zone, waste type and collection date are required" },
        { status: 400 }
      );
    }

    // FR-1.4 — positive non-zero quantity
    if (!Number.isFinite(quantity_kg) || quantity_kg <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number greater than zero" },
        { status: 400 }
      );
    }

    // No future-dated collections
    const today = new Date().toISOString().slice(0, 10);
    if (collection_date > today) {
      return NextResponse.json(
        { error: "Collection date cannot be in the future" },
        { status: 400 }
      );
    }

    // FR-1.5 — duplicate guard
    const dup = await query(
      `SELECT collection_id FROM WasteCollection
       WHERE zone_id = ? AND collection_date = ? AND waste_type_id = ?`,
      [zone_id, collection_date, waste_type_id]
    );
    if (dup.length > 0) {
      return NextResponse.json(
        {
          error:
            "A record already exists for this zone, date and waste type combination",
        },
        { status: 409 }
      );
    }

    const result = await execute(
      `INSERT INTO WasteCollection
         (zone_id, user_id, waste_type_id, quantity_kg, collection_date)
       VALUES (?, ?, ?, ?, ?)`,
      [zone_id, auth.session.user_id, waste_type_id, quantity_kg, collection_date]
    );

    return NextResponse.json(
      {
        ok: true,
        collection_id: result.insertId,
        message: "Waste collection recorded. Queued for allocation.",
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}