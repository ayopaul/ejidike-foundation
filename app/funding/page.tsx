// app/funding/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export default function FundingPage() {
  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto max-w-container space-y-16">
          {/* Types of support */}
          <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
                Funding
              </p>
              <h1 className="mb-4 text-3xl font-medium sm:text-4xl">
                Types of support
              </h1>
              <p className="mb-4 text-base leading-relaxed text-text-secondary">
                Our funding streams are built to unlock transformation, not
                dependency. Each grant is paired with accountability and
                long-term growth support.
              </p>
              <p className="text-base leading-relaxed text-text-secondary">
                We invest in people— their ideas, their effort, and their
                commitment to create lasting change in their communities.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-brand-yellow px-7 py-3 text-sm font-medium text-text-primary shadow-btn hover:-translate-y-[1px] hover:shadow-btnHover">
                <span>Start Your Grant Application</span>
                <span>➜</span>
              </button>
            </div>

            <div className="space-y-5">
              <div
                id="education-grants"
                className="rounded-card bg-surface-white/90 p-5 shadow-card"
              >
                <h2 className="mb-2 text-lg font-semibold">Education grants</h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Support that can cover all or part of tuition, textbooks,
                  learning materials, and digital access so students can stay in
                  school and graduate.
                </p>
              </div>

              <div
                id="business-grants"
                className="rounded-card bg-surface-white/90 p-5 shadow-card"
              >
                <h2 className="mb-2 text-lg font-semibold">Business grants</h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Seed and early-stage capital for youth-led ventures focused on
                  social and economic impact in their communities.
                </p>
              </div>
            </div>
          </div>

          {/* Eligibility & Grant details */}
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-xl font-semibold">Eligibility criteria</h2>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>● Age range or current student status requirements.</li>
                <li>● Minimum academic or performance threshold.</li>
                <li>● For business grants, basic venture maturity level.</li>
                <li>● Clear potential for social or community impact.</li>
                <li>● Commitment to reporting, mentorship, and ethical use.</li>
              </ul>
              <button className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-brand-yellow px-7 py-3 text-sm font-medium text-text-primary shadow-btn hover:-translate-y-[1px] hover:shadow-btnHover">
                <span>Apply Now</span>
                <span>➜</span>
              </button>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold">
                Grant structure & reporting
              </h2>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>● Typical grant size or range depending on program.</li>
                <li>● Fixed duration (e.g. one academic year or 12 months).</li>
                <li>● Disbursement in agreed tranches or milestones.</li>
                <li>
                  ● Spending focused on learning, capital, training, or
                  equipment—not personal consumption.
                </li>
                <li>
                  ● Regular progress updates, mentor check-ins, and basic
                  financial tracking.
                </li>
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Where standards are not met, grants may be paused or recovered
                in line with our governance framework.
              </p>
            </div>
          </div>

          {/* Application process */}
          <div className="rounded-card bg-surface-white/90 p-8 shadow-card">
            <h2 className="mb-4 text-2xl font-semibold">Application process</h2>
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">
              All applicants go through a clear and structured process so that
              funding reaches those who are ready to use it responsibly and
              effectively.
            </p>
            <ol className="space-y-3 text-sm text-text-secondary">
              <li>
                01 / Submit your application form and required documents online.
              </li>
              <li>
                02 / Shortlisted candidates may be invited for interviews or
                pitch sessions.
              </li>
              <li>
                03 / Selected grantees are onboarded with a clear agreement and
                expectations.
              </li>
              <li>
                04 / Throughout the cycle, we expect honest reporting and
                responsiveness.
              </li>
              <li>
                05 / At the end of the grant period, we review outcomes and
                lessons learned together.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}