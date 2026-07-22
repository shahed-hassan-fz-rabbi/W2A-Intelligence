import PageHeader from "@/components/PageHeader";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics & Reporting"
        subtitle="Waste distribution, company performance and environmental impact"
      />
      <AnalyticsClient />
    </>
  );
}