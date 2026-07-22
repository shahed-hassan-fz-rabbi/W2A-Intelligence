import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const country = searchParams.get("country");

    let sql = `
      SELECT z.zone_id, z.name, z.city, z.district, z.country,
             z.area_code, z.population, z.latitude, z.longitude,
             COUNT(DISTINCT wc.collection_id)  AS collections,
             COALESCE(SUM(wc.quantity_kg), 0)  AS total_kg,
             COUNT(DISTINCT u.user_id)         AS collectors
      FROM Zone z
      LEFT JOIN WasteCollection wc ON z.zone_id = wc.zone_id
      LEFT JOIN User u ON z.zone_id = u.zone_id AND u.role = 'collector'
      WHERE 1 = 1
    `;
    const params = [];
    if (city)    { sql += " AND z.city = ?";    params.push(city); }
    if (country) { sql += " AND z.country = ?"; params.push(country); }

    sql += `
      GROUP BY z.zone_id
      ORDER BY z.country, z.city, z.name
    `;

    const rows = await query(sql, params);
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
    const body = await request.json();
    const name = body.name?.trim();
    const city = body.city?.trim();
    const country = body.country?.trim() || "Bangladesh";
    const area_code = body.area_code?.trim().toUpperCase();
    const pop = Number(body.population);

    if (!name || !city || !area_code) {
      return NextResponse.json(
        { error: "Zone name, city and area code are required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(pop) || pop < 0) {
      return NextResponse.json(
        { error: "Population must be zero or a positive number" },
        { status: 400 }
      );
    }

    const lat = body.latitude === "" || body.latitude == null ? null : Number(body.latitude);
    const lng = body.longitude === "" || body.longitude == null ? null : Number(body.longitude);

    if (lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) {
      return NextResponse.json(
        { error: "Latitude must be between -90 and 90" },
        { status: 400 }
      );
    }
    if (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180)) {
      return NextResponse.json(
        { error: "Longitude must be between -180 and 180" },
        { status: 400 }
      );
    }

    const result = await execute(
      `INSERT INTO Zone
         (name, city, district, country, area_code, population, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        city,
        body.district?.trim() || null,
        country,
        area_code,
        pop,
        lat,
        lng,
      ]
    );

    return NextResponse.json(
      {
        ok: true,
        zone_id: result.insertId,
        message: `${name}, ${city} added`,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "This city already has a zone with that name or area code" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}