// app/contact/page.tsx
"use client";

import React, { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { createSupabaseClient } from "@/lib/supabase";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const supabase = createSupabaseClient();

      const { error } = await supabase
        .from("contact_messages")
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus("success");
      setFormData({ full_name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <SiteLayout>
      <section className="px-6 py-16 lg:px-16 xl:px-[300px] xl:py-24">
        <div className="mx-auto max-w-container grid gap-10 lg:grid-cols-[1.1fr,1fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
              Contact
            </p>
            <h1 className="mb-4 text-3xl font-medium sm:text-4xl">
              Don’t know how to start?
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-secondary">
              If you’re unsure which program is right for you, or you represent
              an organisation interested in partnering, we’re happy to talk.
            </p>
            <p className="text-base leading-relaxed text-text-secondary">
              Share a bit about yourself, your questions, or your idea, and a
              member of our team will follow up.
            </p>
          </div>

          <div className="rounded-card bg-surface-white/95 p-6 shadow-card">
            {submitStatus === "success" && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
                Thank you for contacting us! We'll get back to you soon.
              </div>
            )}
            {submitStatus === "error" && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                There was an error submitting your message. Please try again.
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Full name
                </label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-[10px] border border-border-default bg-white px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-yellow focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-[10px] border border-border-default bg-white px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-yellow focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  What would you like to talk about?
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-3xl border border-border-default bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-yellow focus:outline-none"
                  placeholder="Share your question, idea, or request..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-yellow px-7 py-2.5 text-sm font-medium text-text-primary shadow-btn hover:-translate-y-[1px] hover:shadow-btnHover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? "Sending..." : "Send message"}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}