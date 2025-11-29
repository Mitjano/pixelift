// Root layout - minimal, actual layout is in [locale]/layout.tsx
// This file is required by Next.js but all rendering happens in locale layout

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
