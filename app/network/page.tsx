// app/network/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";

export default function NetworkPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setHeroVisible(true);
        } else {
          setHeroVisible(false);
        }
      });
    }, observerOptions);

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
        } else {
          setSectionVisible(false);
        }
      });
    }, observerOptions);

    if (heroRef.current) {
      heroObserver.observe(heroRef.current);
    }
    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    return () => {
      heroObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="w-full bg-[#FBF4EE] px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto w-[90%] lg:w-[80%]">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Left side - Text content */}
            <div>
              <h1 className="mb-6 text-3xl font-medium leading-snug lg:text-4xl">
                Capital alone seldom suffices
              </h1>
              <p className="text-base leading-relaxed text-text-secondary mb-6 max-w-md">
                Guided learning, emotional support, and experience-sharing are key to sustained success. That&apos;s where mentorship steps in.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-6 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
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
                <span>Request Mentorship</span>
              </Link>
            </div>

            {/* Right side - Image */}
            <div className="flex justify-center lg:justify-end">
              <div
                className={`transition-all duration-1000 ease-out ${
                  heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
              >
                <Image
                  src="/images/imgs/main header image.webp"
                  alt="Mentorship session"
                  width={540}
                  height={420}
                  className="w-full max-w-[540px] h-auto rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY MENTORSHIP MATTERS & HOW IT WORKS SECTION ===== */}
      <section ref={sectionRef} className="w-full bg-[#F2E8DF] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto w-[90%] lg:w-[80%]">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left Column */}
            <div>
              {/* Why Mentorship Matters */}
              <h2 className="mb-6 text-2xl font-medium lg:text-3xl">
                Why Mentorship Matters
              </h2>

              {/* Top Left Image */}
              <div
                className={`mb-8 transition-all duration-700 ease-out ${
                  sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <Image
                  src="/images/imgs/Top left image.webp"
                  alt="Mentorship matters"
                  width={420}
                  height={336}
                  className="w-full max-w-[420px] h-auto rounded-2xl object-cover"
                />
              </div>

              {/* Horizontal divider */}
              <div className="max-w-[420px] h-[1px] bg-[#97928F] mb-8" />

              {/* How it works */}
              <div className="max-w-[420px]">
                <h2 className="mb-4 text-2xl font-medium lg:text-3xl">How it works</h2>
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    <span className="font-medium text-black">Matchmaking:</span> We pair protégés and mentors based on goals, sector, and chemistry.
                  </p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    <span className="font-medium text-black">Structure:</span> Scheduled check-ins, goal setting, feedback loops.
                  </p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    <span className="font-medium text-black">Tools & Resources:</span> Learning modules, group workshops, networking events.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col">
              {/* Text content */}
              <p className="text-base leading-relaxed text-text-secondary mb-[40px] max-w-md">
                Mentors help sharpen ideas, open doors, challenge assumptions, and build confidence. Studies show mentored youth are more likely to succeed long term.
              </p>

              {/* Bottom Right Image - aligned to left of paragraph above */}
              <div
                className={`mt-auto transition-all duration-700 ease-out ${
                  sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <Image
                  src="/images/imgs/Bottom right image.webp"
                  alt="Mentor speaking"
                  width={420}
                  height={336}
                  className="w-full max-w-[420px] h-auto rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 items-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-6 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
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
              <span>Apply to be a Mentor</span>
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-black underline transition hover:no-underline hover:border-2 hover:border-black hover:rounded-[10px] hover:px-6 hover:py-3"
            >
              Request Mentorship
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
