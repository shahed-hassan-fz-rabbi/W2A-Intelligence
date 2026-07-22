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

    // Activate / deactivate only (FR-2.4)
    if (body.is_active !== undefined && body.name === undefined) {
      await execute("UPDATE WasteType SET is_active = ? WHERE waste_type_id = ?", [
        body.is_active ? 1 : 0,
        id,
      ]);
      return NextResponse.json({
        ok: true,
        message: body.is_active ? "Waste type activated" : "Waste type deactivated",
      });
    }

    const name = body.name?.trim();
    const category = body.category;
    const carbon = Number(body.carbon_factor);

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }
    if (!["Plastic", "Organic", "Metal"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (!Number.isFinite(carbon) || carbon < 0) {
      return NextResponse.json(
        { error: "Carbon factor must be zero or a positive number" },
        { status: 400 }
      );
    }

    const result = await execute(
      `UPDATE WasteType
       SET name = ?, category = ?, description = ?, carbon_factor = ?,
           output_products = ?
       WHERE waste_type_id = ?`,
      [
        name,
        category,
        body.description?.trim() || null,
        carbon,
        body.output_products?.trim() || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "Waste type updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Another waste type already uses this name" },
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
      "SELECT COUNT(*) AS n FROM WasteCollection WHERE waste_type_id = ?",
      [id]
    );
    if (used.n > 0) {
      return NextResponse.json(
        {
          error: `This waste type is used in ${used.n} collection record(s). Deactivate it instead.`,
        },
        { status: 409 }
      );
    }

    const result = await execute(
      "DELETE FROM WasteType WHERE waste_type_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "Waste type deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}