"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { getUnreadNotifications, markAllNotificationsRead, OrderRecord } from "@/lib/orderHistory";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<OrderRecord[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      setLoggedIn(!!localStorage.getItem("loggedIn"));
      setCartCount(getCartCount());
      setWishCount(getWishlistCount());
      const unread = getUnreadNotifications();
      setNotifCount(unread.length);
      setNotifications(unread);
    };
    sync();
    window.addEventListener("cartUpdated", sync);
    window.addEventListener("wishlistUpdated", sync);
    window.addEventListener("orderUpdated", sync);
    return () => {
      window.removeEventListener("cartUpdated", sync);
      window.removeEventListener("wishlistUpdated", sync);
      window.removeEventListener("orderUpdated", sync);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("registeredUser");
    localStorage.removeItem("orderHistory");
    localStorage.removeItem("session");
    setLoggedIn(false);
    router.push("/login");
  }

  const navLink = (href: string, label: string) => (
    <Link href={href}
      className={`text-sm font-medium tracking-wide transition-all duration-200 relative group ${
        pathname === href ? "text-rose-700" : "text-gray-600 hover:text-gray-900"
      }`}>
      {label}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-rose-600 transition-all duration-300 ${pathname === href ? "w-full" : "w-0 group-hover:w-full"}`} />
    </Link>
  );

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white border-b border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <img src="/logo.png" alt="Cheni Craft" className="h-14 w-auto object-contain" />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          {navLink("/shop", "Shop")}
          {navLink("/categories", "Categories")}
          {loggedIn && navLink("/orders", "Cart & Orders")}
          {loggedIn && navLink("/history", "My Orders")}
          {loggedIn && navLink("/profile", "Profile")}
          {navLink("/about", "About")}
          {navLink("/contact", "Contact")}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <>
              {/* Wishlist */}
              <Link href="/wishlist"
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-rose-50 text-gray-500 hover:text-rose-500 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishCount}</span>}
              </Link>

              {/* Cart */}
              <Link href="/orders"
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) { markAllNotificationsRead(); setNotifCount(0); } }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{notifCount}</span>}
                </button>

                {showNotif && (
                  <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">Notifications</p>
                      {notifCount > 0 && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{notifCount} new</span>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-2xl mb-2">🔔</p>
                        <p className="text-sm text-gray-400">No new notifications</p>
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {notifications.map((o) => (
                          <Link key={o.orderNumber} href="/orders" onClick={() => setShowNotif(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-rose-50 transition-colors">
                            <span className="text-lg mt-0.5 flex-shrink-0">
                              {o.trackingStatus === "Delivered" ? "✅" : o.trackingStatus === "Shipped" ? "🚚" : o.trackingStatus === "Confirmed" ? "📦" : o.trackingStatus === "Cancelled" ? "❌" : "🔔"}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{o.orderNumber}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                {o.trackingStatus === "Confirmed" ? "Your order has been confirmed! 🎉" :
                                 o.trackingStatus === "Shipped" ? "Your order is on its way! 🚚" :
                                 o.trackingStatus === "Delivered" ? "Your order has been delivered! ✅" :
                                 o.trackingStatus === "Cancelled" ? "Your order has been cancelled." :
                                 "Your order has been placed!"}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">{o.date}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      <Link href="/orders" onClick={() => setShowNotif(false)} className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                        View all orders →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleLogout}
                className="ml-1 text-xs font-semibold text-gray-600 hover:text-rose-700 border border-gray-200 hover:border-rose-300 px-4 py-2 rounded-full transition-all">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link href="/register"
                className="text-sm font-semibold text-white bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
