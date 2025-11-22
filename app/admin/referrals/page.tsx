import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllReferrals } from "@/lib/db";
import ReferralsClient from "./ReferralsClient";

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin");

  const referrals = getAllReferrals();
  referrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: referrals.length,
    active: referrals.filter(r => r.status === 'active').length,
    converted: referrals.filter(r => r.status === 'converted').length,
    totalClicks: referrals.reduce((sum, r) => sum + r.clicks, 0),
    totalSignups: referrals.reduce((sum, r) => sum + r.signups, 0),
    totalRevenue: referrals.reduce((sum, r) => sum + r.revenue, 0),
    totalCommission: referrals.reduce((sum, r) => sum + r.commission, 0),
  };

  return <ReferralsClient referrals={referrals} stats={stats} />;
}
