// components/layout/SiteLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [hasAnnouncement, setHasAnnouncement] = useState(true); // Default to true to prevent layout shift

  // Check if there's an active announcement
  useEffect(() => {
    const checkAnnouncement = async () => {
      try {
        const supabase = createClientComponentClient<Database>();
        const { data, error } = await supabase
          .from("announcements")
          .select("id")
          .eq("is_active", true)
          .limit(1);

        setHasAnnouncement(!error && data && data.length > 0);
      } catch {
        setHasAnnouncement(false);
      }
    };

    checkAnnouncement();
  }, []);

  return (
    <div className="relative min-h-screen bg-surface-cream font-poppins text-text-primary">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-glow-pink blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-glow-blue blur-3xl" />
      </div>

      <SiteHeader />

      {/* Spacer for fixed header (announcement bar ~44px + nav ~88px) */}
      <div className={hasAnnouncement ? "h-[132px]" : "h-[88px]"} />

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}