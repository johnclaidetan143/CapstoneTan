"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { getUnreadNotifications } from "@/lib/orderHistory";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLoggedIn(!!localStorage.getItem("loggedIn"));
      setCartCount(getCartCount());
      setWishCount(getWishlistCount());
      setNotifCount(getUnreadNotifications().length);
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

  function handleLogout() {
    localStorage.removeItem("loggedIn");
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
          <img src="/logo.png" alt="Chenni Craft Shop" className="h-10 w-auto object-contain" />
        </Link>

        {/* Nav Links */}
        <div className="flex gap-8">
          {navLink("/shop", "Shop")}
          {navLink("/categories", "Categories")}
          {loggedIn && navLink("/orders", "Orders")}
          {loggedIn && navLink("/history", "My Orders")}
          {loggedIn && navLink("/profile", "Profile")}
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
                {notifCount > 0 && (
                  <span className="absolute -top-2 -right-5 bg-red-500 text-white text-[10px] font-bold px-1 h-4 rounded-full flex items-center justify-center">{notifCount}</span>
                )}
              </Link>
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
