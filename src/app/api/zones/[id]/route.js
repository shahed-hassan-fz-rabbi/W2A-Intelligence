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
    const { name, area_code, population } = await request.json();

    if (!name?.trim() || !area_code?.trim()) {
      return NextResponse.json(
        { error: "Zone name and area code are required" },
        { status: 400 }
      );
    }

    const result = await execute(
      "UPDATE Zone SET name = ?, area_code = ?, population = ? WHERE zone_id = ?",
      [name.trim(), area_code.trim().toUpperCase(), Number(population) || 0, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "Zone updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Another zone already uses this name or area code" },
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

    // FK is RESTRICT — check first so we can give a readable message
    const [used] = await query(
      "SELECT COUNT(*) AS n FROM WasteCollection WHERE zone_id = ?",
      [id]
    );
    if (used.n > 0) {
      return NextResponse.json(
        {
          error: `This zone has ${used.n} collection record(s) and cannot be deleted`,
        },
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