import PageHeader from "@/components/PageHeader";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Your account details and activity summary"
      />
      <ProfileClient />
    </>
  );
}