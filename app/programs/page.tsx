// app/programs/page.tsx
"use client";

import React, { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";

type TabType = "education" | "business" | "mentorship";

const tabContent: Record<TabType, { description: string; cta: string; link: string }> = {
  education: {
    description:
      "We provide grants for tertiary education. Covering tuition, books, digital resources, and school fees. Beyond the money, scholars join a support community of peer learners and mentors.",
    cta: "Apply for educational grant",
    link: "/login",
  },
  business: {
    description:
      "Seed funding and early-stage support for youth-led ventures building solutions with clear community impact. We back founders with capital, coaching, and connections.",
    cta: "Learn about business grants",
    link: "/login",
  },
  mentorship: {
    description:
      "Guided learning, accountability, and emotional support so youth can grow skills and navigate real-world challenges. Get matched with experienced mentors in your field.",
    cta: "Explore mentorship",
    link: "/login",
  },
};

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("education");

  return (
    <SiteLayout>
      {/* ===== HERO & OVERVIEW SECTION ===== */}
      <section
        className="relative w-full bg-[#FBF4EE] px-6 py-12 lg:px-12 lg:py-16"
        style={{
          backgroundImage: "url('/images/imgs/program background.webp')",
          backgroundPosition: "left bottom",
          backgroundSize: "auto",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto max-w-[1320px]">
          {/* Header Image */}
          <div className="flex justify-center mb-12 lg:mb-16">
            <Image
              src="/images/imgs/all-programs-header-image.webp"
              alt="Programs at Ejidike Foundation"
              width={800}
              height={400}
              className="w-full max-w-[800px] h-auto rounded-2xl object-cover"
              priority
            />
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Left side - Overview text */}
            <div>
              <h1 className="mb-6 text-3xl font-medium leading-snug lg:text-4xl">
                Overview
              </h1>
              <p className="text-base leading-relaxed text-text-secondary max-w-md">
                Every journey begins with a single step. At Ejidike, we offer programs tailored to each step of a youth&apos;s path from education to enterprise ensuring no one is left behind.
              </p>
            </div>

            {/* Right side - Tabs */}
            <div>
              {/* Tab buttons */}
              <div className="flex">
                <button
                  onClick={() => setActiveTab("education")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "education"
                      ? "border-b-2 border-[#0080FF] text-black"
                      : "text-[#999999]"
                  }`}
                >
                  Education Grant Program
                </button>
                <button
                  onClick={() => setActiveTab("business")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "business"
                      ? "border-b-2 border-[#0080FF] text-black"
                      : "text-[#999999]"
                  }`}
                >
                  Business Grant / Startup Support
                </button>
                <button
                  onClick={() => setActiveTab("mentorship")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "mentorship"
                      ? "border-b-2 border-[#0080FF] text-black"
                      : "text-[#999999]"
                  }`}
                >
                  Mentorship & Coaching
                </button>
              </div>

              {/* Tab content */}
              <div className="mt-6 bg-[#FAFAFA] p-6 rounded-lg">
                <p className="text-sm leading-relaxed text-text-secondary mb-6">
                  {tabContent[activeTab].description}
                </p>
                <Link
                  href={tabContent[activeTab].link}
                  className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-transparent px-6 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-colors"
                  >
                    <path
                      d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>{tabContent[activeTab].cta}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW THE PROGRAM WORKS SECTION ===== */}
      <section className="relative w-full bg-black px-6 py-16 lg:px-12 lg:py-24 overflow-hidden">
        {/* Background overlay image - repeating pattern */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "url('/images/imgs/How the program works bg overlay.webp')",
            backgroundSize: "700px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Decorative illustration - right side */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden lg:block z-10">
          <Image
            src="/images/imgs/about us our story or journey top right.webp"
            alt=""
            width={80}
            height={80}
            className="h-auto w-16 lg:w-20"
          />
        </div>

        <div className="mx-auto max-w-[1320px] relative z-10">
          <h2 className="mb-12 text-center text-3xl font-medium text-white lg:text-4xl">
            How the program works
          </h2>

          {/* Steps */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">One</p>
              <p className="text-white text-base">
                Application & Selection — eligibility review, interviews
              </p>
            </div>
            <div>
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">Two</p>
              <p className="text-white text-base">Onboarding & Orientation</p>
            </div>
            <div>
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">Three</p>
              <p className="text-white text-base">
                Support & Implementation — disbursement, mentorship, check-ins
              </p>
            </div>
            <div>
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">Four</p>
              <p className="text-white text-base">
                Progress & Reporting — milestone metrics, community sharing
              </p>
            </div>
            <div>
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">Five</p>
              <p className="text-white text-base">Graduation & Alumni Network</p>
            </div>
          </div>

          {/* Apply Now button */}
          <div className="mt-12 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z"
                  fill="currentColor"
                />
              </svg>
              <span>Apply Now</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
