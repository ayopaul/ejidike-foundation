// app/funding/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";

export default function FundingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section className="w-full bg-[#FBF4EE] px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1320px]">
          {/* Black header box with text and images overlapping */}
          <div className="relative">
            {/* Black background box */}
            <div className="bg-black rounded-[20px] px-8 pt-12 pb-24 lg:px-16 lg:pt-16 lg:pb-64 w-[90%] mx-auto">
              {/* Header text */}
              <h1 className="text-center text-2xl font-medium leading-snug lg:text-4xl text-white">
                We believe in investing in people not just ideas.
              </h1>
            </div>

            {/* Three images row - positioned below the text, overlapping bottom of black box */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex justify-center items-start gap-4 lg:gap-6 w-full max-w-5xl">
              {/* Left image - aligned to top, slides from left */}
              <div
                className={`w-[180px] lg:w-[270px] self-start transition-all duration-700 ease-out ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                }`}
              >
                <Image
                  src="/images/imgs/funding-head-bottom-left.webp"
                  alt="Young professional"
                  width={270}
                  height={300}
                  className="w-full h-auto rounded-xl object-cover border border-black"
                />
              </div>

              {/* Middle image - larger, scales up */}
              <div
                className={`w-[270px] lg:w-[480px] transition-all duration-700 ease-out delay-150 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                }`}
              >
                <Image
                  src="/images/imgs/funding-head-middle.webp"
                  alt="Group of friends"
                  width={480}
                  height={420}
                  className="w-full h-auto rounded-xl object-cover border border-black"
                />
              </div>

              {/* Right image - aligned to bottom, slides from right */}
              <div
                className={`w-[180px] lg:w-[270px] self-end transition-all duration-700 ease-out delay-100 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
              >
                <Image
                  src="/images/imgs/funding-head-bottom-right.webp"
                  alt="Student studying"
                  width={270}
                  height={300}
                  className="w-full h-auto rounded-xl object-cover border border-black"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TYPES OF SUPPORT SECTION ===== */}
      <section className="w-full bg-[#FBF4EE] px-6 pt-32 pb-12 lg:px-12 lg:pt-44 lg:pb-16">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-12 lg:gap-0">
            {/* Left side - Types of support */}
            <div className="flex-1 lg:pr-12">
              <h2 className="mb-4 text-3xl font-medium lg:text-4xl">
                Types of support
              </h2>
              <p className="text-base leading-relaxed text-text-secondary mb-6">
                Our funding streams are designed to fuel transformation, not dependency.
              </p>
              <Link
                href="/login"
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
                <span>Start Your Grant Application</span>
              </Link>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-[1px] bg-[#D9D4CF]"></div>

            {/* Right side - Grant types */}
            <div className="flex-1 lg:pl-12 space-y-6">
              <div id="education-grants">
                <h3 className="mb-2 text-2xl font-medium">Education Grants</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Covering full or partial tuition, learning materials, and digital access.
                </p>
              </div>

              <div id="business-grants">
                <h3 className="mb-2 text-2xl font-medium">Business Grants</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Seed & early-stage funding for youth-led ventures with community impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ELIGIBILITY CRITERIA SECTION ===== */}
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
          <h2 className="mb-10 text-center text-3xl font-medium text-white lg:text-4xl">
            Eligibility criteria
          </h2>

          {/* Two column criteria list */}
          <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto mb-10">
            {/* Left column */}
            <div className="space-y-4">
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "0ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Age range or student status</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "250ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Academic / performance threshold</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Venture maturity (for business grants)</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "750ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Demonstrated social impact potential</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "1000ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Commitment to reporting & mentorship</p>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "125ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Grant Details / Structure</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "375ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Typical grant size / range</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "625ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Duration (e.g. one academic year, or 12 months)</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "875ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Disbursement schedule (e.g. installments)</p>
              </div>
              <div
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "1125ms" }}
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                <p className="text-white text-sm">Use limitations (capital, training, equipment, etc.)</p>
              </div>
            </div>
          </div>

          {/* Apply Now button */}
          <div className="text-center">
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
                className="transition-colors"
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

      {/* ===== APPLICATION PROCESS SECTION ===== */}
      <section className="w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto w-[90%] lg:w-[60%]">
          <h2 className="mb-4 text-3xl font-medium lg:text-4xl text-black">
            Application Process
          </h2>
          <p className="text-base leading-relaxed text-[#6E6E75] mb-10 max-w-2xl">
            We require periodic progress reports, mentor check-ins, audits, and feedback loops. Failure to meet standards may result in suspension or recovery of funds.
          </p>

          {/* Steps */}
          <div className="space-y-8">
            <div
              className={`flex items-start gap-[24px] border-b border-[#C8C3BD] pb-6 transition-all duration-500 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <span className="text-2xl font-medium text-[#6E6E75]">01/</span>
              <p className="text-sm leading-relaxed text-[#6E6E75] pt-1">
                Photo booth next level artisan messenger bag, dream catcher paleo neutral thundercats
              </p>
            </div>

            <div
              className={`flex items-start gap-[24px] border-b border-[#C8C3BD] pb-6 transition-all duration-500 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "250ms" }}
            >
              <span className="text-2xl font-medium text-[#6E6E75]">02/</span>
              <p className="text-sm leading-relaxed text-[#6E6E75] pt-1">
                Photo booth next level artisan messenger bag, dream catcher paleo neutral thundercats
              </p>
            </div>

            <div
              className={`flex items-start gap-[24px] border-b border-[#C8C3BD] pb-6 transition-all duration-500 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <span className="text-2xl font-medium text-[#6E6E75]">03/</span>
              <p className="text-sm leading-relaxed text-[#6E6E75] pt-1">
                Photo booth next level artisan messenger bag, dream catcher paleo neutral thundercats
              </p>
            </div>

            <div
              className={`flex items-start gap-[24px] border-b border-[#C8C3BD] pb-6 transition-all duration-500 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "750ms" }}
            >
              <span className="text-2xl font-medium text-[#6E6E75]">04/</span>
              <p className="text-sm leading-relaxed text-[#6E6E75] pt-1">
                Photo booth next level artisan messenger bag, dream catcher paleo neutral thundercats
              </p>
            </div>

            <div
              className={`flex items-start gap-[24px] border-b border-[#C8C3BD] pb-6 transition-all duration-500 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "1000ms" }}
            >
              <span className="text-2xl font-medium text-[#6E6E75]">05/</span>
              <p className="text-sm leading-relaxed text-[#6E6E75] pt-1">
                Photo booth next level artisan messenger bag, dream catcher paleo neutral thundercats
              </p>
            </div>
          </div>

          {/* Apply Now button */}
          <div className="mt-10 text-center">
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
                className="transition-colors"
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
