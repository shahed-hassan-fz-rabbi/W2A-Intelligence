import PageHeader from "@/components/PageHeader";
import SettingsClient from "./SettingsClient";
import { getSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Appearance, session and system information"
      />
      <SettingsClient
        role={ROLE_LABEL[session.role]}
        email={session.email || "—"}
      />
    </>
  );
}