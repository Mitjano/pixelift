import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllNotifications, getUnreadNotifications } from "@/lib/db";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/admin");
  }

  const allNotifications = getAllNotifications();
  const unreadNotifications = getUnreadNotifications();

  const stats = {
    total: allNotifications.length,
    unread: unreadNotifications.length,
    byCategory: allNotifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: allNotifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return <NotificationsClient notifications={allNotifications} stats={stats} />;
}
