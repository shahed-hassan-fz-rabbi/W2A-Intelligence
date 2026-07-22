import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import UsersClient from "./UsersClient";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (session.role !== "admin") redirect("/dashboard");

  const [zones, companies] = await Promise.all([
    query("SELECT zone_id, name, area_code FROM Zone ORDER BY name"),
    query(
      "SELECT company_id, name FROM Company WHERE is_active = TRUE ORDER BY name"
    ),
  ]);

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="System accounts, roles and access control"
      />
      <UsersClient
        zones={zones}
        companies={companies}
        currentUserId={session.user_id}
      />
    </>
  );
}