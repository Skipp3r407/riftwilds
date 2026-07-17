import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionContext();
  if (!session) {
    redirect("/play?admin=login-required");
  }
  if (session.role !== "admin") {
    redirect("/play?admin=forbidden");
  }
  return <>{children}</>;
}
