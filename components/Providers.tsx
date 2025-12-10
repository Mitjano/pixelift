"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CookieConsent from "./CookieConsent";
import ConsentSync from "./ConsentSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <CookieConsent />
        <ConsentSync />
      </ThemeProvider>
    </SessionProvider>
  );
}
