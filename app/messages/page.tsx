"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  admin_reply?: string | null;
  reply_read?: boolean;
  replied_at?: string | null;
  created_at: string;
};

export default function MessagesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  const userEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    const raw = localStorage.getItem("registeredUser");
    if (!raw) return "";
    try {
      return String(JSON.parse(raw)?.email ?? "").trim().toLowerCase();
    } catch {
      return "";
    }
  }, []);

  async function fetchMessages(email: string) {
    try {
      const res = await fetch(`/api/messages?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    const raw = localStorage.getItem("registeredUser");
    const email = raw ? String(JSON.parse(raw)?.email ?? "").trim().toLowerCase() : "";
    if (email) fetchMessages(email);
    else setLoading(false);
    setMounted(true);
  }, [router]);

  async function markReplyRead(id: string) {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "markReplyRead" }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, reply_read: true } : m)));
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">My Account</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">View your Contact Us messages and admin replies.</p>
        </div>

        {!userEmail ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-sm text-gray-500">No logged-in user email found.</div>
        ) : loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-sm text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-sm text-gray-500">No messages yet. Submit one from the Contact Us page.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800">{new Date(msg.created_at).toLocaleString("en-PH")}</p>
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${msg.admin_reply ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {msg.admin_reply ? "Replied" : "Waiting for reply"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Your message</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>

                {msg.admin_reply && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-amber-700">Admin reply</p>
                      {!msg.reply_read && (
                        <button
                          onClick={() => markReplyRead(msg.id)}
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-900"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{msg.admin_reply}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{msg.replied_at ? new Date(msg.replied_at).toLocaleString("en-PH") : ""}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
