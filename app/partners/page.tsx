// app/partners/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export default function PartnersPage() {
  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto max-w-container space-y-16">
          {/* Intro + why partners */}
          <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
                Partners
              </p>
              <h1 className="mb-4 text-3xl font-medium sm:text-4xl">
                Stronger together.
              </h1>
              <p className="mb-4 text-base leading-relaxed text-text-secondary">
                When funders, institutions, and practitioners come together, we
                can reach more youth, test better ideas, and shift systems—not
                just individual stories.
              </p>
              <p className="text-base leading-relaxed text-text-secondary">
                Ejidike partners with organisations that share a commitment to
                inclusion, transparency, and youth leadership.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-brand-yellow px-7 py-3 text-sm font-medium text-text-primary shadow-btn hover:-translate-y-[1px] hover:shadow-btnHover">
                <span>Become a partner</span>
                <span>➜</span>
              </button>
            </div>

            <div className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h2 className="mb-3 text-lg font-semibold">Why partner with us</h2>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  ● Deep youth networks and community relationships across
                  Nigeria.
                </li>
                <li>
                  ● Clear impact tracking, reporting, and learning loops for
                  every initiative.
                </li>
                <li>
                  ● Flexible collaboration models: CSR funding, program
                  sponsorship, co-designed pilots, and more.
                </li>
              </ul>
              <button className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-brand-yellow bg-transparent px-6 py-2 text-xs font-medium text-text-primary hover:bg-brand-yellow">
                <span>Discuss partnership ideas</span>
                <span>➜</span>
              </button>
            </div>
          </div>

          {/* Partnership models */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Partnership models</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-card bg-surface-white/90 p-5 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">
                  Funding partner / donor
                </h3>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Provide direct resources for grants, scholarships, or specific
                  program lines.
                </p>
              </div>

              <div className="rounded-card bg-surface-white/90 p-5 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">Program partner</h3>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Co-design and run training, accelerators, or community
                  projects with the Ejidike team.
                </p>
              </div>

              <div className="rounded-card bg-surface-white/90 p-5 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">
                  Corporate / internship partner
                </h3>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Offer internships, placements, or on-the-job learning for our
                  youth beneficiaries.
                </p>
              </div>

              <div className="rounded-card bg-surface-white/90 p-5 shadow-card">
                <h3 className="mb-1 text-sm font-semibold">
                  Technical / advisory partner
                </h3>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Share domain expertise, curriculum support, or strategic
                  guidance to strengthen our programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}