// app/about/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export default function AboutPage() {
  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto flex max-w-container flex-col gap-10 lg:flex-row lg:items-start">
          {/* Left: main about text */}
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
              About us
            </p>

            <h1 className="mb-6 text-3xl font-medium leading-snug sm:text-4xl lg:text-5xl">
              We believe every young Nigerian deserves a real chance to thrive.
            </h1>

            <p className="mb-4 text-base leading-relaxed text-text-secondary">
              Regardless of background or where they are from, young people
              should have access to the tools, funding, and guidance they need
              to build a better future. Ejidike exists to close that gap through
              a blended approach: education, entrepreneurship, and mentorship
              working together.
            </p>

            <p className="mb-8 text-base leading-relaxed text-text-secondary">
              Our work grows from a simple belief: talent is universal, but
              opportunity is not. We are committed to expanding that opportunity
              for youth across Nigeria.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-[10px] bg-brand-yellow px-7 py-3 text-sm font-medium text-text-primary shadow-btn transition hover:-translate-y-[1px] hover:shadow-btnHover">
                <span>Apply Now</span>
                <span className="text-sm">➜</span>
              </button>

              <button className="inline-flex items-center gap-2 rounded-[10px] border border-brand-yellow bg-transparent px-7 py-3 text-sm font-medium text-text-primary hover:bg-brand-yellow">
                <span>Mentorships available</span>
              </button>
            </div>
          </div>

          {/* Right: values */}
          <div className="max-w-xl space-y-6">
            <h2 className="text-xl font-semibold">Our values</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-card bg-surface-white/80 p-4 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">Vision</h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  A community where every young person is equipped and supported
                  to shape a brighter future.
                </p>
              </div>

              <div className="rounded-card bg-surface-white/80 p-4 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">Integrity</h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  We operate with transparency, fairness, and accountability in
                  every decision and partnership.
                </p>
              </div>

              <div className="rounded-card bg-surface-white/80 p-4 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">Empowerment</h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  Youth are not just recipients of support—they lead their own
                  growth and impact.
                </p>
              </div>

              <div className="rounded-card bg-surface-white/80 p-4 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">Collaboration</h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  We work with communities, institutions, and partners to
                  amplify what is possible.
                </p>
              </div>

              <div className="rounded-card bg-surface-white/80 p-4 shadow-card sm:col-span-2">
                <h3 className="mb-1 text-sm font-semibold">Innovation</h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  We champion creative, scalable approaches that tackle systemic
                  barriers to opportunity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Story / Governance */}
        <div className="mx-auto mt-16 grid max-w-container gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-semibold">Our story / journey</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Ejidike began in 2024 as a small grant initiative responding to
              the widening inequality many young Nigerians face. What started as
              a modest experiment has grown into a dynamic ecosystem combining
              funding, coaching, and community support.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Today, we back youth with ambition and a desire to serve their
              communities—helping them not just access opportunities, but also
              sustain and multiply them.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-semibold">
                Leadership &amp; governance
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                Ejidike is guided by a founding team, board, and core staff who
                bring experience across education, development, and business.
                Each leader carries a shared commitment to youth advancement and
                responsible stewardship of every naira entrusted to us.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold">
                Transparency &amp; accountability
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                We share annual reports, audited financial statements, and grant
                impact summaries. Stakeholders are invited to review our work
                and hold us to high standards as we grow the foundation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}