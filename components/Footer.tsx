import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Cheni Craft" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Bringing nature's beauty to your doorstep. Handcrafted bouquets and botanical treasures.
          </p>
        </div>
        <div>
          <p className="font-semibold text-sm mb-3 text-amber-400 tracking-wide uppercase">Quick Links</p>
          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <Link href="/shop" className="hover:text-white transition-colors">Shop All</Link>
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <Link href="/orders" className="hover:text-white transition-colors">Orders</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-sm mb-3 text-amber-400 tracking-wide uppercase">Account</p>
          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © 2026 Cheni Craft. All rights reserved.
      </div>
    </footer>
  );
}
