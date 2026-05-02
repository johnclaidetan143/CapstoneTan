import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <img src="/logo.png" alt="Cheni Craft" className="h-14 w-auto object-contain mb-4 brightness-0 invert opacity-90" />
          <p className="text-sm text-gray-400 leading-relaxed">
            Handcrafted with love — bringing nature&apos;s beauty to your doorstep through felt bouquets, flower pots, and charming keychains.
          </p>
          <div className="flex gap-3 mt-5">
            {[
              { icon: "f", label: "Facebook", href: "https://facebook.com" },
              { icon: "ig", label: "Instagram", href: "https://instagram.com" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-700 flex items-center justify-center text-xs font-bold text-white transition-all">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Shop</p>
          <div className="flex flex-col gap-2.5">
            {[
              { href: "/shop", label: "All Products" },
              { href: "/categories", label: "Categories" },
              { href: "/shop?category=Bouquet", label: "Bouquets" },
              { href: "/shop?category=Flower+Pot", label: "Flower Pots" },
              { href: "/shop?category=Keychain", label: "Keychains" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Help */}
        <div>
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Help</p>
          <div className="flex flex-col gap-2.5">
            {[
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Contact Us" },
              { href: "/about", label: "About Us" },
              { href: "/orders", label: "Track Order" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Account</p>
          <div className="flex flex-col gap-2.5">
            {[
              { href: "/login", label: "Sign In" },
              { href: "/register", label: "Create Account" },
              { href: "/profile", label: "My Profile" },
              { href: "/history", label: "Order History" },
              { href: "/wishlist", label: "Wishlist" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2026 Cheni Craft. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🌸</span>
            <span>Handcrafted with love in the Philippines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
