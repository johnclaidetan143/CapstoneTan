"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { getOrderHistory, OrderRecord } from "@/lib/orderHistory";
import { isAdminLoggedIn } from "@/lib/admin";

export default function AdminSalesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    setOrders(getOrderHistory());
  }, [router]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const deliveredOrders = orders.filter((o) => o.trackingStatus === "Delivered");
  const deliveredRevenue = deliveredOrders.reduce((s, o) => s + o.total, 0);
  const pendingRevenue = orders.filter((o) => o.trackingStatus === "Pending Verification").reduce((s, o) => s + o.total, 0);

  const productSales: Record<number, { name: string; img: string; qty: number; revenue: number }> = {};
  orders.forEach((o) => o.items.forEach((item) => {
    if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, img: item.img, qty: 0, revenue: 0 };
    productSales[item.productId].qty += item.quantity;
    productSales[item.productId].revenue += item.price * item.quantity;
  }));
  const bestSellers = Object.entries(productSales).map(([id, d]) => ({ id: Number(id), ...d })).sort((a, b) => b.qty - a.qty).slice(0, 5);

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

  return (
    <AdminLayout>
      <div className="mb-6"><p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p><h1 className="text-2xl font-extrabold text-gray-900">Sales Summary</h1></div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCard("Total Orders", String(orders.length), "All time")}
        {statCard("Total Revenue", `₱${totalRevenue.toLocaleString()}.00`, "All orders", "text-amber-600")}
        {statCard("Delivered Revenue", `₱${deliveredRevenue.toLocaleString()}.00`, `${deliveredOrders.length} delivered`, "text-green-600")}
        {statCard("Pending Revenue", `₱${pendingRevenue.toLocaleString()}.00`, "Awaiting verification", "text-yellow-600")}
      </div>
      <div className="grid grid-cols-3 gap-6">
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
                  <div className="flex-1"><p className="font-semibold text-sm text-gray-900">{p.name}</p><p className="text-xs text-gray-400">{p.qty} sold</p></div>
                  <p className="font-bold text-amber-600 text-sm">₱{p.revenue.toLocaleString()}.00</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">📦 By Category</h2>
            {Object.entries(categoryRevenue).length === 0 ? <p className="text-xs text-gray-400">No data yet.</p> : (
              <div className="flex flex-col gap-2">
                {Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]).map(([cat, rev]) => (
                  <div key={cat} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{cat}</span>
                    <span className="font-bold text-gray-900">₱{rev.toLocaleString()}.00</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">💳 Payment Methods</h2>
            {Object.entries(paymentBreakdown).length === 0 ? <p className="text-xs text-gray-400">No data yet.</p> : (
              <div className="flex flex-col gap-2">
                {Object.entries(paymentBreakdown).map(([method, count]) => (
                  <div key={method} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{method}</span>
                    <span className="font-bold text-gray-900">{count} orders</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">📋 Order Status</h2>
            {["Pending Verification", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((s) => (
              <div key={s} className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600 font-medium">{s}</span>
                <span className="font-bold text-gray-900">{orders.filter((o) => o.trackingStatus === s).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
