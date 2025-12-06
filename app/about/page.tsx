// app/about/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [visionVisible, setVisionVisible] = useState(false);
  const [storyVisible, setStoryVisible] = useState(false);
  const [leadershipVisible, setLeadershipVisible] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const leadershipRef = useRef<HTMLElement>(null);

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
    const visionObserver = createObserver(setVisionVisible);
    const storyObserver = createObserver(setStoryVisible);
    const leadershipObserver = createObserver(setLeadershipVisible);

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (visionRef.current) visionObserver.observe(visionRef.current);
    if (storyRef.current) storyObserver.observe(storyRef.current);
    if (leadershipRef.current) leadershipObserver.observe(leadershipRef.current);

    return () => {
      heroObserver.disconnect();
      visionObserver.disconnect();
      storyObserver.disconnect();
      leadershipObserver.disconnect();
    };
  }, []);

  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 xl:py-24 overflow-hidden">
        {/* Decorative illustration - top right */}
        <div className="absolute top-0 right-0">
          <Image
            src="/images/imgs/about us right illustration.webp"
            alt=""
            width={120}
            height={120}
            className="h-auto w-20 lg:w-28"
          />
        </div>

        <div className="mx-auto w-[90%] lg:w-[80%]">
          {/* About Us label */}
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
            About us
          </p>

          {/* Main heading */}
          <div className="mb-12">
            <h1 className="text-center text-3xl font-medium leading-snug sm:text-4xl lg:text-[42px] lg:leading-tight max-w-4xl mx-auto">
              We believe{" "}
              <span className="relative inline-block">
                every
                <Image
                  src="/images/imgs/about us underline .webp"
                  alt=""
                  width={100}
                  height={20}
                  className="absolute -bottom-1 left-0 w-full h-auto"
                />
              </span>{" "}
              young Nigerian regardless of background or geography deserves access to the tools, funding, and guidance needed to thrive.
            </h1>
          </div>

          {/* Images and content grid */}
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-[24px] items-start">
            {/* Left side - Image with built-in stripes */}
            <div
              className={`relative flex justify-center lg:justify-end transition-all duration-1000 ease-out ${
                heroVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
            >
              <Image
                src="/images/imgs/about us image left .webp"
                alt="Young professionals"
                width={400}
                height={500}
                className="w-[280px] h-auto lg:w-[380px]"
              />
            </div>

            {/* Right side - Text and CTA image */}
            <div className="space-y-6 mt-8 lg:mt-0">
              <p className="text-lg lg:text-xl leading-relaxed text-text-primary max-w-sm">
                We exist to close the opportunity gap through holistic support: education, entrepreneurship, and mentorship
              </p>

              {/* CTA Image with button */}
              <div
                className={`relative inline-block mx-auto lg:mx-0 transition-all duration-1000 ease-out ${
                  heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <Image
                  src="/images/imgs/about us image right .webp"
                  alt="Craftsman working"
                  width={375}
                  height={250}
                  className="rounded-2xl object-cover w-[75vw] h-auto lg:w-[375px] lg:h-[250px]"
                />
                {/* Overlay button - bottom right, extending outside */}
                <div className="absolute -bottom-6 -right-4 lg:-bottom-8 lg:-right-6 z-10">
                  <Link
                    href="/login"
                    className="inline-flex flex-col items-center justify-center rounded-2xl bg-[#0080FF] px-5 py-3 text-center  transition hover:bg-[#0070e0]"
                  >
                    <span className="text-[11px] text-white/90">Mentorships available</span>
                    <span className="text-lg font-semibold text-white">Enrol today</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VISION & VALUES SECTION ===== */}
      <section ref={visionRef} className="w-full bg-[#F2E8DF] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto w-[90%] lg:w-[80%]">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Vision - Left column */}
            <div
              className={`transition-all duration-700 ease-out ${
                visionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <h2 className="mb-4 text-3xl font-medium lg:text-4xl">Vision</h2>
              <p className="text-base leading-relaxed text-text-secondary">
                A community where every youth is empowered to build a brighter future.
              </p>
            </div>

            {/* Values - Middle column (Integrity & Collaboration + Apply Now button on desktop) */}
            <div
              className={`space-y-6 transition-all duration-700 ease-out ${
                visionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#1C6FAF]">Integrity</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  we act with transparency, accountability, and fairness.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#1C6FAF]">Collaboration</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  we amplify impact through partnerships and community.
                </p>
              </div>
              {/* Apply Now button - visible only on desktop */}
              <div className="pt-4 hidden lg:block">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                >
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                    <path d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z" fill="currentColor"/>
                  </svg>
                  <span>Apply Now</span>
                </Link>
              </div>
            </div>

            {/* Values - Right column (Empowerment & Innovation + Apply Now button on mobile) */}
            <div
              className={`space-y-6 transition-all duration-700 ease-out ${
                visionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#1C6FAF]">Empowerment</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  we enable youth to lead their own growth.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-[#1C6FAF]">Innovation</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  we champion creative, scalable solutions to systemic barriers
                </p>
              </div>
              {/* Apply Now button - visible only on mobile */}
              <div className="pt-4 lg:hidden">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                >
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                    <path d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z" fill="currentColor"/>
                  </svg>
                  <span>Apply Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OUR STORY / JOURNEY SECTION ===== */}
      <section ref={storyRef} className="relative w-full bg-[#002039] px-6 py-16 lg:px-12 lg:py-24 overflow-hidden">
        {/* Decorative illustration - top right */}
        <div className="absolute top-0 right-0">
          <Image
            src="/images/imgs/about us our story or journey top right.webp"
            alt=""
            width={100}
            height={100}
            className="h-auto w-16 lg:w-24 opacity-60"
          />
        </div>

        {/* Decorative illustration - bottom left */}
        <div className="absolute bottom-0 left-0">
          <Image
            src="/images/imgs/about us our story or journey illustration left.webp"
            alt=""
            width={100}
            height={100}
            className="h-auto w-16 lg:w-24 opacity-60"
          />
        </div>

        <div className="mx-auto w-[90%] lg:w-[80%]">
          <h2 className="mb-8 text-3xl font-medium text-white lg:text-4xl">
            Our story/Journey
          </h2>

          {/* Story content box */}
          <div
            className={`rounded-[20px] bg-[#FFCE4C] p-8 lg:p-12 w-full transition-all duration-1000 ease-out ${
              storyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-base leading-relaxed text-black">
              Founded in 2024 with a vision to reduce inequality, Ejidike began as a small grant initiative and has since evolved into a dynamic ecosystem empowering many in our communities. What started as a small experiment is now shaping the future of inclusive development blending capital with coaching to help individuals not just access opportunities but sustain them. As we look ahead, our focus remains clear: to expand impact, deepen partnerships, and build a future where every ambition has the support it deserves.
            </p>
          </div>
        </div>
      </section>

      {/* ===== LEADERSHIP & TRANSPARENCY SECTION ===== */}
      <section ref={leadershipRef} className="w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto w-[90%] lg:w-[80%]">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-0">
            {/* Leadership & Governance */}
            <div
              className={`flex-1 lg:pr-12 transition-all duration-700 ease-out ${
                leadershipVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
            >
              <h2 className="mb-4 text-xl font-medium text-text-primary">
                Leadership & Governance
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                Profiles of the founding team, board members, and key staff – each with a photo, brief bio, their role, and a quote about their commitment to youth advancement.
              </p>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-[1px] bg-[#D9D4CF]"></div>

            {/* Transparency & Accountability */}
            <div
              className={`flex-1 lg:pl-12 transition-all duration-700 ease-out ${
                leadershipVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <h2 className="mb-4 text-xl font-medium text-text-primary">
                Transparency & Accountability
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                We publish annual reports, audited financials, and grant impact summaries. We invite stakeholders to review our performance and hold us to the highest standards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
