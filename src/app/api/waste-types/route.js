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
    const all = searchParams.get("all") === "1";

    const rows = await query(
      `SELECT wt.waste_type_id, wt.name, wt.category, wt.description,
              wt.carbon_factor, wt.output_products, wt.is_active,
              COUNT(DISTINCT cwt.company_id)   AS capable_companies,
              COUNT(DISTINCT wc.collection_id) AS times_collected,
              COALESCE(SUM(wc.quantity_kg), 0) AS total_kg
       FROM WasteType wt
       LEFT JOIN CompanyWasteType cwt ON wt.waste_type_id = cwt.waste_type_id
       LEFT JOIN WasteCollection wc   ON wt.waste_type_id = wc.waste_type_id
       ${all ? "" : "WHERE wt.is_active = TRUE"}
       GROUP BY wt.waste_type_id
       ORDER BY wt.category, wt.name`
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
    const body = await request.json();
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
      return NextResponse.json(
        { error: "Category must be Plastic, Organic or Metal" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(carbon) || carbon < 0) {
      return NextResponse.json(
        { error: "Carbon factor must be zero or a positive number" },
        { status: 400 }
      );
    }

    const result = await execute(
      `INSERT INTO WasteType
         (name, category, description, carbon_factor, output_products)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        category,
        body.description?.trim() || null,
        carbon,
        body.output_products?.trim() || null,
      ]
    );

    return NextResponse.json(
      { ok: true, waste_type_id: result.insertId, message: `${name} added` },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A waste type with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}