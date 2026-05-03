"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ChatMessage = {
  id: string;
  user_email: string;
  user_name: string;
  content: string;
  sender: "user" | "admin";
  is_read: boolean;
  created_at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ContactPage() {
  const [mounted, setMounted]     = useState(false);
  const [loggedIn, setLoggedIn]   = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName]   = useState("");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [fetchError, setFetchError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  async function fetchMessages(email: string) {
    try {
      const res  = await fetch(`/api/chat?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.error) {
        console.error("[Contact] fetchMessages API error:", data.error);
        setFetchError(data.error);
        return;
      }

      setFetchError("");
      setMessages(data.messages ?? []);
    } catch (err) {
      console.error("[Contact] fetchMessages network error:", err);
      setFetchError("Network error — could not load messages.");
    }
  }

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("loggedIn");
    const raw        = localStorage.getItem("registeredUser");
    setLoggedIn(isLoggedIn);

    if (isLoggedIn && raw) {
      try {
        const user  = JSON.parse(raw);
        const email = String(user?.email ?? "").trim().toLowerCase();
        const name  = String(user?.name  ?? "User").trim();

        console.log("[Contact] Logged-in user:", { email, name, id: user?.id });

        if (!email) {
          console.error("[Contact] No email found in registeredUser:", raw);
          setMounted(true);
          return;
        }

        setUserEmail(email);
        setUserName(name);
        fetchMessages(email);

        const interval = setInterval(() => fetchMessages(email), 5000);
        setMounted(true);
        return () => clearInterval(interval);
      } catch (err) {
        console.error("[Contact] Failed to parse registeredUser:", err);
      }
    }

    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending || !userEmail) return;
    setSending(true);
    setInput("");

    const optimistic: ChatMessage = {
      id: `temp_${Date.now()}`,
      user_email: userEmail,
      user_name:  userName,
      content:    text,
      sender:     "user",
      is_read:    false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ user_email: userEmail, user_name: userName, content: text, sender: "user" }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[Contact] sendMessage failed:", res.status, data);
        // Roll back optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(text);
        setFetchError(data.detail ?? data.message ?? "Failed to send message.");
        return;
      }

      // Replace optimistic with real data from server
      await fetchMessages(userEmail);
    } catch (err) {
      console.error("[Contact] sendMessage network error:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
      setFetchError("Network error — message not sent.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: "linear-gradient(135deg, #fce4ec 0%, #fdf6f0 50%, #fce4ec 100%)" }}
      >
        <div
          className="w-full max-w-[480px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
          style={{ height: 620 }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f48fb1 0%, #f8bbd0 100%)" }}
          >
            <div className="relative flex-shrink-0">
              <img
                src="/logo.png"
                alt="Cheni Craft"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-white text-base leading-tight tracking-wide">
                CHENI CRAFT
              </p>
              <p className="text-pink-100 text-xs mt-0.5">
                We typically reply within a few hours
              </p>
            </div>
            <span className="text-2xl select-none">🌸</span>
          </div>

          {/* ── Error banner (only shown when there's an API error) ── */}
          {fetchError && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-red-600 font-medium">⚠️ {fetchError}</p>
              <button onClick={() => setFetchError("")} className="text-red-400 hover:text-red-600 text-xs ml-2">✕</button>
            </div>
          )}

          {/* ── Messages area ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
            style={{ background: "#fff9fb" }}
          >
            {!loggedIn ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "#fce4ec" }}>
                  🔒
                </div>
                <p className="font-bold text-gray-700 text-sm">Login required</p>
                <p className="text-gray-400 text-xs max-w-[220px] leading-relaxed">
                  Please log in to send us a message.
                </p>
                <a
                  href="/login"
                  className="mt-1 px-6 py-2 rounded-full text-white text-sm font-semibold shadow transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e91e8c, #f48fb1)" }}
                >
                  Sign In
                </a>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "#fce4ec" }}>
                  💬
                </div>
                <p className="font-bold text-gray-700 text-sm">Start a conversation</p>
                <p className="text-gray-400 text-xs max-w-[220px] leading-relaxed">
                  Hi {userName}! Send us a message and we&apos;ll get back to you soon. 🌸
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isUser    = msg.sender === "user";
                const showDate  = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);
                const showAvatar = !isUser && (i === messages.length - 1 || messages[i + 1]?.sender !== "admin");

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <span
                          className="text-[11px] text-gray-400 px-3 py-1 rounded-full"
                          style={{ background: "#fce4ec" }}
                        >
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    )}

                    <div className={`flex items-end gap-2 mb-0.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      {!isUser && (
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 overflow-hidden border border-pink-200 ${showAvatar ? "visible" : "invisible"}`}>
                          <img src="/logo.png" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                            isUser
                              ? "text-white rounded-2xl rounded-br-sm"
                              : "text-gray-800 bg-white rounded-2xl rounded-bl-sm border border-pink-100"
                          }`}
                          style={isUser ? { background: "linear-gradient(135deg, #e91e8c, #f48fb1)" } : {}}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                          {formatTime(msg.created_at)}
                          {isUser && msg.is_read && <span className="ml-1 text-pink-400">✓✓</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input area ── */}
          <div
            className="px-4 py-3 flex items-center gap-2 border-t border-pink-100 flex-shrink-0"
            style={{ background: "#fff" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loggedIn ? "Type a message…" : "Please log in to send a message"}
              disabled={!loggedIn || sending}
              className="flex-1 rounded-full px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 border border-pink-200 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#fff5f8" }}
            />
            <button
              onClick={sendMessage}
              disabled={!loggedIn || !input.trim() || sending}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity shadow"
              style={{ background: "linear-gradient(135deg, #e91e8c, #f48fb1)" }}
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
