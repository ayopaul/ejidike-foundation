// app/partners/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";

const partnershipModels = [
  {
    title: "Funding Partner / Donor",
    description: "Sponsor grants or programs",
    icon: "/images/imgs/Funding Partner _ Donor.webp",
  },
  {
    title: "Program Partner",
    description: "Run joint initiatives, training, or co-develop projects",
    icon: "/images/imgs/Program partner.webp",
  },
  {
    title: "Corporate / Internship Partner",
    description: "Offer placements and real-world experience",
    icon: "/images/imgs/Corporate _ Internship Partner.webp",
  },
  {
    title: "Technical / Advisory Partner",
    description: "Provide domain expertise, curriculum support",
    icon: "/images/imgs/Technical _ Advisory Partner.webp",
  },
];

export default function PartnersPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [networkVisible, setNetworkVisible] = useState(false);
  const [modelsVisible, setModelsVisible] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const networkRef = useRef<HTMLElement>(null);
  const modelsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const createObserver = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      return new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setter(true);
          }
        });
      }, observerOptions);
    };

    const heroObserver = createObserver(setHeroVisible);
    const networkObserver = createObserver(setNetworkVisible);
    const modelsObserver = createObserver(setModelsVisible);

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (networkRef.current) networkObserver.observe(networkRef.current);
    if (modelsRef.current) modelsObserver.observe(modelsRef.current);

    return () => {
      heroObserver.disconnect();
      networkObserver.disconnect();
      modelsObserver.disconnect();
    };
  }, []);

  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24">
        {/* Rainbow gradient overlay - positioned on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none overflow-hidden">
          <Image
            src="/images/imgs/partners main overlay.webp"
            alt=""
            fill
            className="object-cover object-left opacity-60"
          />
        </div>

        <div className="mx-auto w-[90%] lg:w-[80%]">
          {/* Hero Image with Text Overlay */}
          <div
            className={`relative overflow-hidden rounded-2xl transition-all duration-1000 ease-out ${
              heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <Image
              src="/images/imgs/partners main image.webp"
              alt="Partners at Ejidike Foundation"
              width={1200}
              height={400}
              className="w-full h-[300px] lg:h-[400px] object-cover"
              priority
            />
            {/* Text overlay on bottom left */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-2">
                Stronger together
              </h1>
              <p className="text-sm sm:text-base text-white/80 max-w-xl">
                partnership unlocks scale, innovation, and systemic change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEEP YOUTH NETWORKS SECTION ===== */}
      <section ref={networkRef} className="relative w-full bg-black px-6 py-16 lg:px-12 lg:py-24 overflow-hidden">
        {/* Background overlay image - repeating pattern */}
        <div
          className="absolute inset-0 opacity-100"
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
          <div
            className={`transition-all duration-1000 ease-out ${
              networkVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white mb-8">
              Deep youth networks across Nigeria
            </h2>

            <div className="space-y-4 mb-8">
              <p className="text-sm sm:text-base text-white/80">
                Transparent metrics and impact tracking
              </p>
              <p className="text-sm sm:text-base text-white/80">
                Flexible collaboration models (CSR funding, program sponsorship, co-design)
              </p>
            </div>

            <Link
              href="/register?role=partner"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFCE4C] px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-[#f5c43d]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Become a partner</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PARTNERSHIP MODELS SECTION ===== */}
      <section ref={modelsRef} className="w-full bg-[#F2E8DF] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto w-[90%] lg:w-[80%]">
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 text-center mb-12 transition-all duration-700 ease-out ${
              modelsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Partnership Models
          </h2>

          {/* Partnership Models Grid - 2x2 */}
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {partnershipModels.map((model, index) => (
              <div
                key={model.title}
                className={`relative overflow-hidden rounded-2xl bg-[#0080FF] min-h-[160px] transition-all duration-700 ease-out ${
                  modelsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Glass card effect with border */}
                <div className="absolute inset-0 rounded-2xl border border-white/10" />

                {/* Content - Icon on left, text on right */}
                <div className="relative z-10 flex h-full">
                  {/* Icon - fills left side with pass-through (no isolation) */}
                  <div className="relative w-2/5 h-full flex-shrink-0" style={{ isolation: 'auto' }}>
                    <Image
                      src={model.icon}
                      alt={model.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Text - right side with padding */}
                  <div className="flex-1 p-5 flex flex-col justify-center">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                      {model.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">
                      {model.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Become a Partner Button */}
          <div
            className={`flex justify-center mt-12 transition-all duration-700 ease-out ${
              modelsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <Link
              href="/register?role=partner"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFCE4C] px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-[#f5c43d]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Become a partner</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
