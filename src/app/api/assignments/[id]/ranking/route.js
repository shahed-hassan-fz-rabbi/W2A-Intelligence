import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { rankCompanies } from "@/lib/allocation";

export async function GET(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const [asg] = await query(
      `SELECT wc.waste_type_id, wt.name AS waste_type, a.company_id
       FROM Assignment a
       JOIN WasteCollection wc ON a.collection_id = wc.collection_id
       JOIN WasteType wt ON wc.waste_type_id = wt.waste_type_id
       WHERE a.assignment_id = ?`,
      [id]
    );
    if (!asg) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const ranked = await rankCompanies(asg.waste_type_id);
    return NextResponse.json({
      waste_type: asg.waste_type,
      assigned_company_id: asg.company_id,
      ranking: ranked,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}