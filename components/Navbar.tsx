"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("loggedIn"));
    setCartCount(getCartCount());

    const sync = () => {
      setCartCount(getCartCount());
      setLoggedIn(!!localStorage.getItem("loggedIn"));
    };

    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  function handleLogout() {
    localStorage.removeItem("loggedIn");
    setLoggedIn(false);
    router.push("/login");
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`group relative pb-1 text-sm font-medium tracking-wide transition-colors duration-200 ${
        pathname === href ? "text-[#ff4da6]" : "text-[#d8c7d2] hover:text-white"
      }`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-[#ff4da6] transition-all duration-300 ${
          pathname === href ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b12]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">*</span>
          <div>
            <p className="leading-none text-lg font-bold text-white">Chenni</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff85c1]">Craft Shop</p>
          </div>
        </Link>

        <div className="flex gap-8">
          {navLink("/shop", "Shop")}
          {navLink("/categories", "Categories")}
          {loggedIn && navLink("/orders", "Orders")}
        </div>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <button className="text-lg text-[#d8c7d2] transition-colors hover:text-[#ff85c1]">Heart</button>
              <Link href="/orders" className="relative text-lg text-[#d8c7d2] transition-colors hover:text-[#ff85c1]">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4da6] text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#ff85c1]/60 bg-[#15151f] px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-[1.02] hover:bg-gradient-to-r hover:from-[#ff4da6] hover:to-[#ff85c1]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-[#d8c7d2] transition-colors hover:text-[#ff85c1]">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-[#ff4da6] to-[#ff85c1] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(255,77,166,0.35)] transition-all hover:scale-[1.03] hover:brightness-110"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
