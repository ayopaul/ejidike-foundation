// app/mentorship/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export default function MentorshipPage() {
  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto max-w-container space-y-16">
          {/* Intro */}
          <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
                Mentorship
              </p>
              <h1 className="mb-4 text-3xl font-medium sm:text-4xl">
                Capital alone seldom suffices.
              </h1>
              <p className="mb-4 text-base leading-relaxed text-text-secondary">
                Funding can unlock doors, but it rarely answers every question.
                Young people also need guidance, encouragement, and the wisdom
                of those who have walked similar paths.
              </p>
              <p className="text-base leading-relaxed text-text-secondary">
                Ejidike’s mentorship network brings together youth with mentors
                who help them sharpen ideas, stay accountable, and navigate the
                realities behind their ambitions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-[10px] bg-brand-yellow px-7 py-3 text-sm font-medium text-text-primary shadow-btn hover:-translate-y-[1px] hover:shadow-btnHover">
                  <span>Request mentorship</span>
                  <span>➜</span>
                </button>
                <button className="inline-flex items-center gap-2 rounded-[10px] border border-brand-yellow bg-transparent px-7 py-3 text-sm font-medium text-text-primary hover:bg-brand-yellow">
                  <span>Apply to be a mentor</span>
                  <span>➜</span>
                </button>
              </div>
            </div>

            <div className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h2 className="mb-3 text-lg font-semibold">
                Why mentorship matters
              </h2>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                Mentors open doors, challenge assumptions, and share practical
                shortcuts that are hard to find alone. Research shows that
                mentored youth tend to stay longer in school, grow faster in
                business, and make more informed life decisions.
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                Through Ejidike, youth gain not just a contact, but a
                relationship—someone genuinely invested in their progress.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h3 className="mb-2 text-base font-semibold">Matchmaking</h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                We pair mentors and protégés based on goals, sector interests,
                and interpersonal fit so that the relationship feels natural and
                productive.
              </p>
            </div>

            <div className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h3 className="mb-2 text-base font-semibold">Structure</h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                The program includes regular check-ins, goal-setting sessions,
                and feedback loops so that progress can be tracked, not just
                hoped for.
              </p>
            </div>

            <div className="rounded-card bg-surface-white/90 p-6 shadow-card">
              <h3 className="mb-2 text-base font-semibold">
                Tools &amp; resources
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Participants gain access to learning modules, group workshops,
                and networking events designed to complement one-on-one
                mentoring.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}