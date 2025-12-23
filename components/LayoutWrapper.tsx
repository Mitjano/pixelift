"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide Header and Footer for admin pages and auth pages
  // Check both with and without locale prefix (e.g., /admin or /pl/admin)
  const isAdminPage = pathname?.includes("/admin");
  const isAuthPage = pathname?.includes("/auth");
  // Hide header/footer for AI Chat when user is logged in (chat has its own fullscreen UI)
  const isAIChatPage = pathname?.includes("/ai-chat") && session;

  const shouldHideNavigation = isAdminPage || isAuthPage || isAIChatPage;

  return (
    <>
      {!shouldHideNavigation && <Header />}
      {children}
      {!shouldHideNavigation && <Footer />}
    </>
  );
}
