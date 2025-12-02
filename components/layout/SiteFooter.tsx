// components/layout/SiteFooter.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#002039] text-slate-100">
      <div className="mx-auto grid max-w-container gap-10 px-6 pb-8 pt-10 lg:grid-cols-[1.1fr,1.4fr] lg:px-12">
        {/* Brand block */}
        <div>
          <Link href="/">
            <Image
              src="/images/logos/Footer logo.webp"
              alt="Ejidike Foundation"
              width={150}
              height={60}
              className="h-auto w-36 object-contain"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Empowering Nigeria's youth with access to education, funding, and
            mentorship.
          </p>
        </div>

        {/* Columns */}
        <div className="flex flex-wrap gap-10">
          <div className="min-w-[140px]">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Links
            </h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/programs">Programs</Link>
              </li>
              <li>
                <Link href="/funding">Funding</Link>
              </li>
              <li>
                <Link href="/partners">Partners</Link>
              </li>
              <li>
                <Link href="/mentorship">Mentorship</Link>
              </li>
              <li>
                <Link href="/news">News</Link>
              </li>
            </ul>
          </div>

          <div className="min-w-[140px]">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Legal
            </h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>
                <Link href="#">Privacy &amp; Terms</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className="min-w-[240px] flex-1">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Join our newsletter
            </h4>
            <p className="mb-3 text-xs text-slate-400">
              We only send interesting and relevant emails.
            </p>
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="h-10 flex-1 min-w-0 rounded-[10px] border border-slate-600 bg-dark px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none"
              />
              <button className="h-10 rounded-[10px] bg-brand-yellow px-4 text-xs font-medium text-slate-900 shadow-sm hover:bg-brand-yellowDark">
                Sign up
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 pb-4 pt-3 text-center text-[11px] text-slate-500 lg:px-12">
        © 2025 · Ejidike Foundation ·
      </div>
    </footer>
  );
}