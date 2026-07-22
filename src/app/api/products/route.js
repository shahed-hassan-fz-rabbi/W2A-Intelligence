import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

// FR-5.2, FR-5.4 — full traceability: Product → Assignment → Collection → Zone
export async function GET(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const assignment = searchParams.get("assignment");
    const category = searchParams.get("category");

    let sql = `
      SELECT p.product_id, p.product_name, p.quantity_produced, p.unit,
             DATE_FORMAT(p.production_date, '%Y-%m-%d') AS production_date,
             a.assignment_id, a.processed_qty,
             wc.collection_id, wc.quantity_kg AS collected_qty,
             DATE_FORMAT(wc.collection_date, '%Y-%m-%d') AS collection_date,
             z.name AS zone_name,
             wt.name AS waste_type, wt.category,
             c.name AS company_name,
             ROUND(p.quantity_produced / wc.quantity_kg * 100, 2) AS conversion_ratio
      FROM Product p
      JOIN Assignment a       ON p.assignment_id = a.assignment_id
      JOIN WasteCollection wc ON a.collection_id = wc.collection_id
      JOIN Zone z             ON wc.zone_id = z.zone_id
      JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
      LEFT JOIN Company c     ON a.company_id = c.company_id
      WHERE 1 = 1
    `;
    const params = [];

    if (assignment) { sql += " AND a.assignment_id = ?"; params.push(assignment); }
    if (category)   { sql += " AND wt.category = ?";     params.push(category); }

    sql += " ORDER BY p.production_date DESC, p.product_id DESC";

    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// FR-5.1 — record generated products for a completed assignment
export async function POST(request) {
  const auth = await requireRole("admin", "company");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const assignment_id = Number(body.assignment_id);
    const product_name = body.product_name?.trim();
    const quantity_produced = Number(body.quantity_produced);
    const unit = body.unit || "kg";
    const production_date = body.production_date;

    if (!assignment_id || !product_name || !production_date) {
      return NextResponse.json(
        { error: "Assignment, product name and production date are required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(quantity_produced) || quantity_produced <= 0) {
      return NextResponse.json(
        { error: "Quantity produced must be a positive number greater than zero" },
        { status: 400 }
      );
    }

    // FR-5.1 — only completed assignments can generate products
    const [asg] = await query(
      `SELECT a.status, a.processed_qty, wc.quantity_kg
       FROM Assignment a
       JOIN WasteCollection wc ON a.collection_id = wc.collection_id
       WHERE a.assignment_id = ?`,
      [assignment_id]
    );
    if (!asg) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    if (asg.status !== "Completed") {
      return NextResponse.json(
        { error: "Products can only be recorded for completed assignments" },
        { status: 400 }
      );
    }

    // Output cannot exceed input mass (kg only)
    if (unit === "kg") {
      const [sum] = await query(
        `SELECT COALESCE(SUM(quantity_produced), 0) AS total
         FROM Product WHERE assignment_id = ? AND unit = 'kg'`,
        [assignment_id]
      );
      const inputQty = Number(asg.processed_qty ?? asg.quantity_kg);
      if (Number(sum.total) + quantity_produced > inputQty) {
        return NextResponse.json(
          {
            error: `Total output (${
              Number(sum.total) + quantity_produced
            } kg) cannot exceed processed input (${inputQty} kg)`,
          },
          { status: 400 }
        );
      }
    }

    const result = await execute(
      `INSERT INTO Product
         (assignment_id, product_name, quantity_produced, unit, production_date)
       VALUES (?, ?, ?, ?, ?)`,
      [assignment_id, product_name, quantity_produced, unit, production_date]
    );

    return NextResponse.json(
      {
        ok: true,
        product_id: result.insertId,
        message: `${product_name} recorded successfully`,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}