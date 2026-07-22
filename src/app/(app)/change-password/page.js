import PageHeader from "@/components/PageHeader";
import ChangePasswordClient from "./ChangePasswordClient";

export default function ChangePasswordPage() {
  return (
    <>
      <PageHeader
        title="Change Password"
        subtitle="Update the password used to sign in to your account"
      />
      <ChangePasswordClient />
    </>
  );
}