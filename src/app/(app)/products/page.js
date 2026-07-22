import PageHeader from "@/components/PageHeader";
import ProductsClient from "./ProductsClient";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await getSession();

  const [summary] = await query(
    `SELECT COUNT(DISTINCT p.product_id)   AS total_products,
            COALESCE(SUM(CASE WHEN p.unit = 'kg' THEN p.quantity_produced END), 0)
              AS total_kg,
            COUNT(DISTINCT p.assignment_id) AS batches,
            COALESCE(ROUND(AVG(p.quantity_produced / wc.quantity_kg * 100), 2), 0)
              AS avg_ratio
     FROM Product p
     JOIN Assignment a       ON p.assignment_id = a.assignment_id
     JOIN WasteCollection wc ON a.collection_id = wc.collection_id`
  );

  return (
    <>
      <PageHeader
        title="Assets Generated"
        subtitle="Products recovered from processed waste batches"
      />
      <ProductsClient summary={summary} role={session.role} />
    </>
  );
}