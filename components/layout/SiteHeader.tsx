// components/layout/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/funding", label: "Funding" },
  { href: "/partners", label: "Partners" },
  { href: "/mentorship", label: "Mentorship" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="w-full">
      {/* Top strip */}
      <div className="flex w-full items-center justify-center bg-[#FFCF4C] px-4 py-3 text-xs font-medium text-black sm:text-sm">
        Applications for 2025/2026 Grant Cycle now open
      </div>

      {/* Main nav */}
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-6 lg:px-12">
        {/* Logo + nav links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex flex-col gap-[2px]">
            <span className="text-lg font-semibold tracking-[0.16em] uppercase">
              Ejidike
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-text-secondary">
              education foundation
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary lg:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active ? "text-text-primary" : "hover:text-text-primary"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: login */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-[10px] border border-text-primary px-5 py-2 text-sm font-medium text-text-primary transition hover:bg-text-primary hover:text-white"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}