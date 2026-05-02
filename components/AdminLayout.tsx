"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { adminLogout } from "@/lib/admin";

type Notification = {
  id: string;
  orderId: string;
  orderNumber: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const links = [
  { href: "/admin/overview",  label: "🏠 Overview" },
  { href: "/admin/dashboard", label: "📋 Orders" },
  { href: "/admin/products",  label: "📦 Products" },
  { href: "/admin/customers", label: "👥 Customers" },
  { href: "/admin/sales",     label: "📊 Sales" },
  { href: "/admin/reviews",   label: "⭐ Reviews" },
  { href: "/admin/settings",  label: "⚙️ Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {}
  }, []);

  // Poll every 10 seconds for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markOneRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  function handleLogout() {
    adminLogout();
    router.push("/admin");
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col py-8 px-4 gap-2 fixed h-full overflow-y-auto">
        <div className="mb-6 px-2">
          <img src="/logo.png" alt="Cheni Craft" className="h-14 w-auto object-contain mb-1" />
          <p className="text-xs text-amber-400 tracking-widest uppercase font-semibold">Admin Panel</p>
        </div>
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              pathname === l.href ? "bg-amber-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}>
            {l.label}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <button onClick={handleLogout}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-left">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-8">
        {/* Top bar with notification bell */}
        <div className="flex justify-end mb-6" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => { setOpen((v) => !v); if (!open) fetchNotifications(); }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:shadow-md transition-shadow"
              aria-label="Notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-900 text-sm">
                    Notifications {unreadCount > 0 && <span className="ml-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                  </p>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-amber-600 hover:text-amber-700 font-semibold">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markOneRead(n.id);
                          setOpen(false);
                          router.push("/admin/dashboard");
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-amber-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${!n.isRead ? "text-gray-900" : "text-gray-500"}`}>
                              {!n.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 mb-0.5" />}
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-100 px-4 py-2 text-center">
                  <button
                    onClick={() => { setOpen(false); router.push("/admin/dashboard"); }}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    View all orders →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
