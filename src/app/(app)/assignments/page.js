import PageHeader from "@/components/PageHeader";
import AssignmentsClient from "./AssignmentsClient";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const session = await getSession();
  const companies = await query(
    "SELECT company_id, name FROM Company WHERE is_active = TRUE ORDER BY name"
  );

  return (
    <>
      <PageHeader
        title="Company Allocation"
        subtitle="Waste batches assigned by the intelligent allocation engine"
      />
      <AssignmentsClient companies={companies} role={session.role} />
    </>
  );
}