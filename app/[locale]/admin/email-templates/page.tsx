import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllEmailTemplates } from "@/lib/db";
import EmailTemplatesClient from "./EmailTemplatesClient";

export const dynamic = 'force-dynamic';

export default async function EmailTemplatesPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/admin");
  }

  const templates = getAllEmailTemplates();

  // Sort by update date (newest first)
  templates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.status === 'active').length,
    draft: templates.filter(t => t.status === 'draft').length,
    transactional: templates.filter(t => t.category === 'transactional').length,
    marketing: templates.filter(t => t.category === 'marketing').length,
    system: templates.filter(t => t.category === 'system').length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
  };

  return <EmailTemplatesClient templates={templates} stats={stats} />;
}
