"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [router, fetchMessages]);

  if (!mounted) return null;

  async function markRead(id: string) {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
  }

  async function markAllRead() {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  function handleExpand(id: string) {
    setExpanded(expanded === id ? null : id);
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.is_read) markRead(id);
  }

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Messages
            {unread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMessages} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-full transition-colors">🔄 Refresh</button>
          {unread > 0 && (
            <button onClick={markAllRead} className="bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">✓ Mark All Read</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <span className="text-4xl">✉️</span>
          <p className="text-gray-400 mt-3 text-sm">No messages yet. Customer messages from the Contact page will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${!msg.is_read ? "border-amber-500" : "border-transparent"}`}>
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleExpand(msg.id)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${!msg.is_read ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                    {msg.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold truncate ${!msg.is_read ? "text-gray-900" : "text-gray-600"}`}>{msg.name}</p>
                      {!msg.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{msg.email}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{msg.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <p className="text-xs text-gray-400">{timeAgo(msg.created_at)}</p>
                  <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">Delete</button>
                  <span className="text-gray-400">{expanded === msg.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expanded === msg.id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600">
                      {msg.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{msg.name}</p>
                      <a href={`mailto:${msg.email}`} className="text-xs text-amber-600 hover:underline">{msg.email}</a>
                    </div>
                    <p className="ml-auto text-xs text-gray-400">{new Date(msg.created_at).toLocaleString("en-PH")}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a href={`mailto:${msg.email}?subject=Re: Your message to Cheni Craft`}
                      className="bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">
                      ✉️ Reply via Email
                    </a>
                    <button onClick={() => deleteMessage(msg.id)}
                      className="border border-red-200 hover:border-red-400 text-red-400 hover:text-red-600 text-xs font-semibold px-4 py-2 rounded-full transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
