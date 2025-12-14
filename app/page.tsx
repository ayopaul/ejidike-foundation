// app/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [ambitionVisible, setAmbitionVisible] = useState(false);
  const [nextGenVisible, setNextGenVisible] = useState(false);
  const [startVisible, setStartVisible] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const ambitionRef = useRef<HTMLDivElement>(null);
  const nextGenRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);

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
    const ambitionObserver = createObserver(setAmbitionVisible);
    const nextGenObserver = createObserver(setNextGenVisible);
    const startObserver = createObserver(setStartVisible);

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (ambitionRef.current) ambitionObserver.observe(ambitionRef.current);
    if (nextGenRef.current) nextGenObserver.observe(nextGenRef.current);
    if (startRef.current) startObserver.observe(startRef.current);

    return () => {
      heroObserver.disconnect();
      ambitionObserver.disconnect();
      nextGenObserver.disconnect();
      startObserver.disconnect();
    };
  }, []);

  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 xl:py-24">
        <div className="mx-auto grid w-[90%] lg:w-[80%] gap-12 lg:grid-cols-[1.1fr,1fr] lg:items-center">
          {/* Left column */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
              Ejidike education foundation
            </p>

            <h1 className="mb-6 text-4xl font-medium leading-[1.5] sm:text-5xl lg:text-hero">
              Empowering<br />
              Youth to Learn,<br />
              Lead & Innovate
            </h1>

            <p className="mb-8 max-w-md text-base leading-relaxed text-text-secondary">
              We provide education funding, mentorship, and venture support so
              that young change-makers can transform dreams into impact.
            </p>

            <Link href="/browse-programs" className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                <path d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z" fill="currentColor"/>
              </svg>
              <span>Apply Now</span>
            </Link>
          </div>

          {/* Right column - Hero image */}
          <div
            className={`relative transition-all duration-1000 ease-out ${
              heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <Image
              src="/images/imgs/hero image.webp"
              alt="Young professional smiling"
              width={600}
              height={750}
              className="rounded-card object-cover shadow-card"
              priority
            />
          </div>
        </div>
      </section>

      {/* ===== FROM AMBITION TO ACTION (Dark Section) ===== */}
      <section
        ref={ambitionRef}
        className="relative w-full overflow-hidden bg-[#002039] py-20 lg:py-24"
        style={{
          backgroundImage: "url('/images/imgs/from-ambition-to-action-BG.webp')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      >
        {/* Decorative pattern - top left (squiggly line) */}
        <div className="absolute left-0 top-0">
          <Image
            src="/images/imgs/letmuc7xj68bx9rcq1ng.webp"
            alt=""
            width={50}
            height={50}
            className="h-auto w-8 opacity-30 lg:w-12"
          />
        </div>

        {/* Decorative pattern - bottom left (small dots grid) */}
        <div className="absolute bottom-0 left-0">
          <Image
            src="/images/imgs/qkfoompsadmvh1v7guqa.webp"
            alt=""
            width={60}
            height={60}
            className="h-auto w-10 opacity-30 lg:w-14"
          />
        </div>

        {/* Decorative pattern - top right (large dots grid) */}
        <div className="absolute right-0 top-0">
          <Image
            src="/images/imgs/gptxjsi2ddqrnbi0tt41.webp"
            alt=""
            width={120}
            height={120}
            className="h-auto w-20 opacity-30 lg:w-28"
          />
        </div>

        {/* Decorative pattern - bottom right (squiggly line) */}
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/imgs/letmuc7xj68bx9rcq1ng.webp"
            alt=""
            width={50}
            height={50}
            className="h-auto w-8 opacity-30 lg:w-12"
          />
        </div>

        <div className="relative mx-auto w-[90%] lg:w-[80%]">
          <h2 className="mb-16 text-center text-3xl font-medium text-white lg:text-4xl">
            From ambition to action
          </h2>

          <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
            {/* Education Grants */}
            <article
              className={`text-center text-white transition-all duration-700 ease-out ${
                ambitionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="mb-6 flex justify-center">
                <Image
                  src="/images/icons/Education-grants-icon.webp"
                  alt="Education Grants"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
              </div>
              <h3 className="mb-3 text-lg font-semibold">Education Grants</h3>
              <p className="text-sm leading-relaxed text-slate-200">
                Scholarships and support so students complete degrees
              </p>
            </article>

            {/* Business Grants */}
            <article
              className={`text-center text-white transition-all duration-700 ease-out ${
                ambitionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="mb-6 flex justify-center">
                <Image
                  src="/images/icons/Business-grants-icon.webp"
                  alt="Business Grants"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
              </div>
              <h3 className="mb-3 text-lg font-semibold">Business Grants</h3>
              <p className="text-sm leading-relaxed text-slate-200">
                Seed capital for youth-led ventures solving community problems
              </p>
            </article>

            {/* Mentorship Network */}
            <article
              className={`text-center text-white transition-all duration-700 ease-out ${
                ambitionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="mb-6 flex justify-center">
                <Image
                  src="/images/icons/Mentorship-network-icon.webp"
                  alt="Mentorship Network"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
              </div>
              <h3 className="mb-3 text-lg font-semibold">Mentorship Network</h3>
              <p className="text-sm leading-relaxed text-slate-200">
                Guidance, coaching, and peer support from seasoned leaders
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== WE BACK THE NEXT GENERATION ===== */}
      <section ref={nextGenRef} className="relative w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24 overflow-hidden">
        {/* Bottom right illustration */}
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/imgs/webackthenextgenerationbottomright.webp"
            alt=""
            width={150}
            height={150}
            className="h-auto w-24 lg:w-36"
          />
        </div>

        <div className="relative mx-auto grid w-[90%] lg:w-[80%] gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left - Image */}
          <div
            className={`relative transition-all duration-1000 ease-out ${
              nextGenVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <Image
              src="/images/imgs/We back the next generation of.webp"
              alt="Young Nigerian leaders and creators"
              width={600}
              height={600}
              className="h-auto w-full rounded-card object-cover"
            />
          </div>

          {/* Right - Text */}
          <div>
            <h2 className="mb-6 text-3xl font-medium leading-snug lg:text-4xl">
              We back the next generation of Nigerian leaders and creators.
            </h2>
            <Link href="/browse-programs" className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                <path d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z" fill="currentColor"/>
              </svg>
              <span>Apply Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DON'T KNOW HOW TO START (Dark Section) ===== */}
      <section ref={startRef} className="w-full bg-dark py-16 lg:py-24">
        <div className="mx-auto grid w-[90%] lg:w-[80%] gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left - Image */}
          <div
            className={`relative transition-all duration-1000 ease-out ${
              startVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <Image
              src="/images/imgs/dont-know-where-to-start.webp"
              alt="Don't know how to start?"
              width={600}
              height={450}
              className="h-auto w-full rounded-card object-cover"
            />
          </div>

          {/* Right - Text */}
          <div className="text-white">
            <h2 className="mb-6 text-3xl font-medium lg:text-4xl">
              Don't know how to start?
            </h2>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                <path d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z" fill="currentColor"/>
              </svg>
              <span>Contact us</span>
            </Link>
          </div>
        </div>
      </section>

      </SiteLayout>
  );
}