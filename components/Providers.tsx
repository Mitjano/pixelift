"use client";

import { SessionProvider } from "next-auth/react";
import CookieConsent from "./CookieConsent";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CookieConsent />
    </SessionProvider>
  );
}
