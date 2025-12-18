import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceClient from "@/components/admin/FinanceClient";
import ApiPlatformBalances from "@/components/admin/ApiPlatformBalances";

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/admin");
  }

  return (
    <div>
      <ApiPlatformBalances />
      <FinanceClient />
    </div>
  );
}
