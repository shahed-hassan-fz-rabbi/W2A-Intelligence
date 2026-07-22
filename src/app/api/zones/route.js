import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const rows = await query(
      `SELECT z.zone_id, z.name, z.area_code, z.population,
              COUNT(DISTINCT wc.collection_id)  AS collections,
              COALESCE(SUM(wc.quantity_kg), 0)  AS total_kg,
              COUNT(DISTINCT u.user_id)         AS collectors
       FROM Zone z
       LEFT JOIN WasteCollection wc ON z.zone_id = wc.zone_id
       LEFT JOIN User u ON z.zone_id = u.zone_id AND u.role = 'collector'
       GROUP BY z.zone_id, z.name, z.area_code, z.population
       ORDER BY z.name`
    );
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { name, area_code, population } = await request.json();

    if (!name?.trim() || !area_code?.trim()) {
      return NextResponse.json(
        { error: "Zone name and area code are required" },
        { status: 400 }
      );
    }
    const pop = Number(population);
    if (!Number.isFinite(pop) || pop < 0) {
      return NextResponse.json(
        { error: "Population must be zero or a positive number" },
        { status: 400 }
      );
    }

    const result = await execute(
      "INSERT INTO Zone (name, area_code, population) VALUES (?, ?, ?)",
      [name.trim(), area_code.trim().toUpperCase(), pop]
    );

    return NextResponse.json(
      { ok: true, zone_id: result.insertId, message: `Zone ${name} created` },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A zone with this name or area code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}