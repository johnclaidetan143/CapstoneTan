"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";

type OrderRecord = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  trackingStatus?: string;
  createdAt: string;
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace("/admin"); return; }

    async function fetchData() {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
          fetch("/api/users"),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const usersData = await usersRes.json();
        setOrders(ordersData.orders || []);
        setProductCount((productsData.products || []).length);
        setUserCount(usersData.count || 0);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => !o.trackingStatus || o.trackingStatus === "Pending Verification").length;

  const statCard = (label: string, value: string | number, icon: string, color: string, href: string) => (
    <Link href={href} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>All time</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-semibold">{label}</p>
    </Link>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Welcome back!</p>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCard("Total Orders", orders.length, "📋", "bg-blue-100 text-blue-700", "/admin/dashboard")}
        {statCard("Total Revenue", `₱${totalRevenue.toLocaleString()}`, "💰", "bg-amber-100 text-amber-700", "/admin/sales")}
        {statCard("Total Products", productCount, "📦", "bg-green-100 text-green-700", "/admin/products")}
        {statCard("Pending Orders", pending, "⏳", pending > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500", "/admin/dashboard")}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/dashboard" className="text-xs text-amber-600 hover:text-amber-700 font-semibold">View All →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{o.customerName} · {new Date(o.createdAt).toLocaleDateString("en-PH")}</p>
                </div>
                <p className="font-bold text-sm text-amber-600">₱{o.total}.00</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
