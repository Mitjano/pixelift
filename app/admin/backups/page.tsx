import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllBackups } from "@/lib/db";
import BackupsClient from "./BackupsClient";

export const dynamic = 'force-dynamic';

export default async function BackupsPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/admin");
  }

  const backups = getAllBackups();

  // Sort by creation date (newest first)
  backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: backups.length,
    manual: backups.filter(b => b.type === 'manual').length,
    automatic: backups.filter(b => b.type === 'automatic').length,
    totalSize: backups.reduce((sum, b) => sum + b.size, 0),
  };

  return <BackupsClient backups={backups} stats={stats} />;
}
