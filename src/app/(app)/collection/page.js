import PageHeader from "@/components/PageHeader";
import CollectionClient from "./CollectionClient";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const session = await getSession();

  const zones = await query(
    "SELECT zone_id, name, area_code FROM Zone ORDER BY name"
  );
  const wasteTypes = await query(
    `SELECT waste_type_id, name, category
     FROM WasteType WHERE is_active = TRUE
     ORDER BY category, name`
  );

  return (
    <>
      <PageHeader
        title="Waste Collection"
        subtitle="Register and track waste collection events across city zones"
      />
      <CollectionClient
        zones={zones}
        wasteTypes={wasteTypes}
        role={session.role}
      />
    </>
  );
}