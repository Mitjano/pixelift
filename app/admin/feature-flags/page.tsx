import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFeatureFlags } from "@/lib/db";
import FeatureFlagsClient from "./FeatureFlagsClient";

export default async function FeatureFlagsPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/admin");
  }

  const flags = getAllFeatureFlags();

  const stats = {
    total: flags.length,
    enabled: flags.filter(f => f.enabled).length,
    disabled: flags.filter(f => !f.enabled).length,
    fullRollout: flags.filter(f => f.rolloutPercentage === 100).length,
  };

  return <FeatureFlagsClient flags={flags} stats={stats} />;
}
