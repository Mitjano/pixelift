"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide Header and Footer for admin pages and auth pages
  // Check both with and without locale prefix (e.g., /admin or /pl/admin)
  const isAdminPage = pathname?.includes("/admin");
  const isAuthPage = pathname?.includes("/auth");

  const shouldHideNavigation = isAdminPage || isAuthPage;

  return (
    <>
      {!shouldHideNavigation && <Header />}
      {children}
      {!shouldHideNavigation && <Footer />}
    </>
  );
}
