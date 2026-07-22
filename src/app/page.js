import { getSession } from "@/lib/session";
import PublicHome from "@/components/PublicHome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  return <PublicHome session={session} />;
}