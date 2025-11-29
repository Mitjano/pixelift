import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllWebhooks, getAllWebhookLogs } from "@/lib/db";
import WebhooksClient from "./WebhooksClient";

export const dynamic = 'force-dynamic';

export default async function WebhooksPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/admin");
  }

  const webhooks = getAllWebhooks();
  const logs = getAllWebhookLogs(undefined, 50);

  // Sort by creation date (newest first)
  webhooks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: webhooks.length,
    enabled: webhooks.filter(w => w.enabled).length,
    disabled: webhooks.filter(w => !w.enabled).length,
    totalSuccess: webhooks.reduce((sum, w) => sum + w.successCount, 0),
    totalFailures: webhooks.reduce((sum, w) => sum + w.failureCount, 0),
    recentLogs: logs.length,
  };

  return <WebhooksClient webhooks={webhooks} logs={logs} stats={stats} />;
}
