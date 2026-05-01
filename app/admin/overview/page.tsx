"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { getOrderHistory, OrderRecord } from "@/lib/orderHistory";
import { isAdminLoggedIn } from "@/lib/admin";
import { getLowStockProducts } from "@/lib/stock";
import { getAllReviews } from "@/lib/reviews";

export default function AdminOverviewPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [lowStock, setLowStock] = useState<{ id: number; name: string; qty: number }[]>([]);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    const o = getOrderHistory();
    setOrders(o);
    setLowStock(getLowStockProducts());
    setReviewCount(getAllReviews().length);
  }, [router]);

  const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const todayOrders = orders.filter((o) => o.date === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.trackingStatus === "Pending Verification" || o.trackingStatus === "Pending Payment").length;
  const delivered = orders.filter((o) => o.trackingStatus === "Delivered").length;

  const statCard = (label: string, value: string | number, sub: string, color: string, icon: string, href: string) => (
    <Link href={href} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{sub}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-semibold">{label}</p>
    </Link>
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Welcome back!</p>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 mt-1">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCard("Total Orders", orders.length, "All time", "bg-blue-100 text-blue-700", "📋", "/admin/dashboard")}
        {statCard("Total Revenue", `₱${totalRevenue.toLocaleString()}`, "All time", "bg-amber-100 text-amber-700", "💰", "/admin/sales")}
        {statCard("Today's Orders", todayOrders.length, `₱${todayRevenue.toLocaleString()} today`, "bg-green-100 text-green-700", "🛒", "/admin/dashboard")}
        {statCard("Pending Orders", pending, "Need attention", pending > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500", "⏳", "/admin/dashboard")}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/dashboard" className="text-xs text-amber-600 hover:text-amber-700 font-semibold">View All →</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {orders.slice(0, 6).map((o) => (
                <div key={o.orderNumber} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{o.orderNumber}</p>
                    <p className="text-xs text-gray-400">{o.customer.name} · {o.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      o.trackingStatus === "Delivered" ? "bg-green-100 text-green-700" :
                      o.trackingStatus === "Cancelled" ? "bg-red-100 text-red-600" :
                      o.trackingStatus === "Shipped" ? "bg-purple-100 text-purple-700" :
                      o.trackingStatus === "Confirmed" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{o.trackingStatus}</span>
                    <p className="font-bold text-sm text-amber-600">₱{o.total}.00</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Quick Stats</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Delivered</span><span className="font-bold text-green-600">{delivered}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pending</span><span className="font-bold text-yellow-600">{pending}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Cancelled</span><span className="font-bold text-red-500">{orders.filter((o) => o.trackingStatus === "Cancelled").length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reviews</span><span className="font-bold text-gray-900">{reviewCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Low Stock</span><span className={`font-bold ${lowStock.length > 0 ? "text-orange-500" : "text-gray-400"}`}>{lowStock.length} products</span></div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">⚠️ Low Stock</p>
              <div className="flex flex-col gap-1">
                {lowStock.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-gray-700 font-medium truncate">{p.name}</span>
                    <span className={`font-bold ml-2 ${p.qty === 0 ? "text-red-600" : "text-orange-600"}`}>{p.qty === 0 ? "Out" : `${p.qty} left`}</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/products" className="text-xs text-orange-600 hover:text-orange-700 font-semibold mt-2 block">Manage Stock →</Link>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {[
                { href: "/admin/products", label: "➕ Add Product" },
                { href: "/admin/promos", label: "🎟️ Add Promo Code" },
                { href: "/admin/import", label: "📥 Bulk Import" },
                { href: "/admin/reviews", label: "⭐ View Reviews" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-xs font-semibold text-gray-600 hover:text-amber-600 transition-colors py-1">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
