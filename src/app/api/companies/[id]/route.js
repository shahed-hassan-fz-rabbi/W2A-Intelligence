import { NextResponse } from "next/server";
import { query, execute, withTransaction } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function PATCH(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Toggle active state only
    if (body.is_active !== undefined && body.name === undefined) {
      await execute("UPDATE Company SET is_active = ? WHERE company_id = ?", [
        body.is_active ? 1 : 0,
        id,
      ]);
      return NextResponse.json({
        ok: true,
        message: body.is_active ? "Company activated" : "Company deactivated",
      });
    }

    const name = body.name?.trim();
    const location = body.location?.trim();
    const efficiency = Number(body.efficiency_score);
    const capacity = Number(body.capacity_kg);
    const wasteTypes = Array.isArray(body.waste_types) ? body.waste_types : [];

    if (!name || !location) {
      return NextResponse.json(
        { error: "Company name and location are required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(efficiency) || efficiency < 0 || efficiency > 100) {
      return NextResponse.json(
        { error: "Efficiency score must be between 0 and 100" },
        { status: 400 }
      );
    }
    if (wasteTypes.length === 0) {
      return NextResponse.json(
        { error: "Select at least one waste type" },
        { status: 400 }
      );
    }

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE Company
         SET name = ?, location = ?, contact_email = ?, contact_phone = ?,
             efficiency_score = ?, capacity_kg = ?
         WHERE company_id = ?`,
        [
          name,
          location,
          body.contact_email?.trim() || null,
          body.contact_phone?.trim() || null,
          efficiency,
          capacity,
          id,
        ]
      );
      await conn.execute("DELETE FROM CompanyWasteType WHERE company_id = ?", [id]);
      for (const wt of wasteTypes) {
        await conn.execute(
          "INSERT INTO CompanyWasteType (company_id, waste_type_id) VALUES (?, ?)",
          [id, Number(wt)]
        );
      }
    });

    return NextResponse.json({ ok: true, message: "Company updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Another company already uses this name" },
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
      "SELECT COUNT(*) AS n FROM Assignment WHERE company_id = ?",
      [id]
    );
    if (used.n > 0) {
      return NextResponse.json(
        {
          error: `This company has ${used.n} assignment(s). Deactivate it instead of deleting.`,
        },
        { status: 409 }
      );
    }

    const result = await execute("DELETE FROM Company WHERE company_id = ?", [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "Company deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}