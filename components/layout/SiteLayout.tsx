// components/layout/SiteLayout.tsx
import React from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-cream font-poppins text-text-primary">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-glow-pink blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-glow-blue blur-3xl" />
      </div>

      <SiteHeader />

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}