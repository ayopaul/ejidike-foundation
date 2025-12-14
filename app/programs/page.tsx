// app/programs/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";

type TabType = "education" | "business" | "mentorship";

const tabContent: Record<TabType, { description: string; subItems?: { title: string; text: string }[]; cta: string; link: string }> = {
  education: {
    description:
      "Ejidike Educational Foundation offers scholarships to support students in completing their tertiary education. Applications are judged on both need and merit.",
    subItems: [
      {
        title: "Level 1 Scholarship",
        text: "Full coverage of tuition and living expenses up to a maximum of N500,000 per annum. Duration of support determined upon application review.",
      },
      {
        title: "Level 2 Scholarship",
        text: "Partial coverage of tuition and living expenses up to a maximum of N300,000. Duration of support determined upon application review.",
      },
    ],
    cta: "Apply for educational grant",
    link: "/login",
  },
  business: {
    description:
      "The foundation can approve up to N1,000,000 as a one-off grant for startup or expansion expenses. Funds can be used to acquire tools/equipment and cover business location costs. Special consideration for working capital with stricter disbursement criteria.",
    cta: "Apply for business grant",
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
  const [heroVisible, setHeroVisible] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const createObserver = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      return new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          setter(entry.isIntersecting);
        });
      }, observerOptions);
    };

    const heroObserver = createObserver(setHeroVisible);
    const stepsObserver = createObserver(setStepsVisible);

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (stepsRef.current) stepsObserver.observe(stepsRef.current);

    return () => {
      heroObserver.disconnect();
      stepsObserver.disconnect();
    };
  }, []);

  return (
    <SiteLayout>
      {/* ===== HERO & OVERVIEW SECTION ===== */}
      <section
        ref={heroRef}
        className="relative w-full bg-[#FBF4EE] px-6 py-12 lg:px-12 lg:py-16"
        style={{
          backgroundImage: "url('/images/imgs/program background.webp')",
          backgroundPosition: "left bottom",
          backgroundSize: "auto",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto w-[90%] lg:w-[80%]">
          {/* Header Image */}
          <div
            className={`flex justify-center mb-12 lg:mb-16 transition-all duration-1000 ease-out ${
              heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
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
            <div
              className={`transition-all duration-700 ease-out ${
                heroVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <h1 className="mb-6 text-3xl font-medium leading-snug lg:text-4xl">
                Overview
              </h1>
              <p className="text-base leading-relaxed text-text-secondary max-w-md">
                Every journey begins with a single step. At Ejidike, we offer programs tailored to each step of a youth&apos;s path from education to enterprise ensuring no one is left behind.
              </p>
            </div>

            {/* Right side - Tabs */}
            <div
              className={`transition-all duration-700 ease-out ${
                heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
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
                <p className="text-sm leading-relaxed text-text-secondary mb-4">
                  {tabContent[activeTab].description}
                </p>
                {tabContent[activeTab].subItems && (
                  <div className="space-y-4 mb-6">
                    {tabContent[activeTab].subItems.map((item, index) => (
                      <div key={index} className="border-l-2 border-[#0080FF] pl-4">
                        <h4 className="font-medium text-sm text-black mb-1">{item.title}</h4>
                        <p className="text-sm text-text-secondary">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {!tabContent[activeTab].subItems && <div className="mb-6" />}
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
      <section ref={stepsRef} className="relative w-full bg-black px-6 py-16 lg:px-12 lg:py-24 overflow-hidden">
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

        <div className="mx-auto w-[90%] lg:w-[80%] relative z-10">
          <h2 className="mb-12 text-center text-3xl font-medium text-white lg:text-4xl">
            How the program works
          </h2>

          {/* Application Window Info */}
          <div className="max-w-2xl mx-auto mb-10">
            <p className="text-slate-300 text-sm text-center leading-relaxed">
              Applications for education grants coincide with university admission and enrollment season in the later months of the year. Business grant application timelines are announced on the foundation website.
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div
              className={`transition-all duration-700 ease-out ${
                stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">Step One</p>
              <p className="text-white text-base">
                Online Application — Submit your application along with all required supporting documents (academic transcripts, personal statement, proof of enrollment) by the deadline.
              </p>
            </div>
            <div
              className={`transition-all duration-700 ease-out ${
                stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">Step Two</p>
              <p className="text-white text-base">
                Interview — Shortlisted candidates will be invited to an interview to discuss their qualifications and aspirations.
              </p>
            </div>
            <div
              className={`transition-all duration-700 ease-out ${
                stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <p className="text-[#FFCE4C] text-sm font-medium mb-1">Step Three</p>
              <p className="text-white text-base">
                Award Notification — Successful applicants receive an official award notification with instructions on how to accept the scholarship or grant.
              </p>
            </div>
          </div>

          {/* Apply Now button */}
          <div className="mt-12 text-center">
            <Link
              href="/browse-programs"
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
