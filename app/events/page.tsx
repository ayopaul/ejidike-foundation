// app/events/page.tsx
import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { createServerClient } from "@/lib/supabase-server";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = await createServerClient();

  // Fetch published events ordered by date
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d '@' h:mm a");
  };
  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto max-w-container">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
              Events
            </p>
            <h1 className="mb-4 text-3xl font-medium sm:text-4xl">
              Upcoming events &amp; program deadlines
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-secondary">
              Stay updated on what we’re doing, where we’re going, and how you
              can plug in—from workshops and info sessions to key dates for
              applications.
            </p>
            <p className="inline-flex rounded-[10px] bg-dark-deep px-4 py-2 text-xs font-medium text-slate-100">
              Today · Now – December 31
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {events && events.length > 0 ? (
              events.map((event) => (
                <article
                  key={event.id}
                  className="flex h-full flex-col rounded-card bg-surface-white/90 p-6 shadow-card"
                >
                  <h2 className="mb-2 text-base font-semibold">
                    {event.title}
                  </h2>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-text-secondary">
                    {event.description}
                  </p>
                  <p className="mb-2 text-xs font-medium text-text-muted">
                    {formatEventDate(event.event_date)}
                  </p>
                  {event.location && (
                    <p className="mb-4 text-xs text-text-muted">
                      📍 {event.location}
                    </p>
                  )}
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-[10px] bg-brand-yellow px-5 py-2 text-xs font-medium text-text-primary shadow-btn hover:-translate-y-[1px] hover:shadow-btnHover"
                  >
                    <span>Register</span>
                    <span>➜</span>
                  </a>
                </article>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-text-secondary">
                  No upcoming events at this time. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}