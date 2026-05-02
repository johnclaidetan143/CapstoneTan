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
    <Link
      href={href}
      className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
        pathname === href
          ? "text-amber-600 border-b-2 border-amber-600 pb-0.5"
          : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Chenni Craft Shop" className="h-16 w-auto object-contain" />
        </Link>

        {/* Nav Links */}
        <div className="flex gap-8">
          {navLink("/shop", "Shop")}
          {navLink("/categories", "Categories")}
          {loggedIn && navLink("/orders", "Orders")}
          {loggedIn && navLink("/history", "My Orders")}
          {loggedIn && navLink("/profile", "Profile")}
          {navLink("/about", "About")}
          {navLink("/contact", "Contact Us")}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              {/* Wishlist */}
              <Link href="/wishlist" className="relative text-gray-500 hover:text-red-400 transition-colors text-lg">
                ♡
                {wishCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-400 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishCount}
                  </span>
                )}
              </Link>
              {/* Cart */}
              <Link href="/orders" className="relative text-gray-500 hover:text-amber-600 transition-colors text-lg">
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) { markAllNotificationsRead(); setNotifCount(0); } }}
                  className="relative text-gray-500 hover:text-amber-600 transition-colors text-lg">
                  🔔
                  {notifCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{notifCount}</span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">Notifications</p>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">No new notifications</div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.map((o) => (
                          <Link key={o.orderNumber} href="/orders" onClick={() => setShowNotif(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-50">
                            <span className="text-xl mt-0.5">
                              {o.trackingStatus === "Delivered" ? "✅" : o.trackingStatus === "Shipped" ? "🚚" : o.trackingStatus === "Confirmed" ? "📦" : o.trackingStatus === "Cancelled" ? "❌" : "🔔"}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{o.orderNumber}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {o.trackingStatus === "Pending Verification" ? "Your order has been placed! Awaiting verification." :
                                 o.trackingStatus === "Confirmed" ? "Your order has been confirmed! 🎉" :
                                 o.trackingStatus === "Shipped" ? "Your order is on its way! 🚚" :
                                 o.trackingStatus === "Delivered" ? "Your order has been delivered! ✅" :
                                 o.trackingStatus === "Cancelled" ? "Your order has been cancelled." :
                                 `Order status: ${o.trackingStatus}`}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">{o.date}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="px-4 py-2 border-t border-gray-100">
                      <Link href="/orders" onClick={() => setShowNotif(false)}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                        View all orders →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-white bg-gray-800 hover:bg-amber-600 transition-colors px-4 py-2 rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-amber-600 transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-400 transition-colors px-4 py-2 rounded-full">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
