// app/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section className="w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 xl:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1.1fr,1fr] lg:items-center">
          {/* Left column */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
              Ejidike education foundation
            </p>

            <h1 className="mb-6 text-4xl font-medium leading-[1.5] sm:text-5xl lg:text-hero">
              Empowering<br />
              Nigeria's Youth to<br />
              Learn, Lead &<br />
              Innovate
            </h1>

            <p className="mb-8 max-w-md text-base leading-relaxed text-text-secondary">
              We provide education funding, mentorship, and venture support so
              that young change-makers can transform dreams into impact.
            </p>

            <Link href="/login" className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                <path d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z" fill="currentColor"/>
              </svg>
              <span>Apply Now</span>
            </Link>
          </div>

          {/* Right column - Hero image */}
          <div className="relative">
            <Image
              src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/hero%20image.png"
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
      <section className="relative w-full overflow-hidden bg-[#002039] py-20 lg:py-24">
        {/* Decorative pattern - top left (squiggly line) */}
        <div className="absolute left-8 top-8 lg:left-16 lg:top-12">
          <Image
            src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/eLearning-Shape-4.webp-min.png"
            alt=""
            width={50}
            height={50}
            className="h-auto w-8 opacity-30 lg:w-12"
          />
        </div>

        {/* Decorative pattern - bottom left (small dots grid) */}
        <div className="absolute bottom-16 left-4 lg:bottom-24 lg:left-8">
          <Image
            src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/eLearning-Shape-5.webp-min.png"
            alt=""
            width={60}
            height={60}
            className="h-auto w-10 opacity-30 lg:w-14"
          />
        </div>

        {/* Decorative pattern - top right (large dots grid) */}
        <div className="absolute right-4 top-4 lg:right-8 lg:top-8">
          <Image
            src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/eLearning-Shape-6.webp-min.png"
            alt=""
            width={70}
            height={70}
            className="h-auto w-12 opacity-30 lg:w-16"
          />
        </div>

        {/* Decorative pattern - bottom right (squiggly line) */}
        <div className="absolute bottom-8 right-8 lg:bottom-12 lg:right-16">
          <Image
            src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/eLearning-Shape-4.webp-min.png"
            alt=""
            width={50}
            height={50}
            className="h-auto w-8 opacity-30 lg:w-12"
          />
        </div>

        <div className="relative mx-auto max-w-[1320px] px-6 lg:px-12">
          <h2 className="mb-16 text-center text-3xl font-medium text-white lg:text-4xl">
            From ambition to action
          </h2>

          <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
            {/* Education Grants */}
            <article className="text-center text-white">
              <div className="mb-6 flex justify-center">
                <Image
                  src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/Education-grants-icon-min.png"
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
            <article className="text-center text-white">
              <div className="mb-6 flex justify-center">
                <Image
                  src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/Business-grants-icon-min.png"
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
            <article className="text-center text-white">
              <div className="mb-6 flex justify-center">
                <Image
                  src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/Mentorship-network-icon-min.png"
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
      <section className="w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left - Image */}
          <div className="relative">
            <Image
              src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/penultimate-section-image-min.png"
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
            <Link href="/login" className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-brand-yellow px-7 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                <path d="M6.80469 2.60547L7.57812 1.83203C7.92969 1.51562 8.45703 1.51562 8.77344 1.83203L15.6289 8.65234C15.9453 9.00391 15.9453 9.53125 15.6289 9.84766L8.77344 16.7031C8.45703 17.0195 7.92969 17.0195 7.57812 16.7031L6.80469 15.9297C6.48828 15.5781 6.48828 15.0508 6.80469 14.6992L11.0586 10.6562H0.96875C0.476562 10.6562 0.125 10.3047 0.125 9.8125V8.6875C0.125 8.23047 0.476562 7.84375 0.96875 7.84375H11.0586L6.80469 3.83594C6.48828 3.48438 6.45312 2.95703 6.80469 2.60547Z" fill="currentColor"/>
              </svg>
              <span>Apply Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DON'T KNOW HOW TO START (Dark Section) ===== */}
      <section className="w-full bg-dark py-16 lg:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-12">
          {/* Left - Image */}
          <div className="relative">
            <Image
              src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/website%20images/dont-know-where-to-start.png"
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