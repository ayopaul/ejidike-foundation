// components/layout/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  {
    href: "/programs",
    label: "Programs",
    children: [
      { href: "/programs", label: "All Programs" },
      { href: "/funding", label: "Funding" },
    ],
  },
  { href: "/partners", label: "Partners" },
  {
    href: "/mentorship",
    label: "Mentorship",
    children: [
      { href: "/mentorship", label: "Overview" },
      { href: "/network", label: "Network" },
    ],
  },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  // Handle scroll behavior - show header when scrolling up, hide when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if at top of page
      setIsAtTop(currentScrollY < 10);

      // Don't hide header if mobile menu is open
      if (mobileMenuOpen) {
        setIsVisible(true);
        return;
      }

      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide header when scrolling down (after 100px)
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  }, [pathname]);

  return (
    <header
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${!isAtTop ? "shadow-md" : ""}`}
    >
      {/* Top strip */}
      <div className="flex w-full items-center justify-center bg-[#FFCF4C] px-4 py-3 text-xs font-medium text-black sm:text-sm">
        Applications for 2025/2026 Grant Cycle now open
      </div>

      {/* Main nav */}
      <div className={`mx-auto flex max-w-container items-center justify-between px-6 py-6 lg:px-12 transition-colors duration-300 ${
        !isAtTop ? "bg-white/95 backdrop-blur-sm" : "bg-transparent"
      }`}>
        {/* Logo + nav links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logos/logo.webp"
              alt="Ejidike Foundation"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary lg:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              // Items with children get a dropdown
              if (item.children) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1 ${
                        active ? "text-text-primary" : "hover:text-text-primary"
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openDropdown === item.href ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    <div
                      className={`absolute left-0 top-full pt-2 transition-all duration-200 ${
                        openDropdown === item.href
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      <div className="min-w-[160px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                childActive
                                  ? "bg-gray-50 text-text-primary"
                                  : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

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

        {/* Right: hamburger + login */}
        <div className="flex items-center gap-3">
          {/* Hamburger button - visible on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-md p-2 text-gray-900 hover:bg-gray-100 lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>

          <Link
            href="/login"
            className="rounded-[10px] border border-text-primary px-5 py-2 text-sm font-medium text-text-primary transition hover:bg-text-primary hover:text-white"
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Mobile menu - floating overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "auto" }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={`absolute left-0 right-0 top-0 bg-white shadow-xl transition-all duration-300 ease-out ${
            mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
          style={{ marginTop: "0" }}
        >
          <nav className="flex flex-col px-6 py-4 max-h-[70vh] overflow-y-auto">
            {navItems.map((item, index) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              // Items with children get an expandable submenu
              if (item.children) {
                const isSubmenuOpen = mobileSubmenu === item.href;
                return (
                  <div
                    key={item.href}
                    style={{
                      transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                      transform: mobileMenuOpen ? "translateY(0)" : "translateY(-10px)",
                      opacity: mobileMenuOpen ? 1 : 0,
                    }}
                    className="transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSubmenu(isSubmenuOpen ? null : item.href)
                      }
                      className={`flex w-full items-center justify-between py-3 text-sm font-medium ${
                        active
                          ? "text-text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isSubmenuOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Submenu */}
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        isSubmenuOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="flex flex-col border-l-2 border-gray-200 pl-4 ml-2">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileSubmenu(null);
                              }}
                              className={`py-2.5 text-sm transition-colors ${
                                childActive
                                  ? "text-text-primary font-medium"
                                  : "text-text-secondary hover:text-text-primary"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                    transform: mobileMenuOpen ? "translateY(0)" : "translateY(-10px)",
                    opacity: mobileMenuOpen ? 1 : 0,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}