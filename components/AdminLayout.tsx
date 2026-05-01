"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout } from "@/lib/admin";

const links = [
  { href: "/admin/overview",  label: "🏠 Overview" },
  { href: "/admin/dashboard", label: "📋 Orders" },
  { href: "/admin/products",  label: "📦 Products" },
  { href: "/admin/customers", label: "👥 Customers" },
  { href: "/admin/sales",     label: "📊 Sales" },
  { href: "/admin/promos",    label: "🎟️ Promos & Banners" },
  { href: "/admin/reviews",   label: "⭐ Reviews" },
  { href: "/admin/settings",  label: "⚙️ Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    adminLogout();
    router.replace("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col py-8 px-4 gap-2 fixed h-full">
        <div className="mb-6 px-2">
          <span className="text-2xl">🌸</span>
          <p className="font-extrabold text-white text-lg leading-none mt-1">Chenni</p>
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
        <div className="mt-auto">
          <button onClick={handleLogout}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-left">
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
