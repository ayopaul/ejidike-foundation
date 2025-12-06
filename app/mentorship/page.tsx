// app/mentorship/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";

export default function MentorshipPage() {
  const [introVisible, setIntroVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  const introRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const introObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIntroVisible(true);
        } else {
          setIntroVisible(false);
        }
      });
    }, observerOptions);

    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
        } else {
          setCardsVisible(false);
        }
      });
    }, observerOptions);

    if (introRef.current) {
      introObserver.observe(introRef.current);
    }
    if (cardsRef.current) {
      cardsObserver.observe(cardsRef.current);
    }

    return () => {
      introObserver.disconnect();
      cardsObserver.disconnect();
    };
  }, []);

  return (
    <SiteLayout>
      {/* ===== INTRODUCTION SECTION ===== */}
      <section
        ref={introRef}
        className="relative w-full bg-[#FBF4EE] px-6 py-12 lg:px-12 lg:py-16 overflow-hidden"
        style={{
          backgroundImage: "url('/images/imgs/Mentorship heading overlay.webp')",
          backgroundPosition: "right bottom",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto w-[90%] lg:w-[80%]">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Left side - Text content */}
            <div>
              <h1 className="mb-6 text-3xl font-medium leading-snug lg:text-4xl">
                Introduction
              </h1>
              <p className="text-base leading-relaxed text-text-secondary mb-6 max-w-md">
                Capital alone seldom suffices. Guided learning, emotional support, and experience-sharing are key to sustained success. That&apos;s where mentorship steps in.
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
                <span>How it works</span>
              </Link>
            </div>

            {/* Right side - Image */}
            <div className="flex justify-center lg:justify-end">
              <div
                className={`transition-all duration-1000 ease-out ${
                  introVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
              >
                <Image
                  src="/images/imgs/mentors header image .webp"
                  alt="Mentorship session"
                  width={450}
                  height={350}
                  className="w-full max-w-[450px] h-auto rounded-2xl object-cover border border-black"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY MENTORSHIP MATTERS SECTION ===== */}
      <section className="relative w-full bg-black px-6 py-16 lg:px-12 lg:py-24 overflow-hidden">
        {/* Background overlay image - repeating pattern */}
        <div
          className="absolute inset-0"
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
          <h2 className="mb-6 text-3xl font-medium lg:text-4xl text-white">
            Why Mentorship Matters
          </h2>
          <p className="text-base leading-relaxed text-white/80 mb-6 max-w-3xl">
            Mentors help sharpen ideas, open doors, challenge assumptions, and build confidence. Studies show mentored youth are more likely to succeed long term.
          </p>
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
            <span>Request Mentorship</span>
          </Link>
        </div>
      </section>

      {/* ===== THREE CARDS SECTION ===== */}
      <section className="w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24">
        <div ref={cardsRef} className="mx-auto w-[90%] lg:w-[80%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            {/* Matchmaking Card */}
            <div
              className={`bg-white border-[3px] border-black rounded-[8px] p-8 text-center w-full max-w-[320px] transition-all duration-700 ease-out ${
                cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="mb-4 flex justify-center">
                <Image
                  src="/images/imgs/Matchmaking icon.webp"
                  alt="Matchmaking"
                  width={60}
                  height={60}
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h3 className="mb-3 text-xl font-medium text-black">Matchmaking</h3>
              <p className="text-sm leading-relaxed text-black/80">
                We pair protégés and mentors based on goals, sector, and chemistry.
              </p>
            </div>

            {/* Structure Card */}
            <div
              className={`bg-white border-[3px] border-black rounded-[8px] p-8 text-center w-full max-w-[320px] transition-all duration-700 ease-out ${
                cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="mb-4 flex justify-center">
                <Image
                  src="/images/imgs/Structure icons.webp"
                  alt="Structure"
                  width={60}
                  height={60}
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h3 className="mb-3 text-xl font-medium text-black">Structure</h3>
              <p className="text-sm leading-relaxed text-black/80">
                Scheduled check-ins, goal setting, feedback loops.
              </p>
            </div>

            {/* Tools & Resources Card */}
            <div
              className={`bg-white border-[3px] border-black rounded-[8px] p-8 text-center w-full max-w-[320px] transition-all duration-700 ease-out ${
                cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="mb-4 flex justify-center">
                <Image
                  src="/images/imgs/Tools & resources icon.webp"
                  alt="Tools & Resources"
                  width={60}
                  height={60}
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h3 className="mb-3 text-xl font-medium text-black">Tools & Resources</h3>
              <p className="text-sm leading-relaxed text-black/80">
                Learning modules, group workshops, networking events.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 items-center">
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
