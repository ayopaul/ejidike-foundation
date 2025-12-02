// app/admin/content/contact-messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { format } from "date-fns";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

function ContactMessagesContent() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      let query = supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-gray-100 text-gray-800",
      replied: "bg-green-100 text-green-800",
      archived: "bg-slate-100 text-slate-800",
    };

    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.new
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Contact Messages
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            View and manage contact form submissions
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2">
        {["all", "new", "read", "replied", "archived"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-brand-yellow text-text-primary"
                : "bg-surface-white text-text-secondary hover:bg-surface-cream"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {loading ? (
            <p className="text-text-secondary">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-text-secondary">No messages found.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  if (message.status === "new") {
                    updateStatus(message.id, "read");
                  }
                }}
                className={`cursor-pointer rounded-card p-4 shadow-card transition-all hover:shadow-lg ${
                  selectedMessage?.id === message.id
                    ? "bg-brand-yellow/10 border-2 border-brand-yellow"
                    : "bg-surface-white"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {message.full_name}
                    </h3>
                    <p className="text-xs text-text-muted">{message.email}</p>
                  </div>
                  {getStatusBadge(message.status)}
                </div>
                <p className="mb-2 text-sm text-text-secondary line-clamp-2">
                  {message.message}
                </p>
                <p className="text-xs text-text-muted">
                  {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        {selectedMessage && (
          <div className="rounded-card bg-surface-white p-6 shadow-card">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {selectedMessage.full_name}
                </h2>
                <p className="text-sm text-text-secondary">
                  {selectedMessage.email}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {format(
                    new Date(selectedMessage.created_at),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>
              {getStatusBadge(selectedMessage.status)}
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-text-primary">
                Message
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {selectedMessage.message}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">
                Update Status
              </h3>
              <div className="flex gap-2">
                {["new", "read", "replied", "archived"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedMessage.id, status)}
                    className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
                      selectedMessage.status === status
                        ? "bg-brand-yellow text-text-primary"
                        : "bg-surface-cream text-text-secondary hover:bg-brand-yellow/20"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-surface-cream p-4">
              <p className="text-xs text-text-secondary">
                <strong>Quick actions:</strong> You can reply to this message by
                emailing {selectedMessage.email} directly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <ContactMessagesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
