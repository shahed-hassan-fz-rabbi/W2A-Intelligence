import PageHeader from "@/components/PageHeader";
import WasteTypesClient from "./WasteTypesClient";

export const dynamic = "force-dynamic";

export default function WasteTypesPage() {
  return (
    <>
      <PageHeader
        title="Waste Classification"
        subtitle="Master waste type registry with recyclable output mapping"
      />
      <WasteTypesClient />
    </>
  );
}