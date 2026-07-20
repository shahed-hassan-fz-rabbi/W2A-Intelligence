import PageHeader from "@/components/PageHeader";
import { getSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/roles";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.name.split(" ")[0]}`}
        subtitle={`Signed in as ${ROLE_LABEL[session.role]}`}
      />
      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="text-sm text-muted">
          Dashboard metrics will be added in Step 6.
        </p>
      </div>
    </>
  );
}