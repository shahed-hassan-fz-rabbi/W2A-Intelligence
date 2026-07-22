import PageHeader from "@/components/PageHeader";
import ZonesClient from "./ZonesClient";

export const dynamic = "force-dynamic";

export default function ZonesPage() {
  return (
    <>
      <PageHeader
        title="City Zones"
        subtitle="Geographic zones covered by the waste management system"
      />
      <ZonesClient />
    </>
  );
}