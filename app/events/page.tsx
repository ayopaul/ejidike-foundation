// app/events/page.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { format, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  image_url?: string;
  is_published: boolean;
}

type ViewMode = "upcoming" | "past" | "date";

export default function EventsPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [eventsVisible, setEventsVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const eventsRef = useRef<HTMLElement>(null);

  // Show only first 3 events initially, or all if "Check out more" is clicked
  const displayedEvents = showAll ? events : events.slice(0, 3);
  const hasMoreEvents = events.length > 3;

  // Fetch events based on view mode
  const fetchEvents = useCallback(async (mode: ViewMode, date?: Date) => {
    setLoading(true);
    const now = new Date();

    try {
      let query = supabase
        .from("events")
        .select("*")
        .eq("is_published", true);

      if (mode === "upcoming") {
        // Future events from today onwards
        query = query
          .gte("event_date", now.toISOString())
          .order("event_date", { ascending: true });
      } else if (mode === "past") {
        // Past events before today
        query = query
          .lt("event_date", now.toISOString())
          .order("event_date", { ascending: false });
      } else if (mode === "date" && date) {
        // Events from now until the selected date
        const endDate = endOfDay(date).toISOString();
        query = query
          .gte("event_date", now.toISOString())
          .lte("event_date", endDate)
          .order("event_date", { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
      }

      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
      setShowAll(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEvents("upcoming");
  }, [fetchEvents]);

  // Handle view past events (left arrow)
  const handleViewPast = () => {
    setViewMode("past");
    setSelectedDate(undefined);
    fetchEvents("past");
  };

  // Handle view future events (right arrow)
  const handleViewFuture = () => {
    setViewMode("upcoming");
    setSelectedDate(undefined);
    fetchEvents("upcoming");
  };

  // Handle "Today" click - reset to upcoming events
  const handleToday = () => {
    setViewMode("upcoming");
    setSelectedDate(undefined);
    fetchEvents("upcoming");
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setViewMode("date");
      fetchEvents("date", date);
      setCalendarOpen(false);
    }
  };

  // Get display text for date range
  const getDateRangeText = () => {
    if (viewMode === "past") {
      return "Past Events";
    } else if (viewMode === "date" && selectedDate) {
      return `Now - ${format(selectedDate, "MMMM d")}`;
    } else {
      // Default: Now - end of year
      const endOfYear = new Date(new Date().getFullYear(), 11, 31);
      return `Now - ${format(endOfYear, "MMMM d")}`;
    }
  };

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
    const eventsObserver = createObserver(setEventsVisible);

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (eventsRef.current) eventsObserver.observe(eventsRef.current);

    return () => {
      heroObserver.disconnect();
      eventsObserver.disconnect();
    };
  }, []);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d '@' h:mm a");
  };

  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24">
        {/* Decorative squiggly illustration - left side */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block">
          <Image
            src="/images/imgs/letmuc7xj68bx9rcq1ng.webp"
            alt=""
            width={60}
            height={100}
            className="h-auto w-12 opacity-60"
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
              src="/images/imgs/Ejidikeevents.webp"
              alt="Events at Ejidike Foundation"
              width={1200}
              height={400}
              className="w-full h-[300px] lg:h-[400px] object-cover"
              priority
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white text-center leading-snug max-w-2xl">
                Stay current on what we&apos;re doing, where we&apos;re going, and ways to engage.
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ===== UPCOMING EVENTS SECTION ===== */}
      <section ref={eventsRef} className="w-full bg-[#FBF4EE] px-6 pb-16 lg:px-12 lg:pb-24">
        <div className="mx-auto w-[90%] lg:w-[80%]">
          {/* Section Title */}
          <h2 className="text-3xl lg:text-4xl font-normal mb-6">
            Upcoming Events / Program<br />Deadlines
          </h2>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-8 bg-[#F5EDE6] rounded-lg px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Left arrow - View past events */}
              <button
                onClick={handleViewPast}
                className={`p-1 transition ${viewMode === "past" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                title="View past events"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Right arrow - View future events */}
              <button
                onClick={handleViewFuture}
                className={`p-1 transition ${viewMode === "upcoming" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                title="View upcoming events"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Today button */}
              <button
                onClick={handleToday}
                className={`text-sm font-medium transition ${viewMode === "upcoming" && !selectedDate ? "text-gray-900 underline underline-offset-4" : "text-gray-600 hover:text-gray-900"}`}
              >
                Today
              </button>
            </div>

            {/* Date picker */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4 transition">
                  {getDateRangeText()}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Events Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl overflow-hidden">
                  <div className="h-56 bg-gray-200" />
                  <div className="bg-[#F5EDE6] p-5">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
                    <div className="h-10 bg-gray-200 rounded w-28" />
                  </div>
                </div>
              ))
            ) : events && events.length > 0 ? (
              displayedEvents.map((event, index) => (
                <article
                  key={event.id}
                  className={`flex flex-col rounded-xl overflow-hidden shadow-sm transition-all duration-700 ease-out ${
                    eventsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Event Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-500 to-blue-700">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="flex flex-col flex-1 bg-[#F5EDE6] p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                      {event.description}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mb-4">
                      {formatEventDate(event.event_date)}
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#FFCE4C] px-5 py-2.5 text-sm font-medium text-gray-900 w-fit transition hover:bg-[#f5c43d]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Register</span>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              // No events state - show helpful message
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 mb-4">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {viewMode === "past"
                    ? "No past events found"
                    : viewMode === "date" && selectedDate
                    ? `No events until ${format(selectedDate, "MMMM d, yyyy")}`
                    : "No upcoming events"}
                </h3>
                <p className="text-sm text-gray-600 max-w-md">
                  {viewMode === "past"
                    ? "There are no past events to display."
                    : viewMode === "date"
                    ? "Try selecting a later date or view all upcoming events."
                    : "Check back soon for new events and program deadlines."}
                </p>
                {viewMode !== "upcoming" && (
                  <button
                    onClick={handleToday}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FFCE4C] px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-[#f5c43d]"
                  >
                    View Upcoming Events
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Check out more button - circular design with curved text */}
          {!loading && hasMoreEvents && !showAll && (
            <div className="flex justify-center mt-16">
              <button
                onClick={() => setShowAll(true)}
                className="relative group"
              >
                {/* Circular button */}
                <div className="w-20 h-20 rounded-full bg-[#002039] flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* Curved text around the button */}
                <svg className="absolute -inset-4 w-28 h-28" viewBox="0 0 120 120">
                  <defs>
                    <path id="curve" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" fill="none"/>
                  </defs>
                  <text className="text-[11px] fill-gray-600 uppercase tracking-[0.2em]">
                    <textPath href="#curve" startOffset="62%">
                      Check out more
                    </textPath>
                  </text>
                </svg>
              </button>
            </div>
          )}

          {/* Show less button - only show when viewing all events */}
          {!loading && showAll && hasMoreEvents && (
            <div className="flex justify-center mt-16">
              <button
                onClick={() => setShowAll(false)}
                className="relative group"
              >
                {/* Circular button */}
                <div className="w-20 h-20 rounded-full bg-[#002039] flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 15L12 9L6 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* Curved text around the button */}
                <svg className="absolute -inset-4 w-28 h-28" viewBox="0 0 120 120">
                  <defs>
                    <path id="curveUp" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" fill="none"/>
                  </defs>
                  <text className="text-[11px] fill-gray-600 uppercase tracking-[0.2em]">
                    <textPath href="#curveUp" startOffset="68%">
                      Show less
                    </textPath>
                  </text>
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== VIEW MORE EVENTS SECTION ===== */}
      <section className="w-full bg-[#FBF4EE] px-6 pb-16 lg:px-12 lg:pb-24">
        <div className="mx-auto w-[90%] lg:w-[80%] text-center">
          <p className="text-sm text-text-secondary mb-4 uppercase tracking-wider">View more events</p>
          <div className="flex justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
