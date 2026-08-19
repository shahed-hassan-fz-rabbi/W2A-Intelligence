// Location: src/app/api/finance/revenue/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const isCompany = auth.session.role === "company";
    const companyId = auth.session.company_id;

    let whereClause = "WHERE 1 = 1";
    const params = [];

    if (isCompany && companyId) {
      whereClause += " AND t.company_id = ?";
      params.push(companyId);
    }

    // 1. Financial Overview KPIs
    const [overview] = await query(
      `SELECT 
         COALESCE(SUM(t.gross_amount), 0) AS total_gross_volume,
         COALESCE(SUM(t.platform_commission), 0) AS total_platform_revenue,
         COALESCE(SUM(t.quantity_kg), 0) AS total_monetized_kg,
         COUNT(t.transaction_id) AS total_transactions
       FROM Transactions t
       ${whereClause}`,
      params
    );

    // 2. Transaction List
    const transactions = await query(
      `SELECT 
         t.transaction_id,
         t.assignment_id,
         t.quantity_kg,
         t.rate_per_kg,
         t.gross_amount,
         t.platform_commission,
         t.net_payout,
         t.payment_status,
         DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') AS transaction_date,
         c.name AS company_name,
         wt.name AS waste_type,
         wt.category
       FROM Transactions t
       JOIN Company c ON t.company_id = c.company_id
       JOIN WasteType wt ON t.waste_type_id = wt.waste_type_id
       ${whereClause}
       ORDER BY t.transaction_id DESC
       LIMIT 50`,
      params
    );

    return NextResponse.json({
      overview,
      transactions,
    });
  } catch (err) {
    console.error("FINANCE API ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}