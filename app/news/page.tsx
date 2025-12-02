// app/news/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";

const newsItems = [
  {
    title: "Ejidike announces 2025/2026 grant cycle",
    excerpt:
      "Key dates, eligibility highlights, and what’s new in this cycle of education and business grants.",
    tag: "Announcement",
    date: "Nov 15, 2025",
  },
  {
    title: "Meet some of our 2024 grantees",
    excerpt:
      "Stories from young Nigerians turning classroom learning and bold ideas into real-world change.",
    tag: "Impact stories",
    date: "Oct 2, 2025",
  },
  {
    title: "Why mentorship is at the heart of our model",
    excerpt:
      "A closer look at how mentorship complements funding and why we invest heavily in it.",
    tag: "Insight",
    date: "Sep 21, 2025",
  },
];

export default function NewsPage() {
  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto max-w-container">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
              News
            </p>
            <h1 className="mb-4 text-3xl font-medium sm:text-4xl">
              News &amp; updates
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-secondary">
              Follow our announcements, stories, and reflections as we learn and
              grow with the young people we serve.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {newsItems.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-card bg-surface-white/90 p-6 shadow-card"
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {item.tag}
                </p>
                <h2 className="mb-2 text-base font-semibold">{item.title}</h2>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-text-secondary">
                  {item.excerpt}
                </p>
                <p className="mb-3 text-[11px] text-text-muted">{item.date}</p>
                <button className="inline-flex items-center gap-2 text-xs font-medium text-text-primary">
                  <span>Read more</span>
                  <span>➜</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}