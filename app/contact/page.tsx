// app/contact/page.tsx
"use client";

import React, { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { createSupabaseClient } from "@/lib/supabase";
import Turnstile, { BoundTurnstileObject } from "react-turnstile";

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [boundTurnstile, setBoundTurnstile] = useState<BoundTurnstileObject | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!captchaToken) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify captcha on the server
      const captchaResponse = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });

      const captchaResult = await captchaResponse.json();
      if (!captchaResult.success) {
        throw new Error("Captcha verification failed");
      }

      const supabase = createSupabaseClient();

      const { error } = await supabase
        .from("contact_messages")
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus("success");
      setFormData({ full_name: "", email: "", message: "" });
      setCaptchaToken(null);
      boundTurnstile?.reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus("error");
      boundTurnstile?.reset();
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

          <div className="bg-surface-white/95 p-6 shadow-card" style={{ borderRadius: '20px', border: '3px solid #000000' }}>
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
              <div className="flex justify-center">
                <Turnstile
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token: string, _preClearanceObtained: boolean, boundTurnstileObj: BoundTurnstileObject) => {
                    setCaptchaToken(token);
                    setBoundTurnstile(boundTurnstileObj);
                  }}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                  theme="light"
                  size="normal"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !captchaToken}
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