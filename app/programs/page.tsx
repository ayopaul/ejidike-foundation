// app/programs/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Link from "next/link";

export default function ProgramsPage() {
  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto max-w-container">
          {/* Overview */}
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
              Programs
            </p>
            <h1 className="mb-4 text-3xl font-medium leading-snug sm:text-4xl">
              Programs designed to support every stage of the journey.
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-secondary">
              From classrooms to startups, Ejidike offers tailored support for
              young people as they move from education into enterprise. Each
              program is structured so that no determined youth is left behind.
            </p>
          </div>

          {/* Three programs */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <article className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h2 className="mb-2 text-lg font-semibold">
                Education Grant Program
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                Grants that help cover tuition, learning materials, and digital
                access so students can complete their tertiary education.
              </p>
              <Link
                href="/funding#education-grants"
                className="inline-flex items-center gap-2 text-sm font-medium text-text-primary"
              >
                Apply for educational grant <span>➜</span>
              </Link>
            </article>

            <article className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h2 className="mb-2 text-lg font-semibold">
                Business Grant / Startup Support
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                Seed and early-stage support for youth-led ventures that are
                building solutions with clear community impact.
              </p>
              <Link
                href="/funding#business-grants"
                className="inline-flex items-center gap-2 text-sm font-medium text-text-primary"
              >
                Learn about business grants <span>➜</span>
              </Link>
            </article>

            <article className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h2 className="mb-2 text-lg font-semibold">
                Mentorship &amp; Coaching
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                Guided learning, accountability, and emotional support so youth
                can grow skills and navigate real-world challenges.
              </p>
              <Link
                href="/mentorship"
                className="inline-flex items-center gap-2 text-sm font-medium text-text-primary"
              >
                Explore mentorship <span>➜</span>
              </Link>
            </article>
          </div>

          {/* How it works timeline */}
          <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr,1fr]">
            <div>
              <h2 className="mb-4 text-2xl font-semibold">
                How the program works
              </h2>
              <ol className="space-y-4 text-sm text-text-secondary">
                <li>
                  <span className="font-semibold">One.</span> Application &
                  selection — eligibility checks, reviews, and interviews.
                </li>
                <li>
                  <span className="font-semibold">Two.</span> Onboarding &
                  orientation — setting expectations and success plans.
                </li>
                <li>
                  <span className="font-semibold">Three.</span> Support &
                  implementation — grant disbursement, mentorship, and regular
                  check-ins.
                </li>
                <li>
                  <span className="font-semibold">Four.</span> Progress &
                  reporting — tracking milestones, sharing learnings with the
                  community.
                </li>
                <li>
                  <span className="font-semibold">Five.</span> Graduation &
                  alumni — joining a growing network of peers and partners.
                </li>
              </ol>
              <button className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-brand-yellow px-7 py-3 text-sm font-medium text-text-primary shadow-btn hover:-translate-y-[1px] hover:shadow-btnHover">
                <span>Apply Now</span>
                <span>➜</span>
              </button>
            </div>

            <div className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h3 className="mb-3 text-lg font-semibold">At a glance</h3>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                Ejidike’s programs bring together funding, mentorship, and
                community to unlock potential. Each applicant is assessed not
                only on need, but also on drive, integrity, and the impact they
                want to create.
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                Our goal is simple: to help promising youth turn their plans
                into sustained progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}