"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";

type ChatMessage = {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  sender: "user" | "admin";
  is_read: boolean;
  created_at: string;
};

type Conversation = {
  user_id: string;
  user_name: string;
  last_message: string;
  last_time: string;
  unread: number;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function formatBubbleTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (data.error) console.error("[AdminMessages] fetchConversations error:", data.error, data.code);
      setConversations(data.conversations ?? []);
    } catch (err) {
      console.error("[AdminMessages] fetchConversations network error:", err);
      setConversations([]);
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  const fetchMessages = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/chat?user_id=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (data.error) console.error("[AdminMessages] fetchMessages error:", data.error, data.code);
      setMessages(data.messages ?? []);
    } catch (err) {
      console.error("[AdminMessages] fetchMessages network error:", err);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [router, fetchConversations]);

  // Poll active conversation messages every 5s
  useEffect(() => {
    if (!activeUserId) return;
    const interval = setInterval(() => fetchMessages(activeUserId), 5000);
    return () => clearInterval(interval);
  }, [activeUserId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function openConversation(uid: string) {
    setActiveUserId(uid);
    setLoadingMsgs(true);
    setMessages([]);
    await fetchMessages(uid);
    setLoadingMsgs(false);
    await fetch("/api/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: uid }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.user_id === uid ? { ...c, unread: 0 } : c))
    );
    inputRef.current?.focus();
  }

  async function sendReply() {
    const text = input.trim();
    if (!text || sending || !activeUserId) return;
    setSending(true);
    setInput("");

    const activeConvo = conversations.find((c) => c.user_id === activeUserId);
    const optimistic: ChatMessage = {
      id: `temp_${Date.now()}`,
      user_id: activeUserId,
      user_name: activeConvo?.user_name ?? "",
      message: text,
      sender: "admin",
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          user_name: activeConvo?.user_name ?? "",
          message: text,
          sender: "admin",
        }),
      });
      const data = await res.json();
      if (!res.ok) console.error("[AdminMessages] sendReply failed:", res.status, data);
      await fetchMessages(activeUserId);
    } catch (err) {
      console.error("[AdminMessages] sendReply network error:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  if (!mounted) return null;

  const activeConvo = conversations.find((c) => c.user_id === activeUserId);

  return (
    <AdminLayout>
      <div className="mb-4">
        <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-2xl font-extrabold text-gray-900">Messages</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
        {/* Left panel — conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm text-gray-400">No conversations yet.</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.user_id}
                  onClick={() => openConversation(convo.user_id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-rose-50 transition-colors border-b border-gray-50 ${
                    activeUserId === convo.user_id ? "bg-rose-50 border-l-4 border-l-rose-500" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {convo.user_name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm truncate ${convo.unread > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                        {convo.user_name}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(convo.last_time)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className={`text-xs truncate ${convo.unread > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                        {convo.last_message}
                      </p>
                      {convo.unread > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel — chat window */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-500 font-semibold">Select a conversation</p>
              <p className="text-gray-400 text-sm mt-1">Choose a user from the left to view their messages.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-white">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {activeConvo?.user_name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{activeConvo?.user_name}</p>
                  <p className="text-xs text-gray-400">{activeUserId}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1 bg-gray-50">
                {loadingMsgs ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No messages yet.</div>
                ) : (
                  messages.map((msg, i) => {
                    const isAdmin = msg.sender === "admin";
                    const showDate = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-3">
                            <span className="text-[11px] text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex items-end gap-2 mb-1 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5">
                              {msg.user_name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                          )}
                          <div className={`max-w-[68%] flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                isAdmin
                                  ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 px-1">{formatBubbleTime(msg.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${activeConvo?.user_name ?? "user"}…`}
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder-gray-400"
                  disabled={sending}
                />
                <button
                  onClick={sendReply}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  <svg className="w-4 h-4 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
