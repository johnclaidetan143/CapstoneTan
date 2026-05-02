"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";

type Order = {
  orderNumber: string; date: string; total: number; trackingStatus: string;
  payment: { method: string; status: string };
  items: { productId: number; name: string; img: string; price: number; quantity: number }[];
};

function BarChart({ data, color = "#f59e0b" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-[9px] text-gray-400 font-semibold">
            {d.value > 0 ? `₱${d.value >= 1000 ? (d.value / 1000).toFixed(1) + "k" : d.value}` : ""}
          </span>
          <div className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${(d.value / max) * 96}px`, background: color, minHeight: d.value > 0 ? "4px" : "0" }} />
          <span className="text-[9px] text-gray-400 font-semibold truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminSalesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<"daily" | "monthly">("monthly");
  const [mounted, setMounted] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch { setOrders([]); }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    fetchOrders();
  }, [router, fetchOrders]);

  if (!mounted) return null;

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const delivered = orders.filter((o) => o.trackingStatus === "Delivered");
  const deliveredRevenue = delivered.reduce((s, o) => s + o.total, 0);
  const pendingRevenue = orders.filter((o) => o.trackingStatus === "Pending Verification").reduce((s, o) => s + o.total, 0);

  // Daily chart — last 7 days
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    const value = orders.filter((o) => {
      const od = new Date(o.date); return od.toDateString() === d.toDateString();
    }).reduce((s, o) => s + o.total, 0);
    return { label, value };
  });

  // Monthly chart — last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString("en-PH", { month: "short" });
    const y = d.getFullYear(); const m = d.getMonth();
    const value = orders.filter((o) => {
      const od = new Date(o.date); return od.getFullYear() === y && od.getMonth() === m;
    }).reduce((s, o) => s + o.total, 0);
    return { label, value };
  });

  // Best sellers
  const productSales: Record<number, { name: string; img: string; qty: number; revenue: number }> = {};
  orders.forEach((o) => o.items.forEach((item) => {
    if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, img: item.img, qty: 0, revenue: 0 };
    productSales[item.productId].qty += item.quantity;
    productSales[item.productId].revenue += item.price * item.quantity;
  }));
  const bestSellers = Object.entries(productSales).map(([id, d]) => ({ id: Number(id), ...d })).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Category revenue
  const categoryRevenue: Record<string, number> = {};
  orders.forEach((o) => o.items.forEach((item) => {
    const cat = item.name.toLowerCase().includes("pot") || item.name.toLowerCase().includes("daisy") || item.name.toLowerCase().includes("lotus") || item.name.toLowerCase().includes("tulip") ? "Flower Pot"
      : item.name.toLowerCase().includes("keychain") || item.name.toLowerCase().includes("mirror") || item.name.toLowerCase().includes("fuzz") ? "Keychain" : "Bouquet";
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.price * item.quantity;
  }));

  const paymentBreakdown: Record<string, number> = {};
  orders.forEach((o) => {
    const method = o.payment.method === "gcash" ? "GCash" : "Cash on Delivery";
    paymentBreakdown[method] = (paymentBreakdown[method] || 0) + 1;
  });

  const statCard = (label: string, value: string, sub: string, color = "text-gray-900") => (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );

  const chartData = period === "daily" ? dailyData : monthlyData;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div><p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p><h1 className="text-2xl font-extrabold text-gray-900">Sales Reports</h1></div>
        <button onClick={fetchOrders} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-full transition-colors">🔄 Refresh</button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCard("Total Orders", String(orders.length), "All time")}
        {statCard("Total Revenue", `₱${totalRevenue.toLocaleString()}.00`, "All orders", "text-amber-600")}
        {statCard("Delivered Revenue", `₱${deliveredRevenue.toLocaleString()}.00`, `${delivered.length} delivered`, "text-green-600")}
        {statCard("Pending Revenue", `₱${pendingRevenue.toLocaleString()}.00`, "Awaiting verification", "text-yellow-600")}
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">📈 Sales Chart</h2>
          <div className="flex gap-2">
            {(["daily", "monthly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${period === p ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {p === "daily" ? "Last 7 Days" : "Last 6 Months"}
              </button>
            ))}
          </div>
        </div>
        {chartData.every((d) => d.value === 0) ? (
          <p className="text-sm text-gray-400 text-center py-8">No sales data for this period.</p>
        ) : (
          <BarChart data={chartData} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Best Sellers */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">🏆 Best Sellers</h2>
          {bestSellers.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No sales data yet.</p> : (
            <div className="flex flex-col gap-3">
              {bestSellers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`text-sm font-extrabold w-5 ${i === 0 ? "text-amber-500" : "text-gray-300"}`}>#{i + 1}</span>
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={p.img} alt={p.name} onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(p.qty / (bestSellers[0]?.qty || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600 text-sm">₱{p.revenue.toLocaleString()}.00</p>
                    <p className="text-xs text-gray-400">{p.qty} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* Category Revenue */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">📦 By Category</h2>
            {Object.entries(categoryRevenue).length === 0 ? <p className="text-xs text-gray-400">No data yet.</p> : (
              <div className="flex flex-col gap-3">
                {Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]).map(([cat, rev]) => {
                  const total = Object.values(categoryRevenue).reduce((s, v) => s + v, 0);
                  const pct = Math.round((rev / total) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{cat}</span>
                        <span className="font-bold text-gray-900">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">💳 Payment Methods</h2>
            {Object.entries(paymentBreakdown).length === 0 ? <p className="text-xs text-gray-400">No data yet.</p> : (
              <div className="flex flex-col gap-3">
                {Object.entries(paymentBreakdown).map(([method, count]) => {
                  const total = Object.values(paymentBreakdown).reduce((s, v) => s + v, 0);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={method}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{method}</span>
                        <span className="font-bold text-gray-900">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">📋 Order Status</h2>
            {["Pending Verification", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((s) => (
              <div key={s} className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600 font-medium text-xs">{s}</span>
                <span className="font-bold text-gray-900">{orders.filter((o) => o.trackingStatus === s).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
