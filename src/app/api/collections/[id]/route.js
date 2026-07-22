import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { allocateCollection } from "@/lib/allocation";


export async function DELETE(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const result = await execute(
      "DELETE FROM WasteCollection WHERE collection_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


const result = await execute(
      `INSERT INTO WasteCollection
         (zone_id, user_id, waste_type_id, quantity_kg, collection_date)
       VALUES (?, ?, ?, ?, ?)`,
      [zone_id, auth.session.user_id, waste_type_id, quantity_kg, collection_date]
    );

    // FR-3.1 — allocation engine fires immediately after collection
    const allocation = await allocateCollection(result.insertId, waste_type_id);

    return NextResponse.json(
      {
        ok: true,
        collection_id: result.insertId,
        allocation,
        message: allocation.allocated
          ? `Collection recorded and allocated to ${allocation.company_name} (load: ${allocation.active_load}, efficiency: ${allocation.efficiency_score})`
          : `Collection recorded but flagged Unassigned — ${allocation.reason}`,
      },
      { status: 201 }
    );