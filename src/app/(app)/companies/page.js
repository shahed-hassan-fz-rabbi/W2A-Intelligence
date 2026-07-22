import PageHeader from "@/components/PageHeader";
import CompaniesClient from "./CompaniesClient";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const wasteTypes = await query(
    `SELECT waste_type_id, name, category
     FROM WasteType WHERE is_active = TRUE
     ORDER BY category, name`
  );

  return (
    <>
      <PageHeader
        title="Recycling Companies"
        subtitle="Registered partners, processing capabilities and current workload"
      />
      <CompaniesClient wasteTypes={wasteTypes} />
    </>
  );
}