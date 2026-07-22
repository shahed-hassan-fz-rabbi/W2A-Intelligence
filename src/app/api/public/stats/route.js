import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const [
      [overview],
      zones,
      categories,
      companies,
      [recent],
    ] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(wc.quantity_kg), 0) AS total_collected,
                COALESCE(SUM(CASE WHEN a.status='Completed' THEN a.processed_qty END), 0)
                  AS total_recycled,
                COALESCE(ROUND(SUM(CASE WHEN a.status='Completed'
                       THEN a.processed_qty * wt.carbon_factor END), 0), 0)
                  AS carbon_saved,
                COUNT(DISTINCT wc.zone_id) AS zones_served
         FROM WasteCollection wc
         JOIN WasteType wt      ON wc.waste_type_id = wt.waste_type_id
         LEFT JOIN Assignment a ON wc.collection_id = a.collection_id`
      ),
      query(
        `SELECT z.name AS zone_name, z.area_code,
                COALESCE(SUM(wc.quantity_kg), 0) AS total_kg,
                COUNT(wc.collection_id) AS collections
         FROM Zone z
         LEFT JOIN WasteCollection wc ON z.zone_id = wc.zone_id
         GROUP BY z.zone_id, z.name, z.area_code
         ORDER BY total_kg DESC`
      ),
      query(
        `SELECT wt.category,
                COALESCE(SUM(wc.quantity_kg), 0) AS collected_kg,
                COALESCE(ROUND(SUM(CASE WHEN a.status='Completed'
                       THEN a.processed_qty * wt.carbon_factor END), 0), 0)
                  AS carbon_kg
         FROM WasteType wt
         JOIN WasteCollection wc ON wt.waste_type_id = wc.waste_type_id
         LEFT JOIN Assignment a  ON wc.collection_id = a.collection_id
         GROUP BY wt.category
         ORDER BY collected_kg DESC`
      ),
      query(
        `SELECT c.name, c.location,
                GROUP_CONCAT(DISTINCT wt.category ORDER BY wt.category SEPARATOR ', ')
                  AS handles,
                COALESCE(SUM(a.processed_qty), 0) AS processed_kg
         FROM Company c
         LEFT JOIN CompanyWasteType cwt ON c.company_id = cwt.company_id
         LEFT JOIN WasteType wt         ON cwt.waste_type_id = wt.waste_type_id
         LEFT JOIN Assignment a         ON c.company_id = a.company_id
              AND a.status = 'Completed'
         WHERE c.is_active = TRUE
         GROUP BY c.company_id, c.name, c.location
         ORDER BY processed_kg DESC
         LIMIT 6`
      ),
      query(
        `SELECT COUNT(*) AS products,
                COALESCE(SUM(quantity_produced), 0) AS produced_kg
         FROM Product WHERE unit = 'kg'`
      ),
    ]);

    const products = await query(
      `SELECT p.product_name,
              SUM(p.quantity_produced) AS total_qty,
              p.unit, wt.category
       FROM Product p
       JOIN Assignment a       ON p.assignment_id = a.assignment_id
       JOIN WasteCollection wc ON a.collection_id = wc.collection_id
       JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
       GROUP BY p.product_name, p.unit, wt.category
       ORDER BY total_qty DESC
       LIMIT 8`
    );

    return NextResponse.json({
      overview: { ...overview, ...recent },
      zones,
      categories,
      companies,
      products,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}