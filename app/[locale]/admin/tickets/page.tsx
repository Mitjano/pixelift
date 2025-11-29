import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllTickets } from "@/lib/db";
import TicketsClient from "./TicketsClient";

export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin");

  const tickets = getAllTickets();
  tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  return <TicketsClient tickets={tickets} stats={stats} />;
}
