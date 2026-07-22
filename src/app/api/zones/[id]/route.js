import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function PATCH(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const name = body.name?.trim();
    const city = body.city?.trim();
    const area_code = body.area_code?.trim().toUpperCase();

    if (!name || !city || !area_code) {
      return NextResponse.json(
        { error: "Zone name, city and area code are required" },
        { status: 400 }
      );
    }

    const lat = body.latitude === "" || body.latitude == null ? null : Number(body.latitude);
    const lng = body.longitude === "" || body.longitude == null ? null : Number(body.longitude);

    const result = await execute(
      `UPDATE Zone
       SET name = ?, city = ?, district = ?, country = ?,
           area_code = ?, population = ?, latitude = ?, longitude = ?
       WHERE zone_id = ?`,
      [
        name,
        city,
        body.district?.trim() || null,
        body.country?.trim() || "Bangladesh",
        area_code,
        Number(body.population) || 0,
        lat,
        lng,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "Zone updated" });
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

export async function DELETE(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;

    const [used] = await query(
      "SELECT COUNT(*) AS n FROM WasteCollection WHERE zone_id = ?",
      [id]
    );
    if (used.n > 0) {
      return NextResponse.json(
        { error: `This zone has ${used.n} collection record(s) and cannot be deleted` },
        { status: 409 }
      );
    }

    const result = await execute("DELETE FROM Zone WHERE zone_id = ?", [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "Zone deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}