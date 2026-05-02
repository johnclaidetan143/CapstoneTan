"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrderHistory, OrderRecord } from "@/lib/orderHistory";
import { getAverageRating } from "@/lib/reviews";

const STEPS = ["Pending Verification", "Confirmed", "Shipped", "Delivered", "Received"] as const;

const statusColor: Record<string, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-700",
  "Confirmed":            "bg-blue-100 text-blue-700",
  "Shipped":              "bg-purple-100 text-purple-700",
  "Delivered":            "bg-green-100 text-green-700",
  "Received":             "bg-emerald-100 text-emerald-700",
  "Cancelled":            "bg-red-100 text-red-600",
};

const methodLabel: Record<string, string> = {
  gcash: "GCash", bank: "Bank / Card", cod: "Cash on Delivery",
};

function TrackingBar({ status }: { status: string }) {
  const current = STEPS.indexOf(status as typeof STEPS[number]);
  return (
    <div className="flex items-center gap-0 mt-3">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i <= current ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-gray-200 text-gray-300"
            }`}>
              {i < current ? "✓" : i + 1}
            </div>
            <p className={`text-[10px] mt-1 font-semibold text-center leading-tight ${i <= current ? "text-amber-600" : "text-gray-300"}`}>
              {step}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mb-4 ${i < current ? "bg-amber-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function printReceipt(order: OrderRecord) {
  const w = window.open("", "_blank");
  if (!w) return;
  const items = order.items.map((i) =>
    `<tr><td style="padding:6px 0">${i.name} x${i.quantity}</td><td style="text-align:right;padding:6px 0">&#8369;${i.price * i.quantity}.00</td></tr>`
  ).join("");
  w.document.write(`
    <html><head><title>Receipt ${order.orderNumber}</title>
    <style>
      body{font-family:sans-serif;padding:32px;max-width:480px;margin:auto;color:#111}
      h2{color:#d97706;margin-bottom:4px}
      p{margin:4px 0;font-size:13px}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      td{font-size:13px}
      hr{border:none;border-top:1px solid #eee;margin:12px 0}
      .total{font-weight:bold;font-size:15px;color:#d97706}
      .footer{font-size:11px;color:#999;text-align:center;margin-top:24px}
    </style></head><body>
    <h2>🌸 Cheni Craft</h2>
    <p><strong>Order #:</strong> ${order.orderNumber}</p>
    <p><strong>Date:</strong> ${order.date}</p>
    <hr/>
    <table>${items}</table>
    <hr/>
    <p class="total">Total: &#8369;${order.total}.00</p>
    <hr/>
    <p><strong>Deliver to:</strong> ${order.customer.name}</p>
    <p>${order.customer.phone}</p>
    <p>${order.customer.address}, ${order.customer.city}</p>
    <hr/>
    <p><strong>Payment:</strong> ${methodLabel[order.payment.method] ?? order.payment.method}</p>
    ${order.payment.bank ? `<p>Bank: ${order.payment.bank}</p>` : ""}
    ${order.payment.referenceNumber ? `<p>Ref #: ${order.payment.referenceNumber}</p>` : ""}
    <p>Status: ${order.payment.status}</p>
    <div class="footer">Thank you for shopping at Cheni Craft! 🌸</div>
    </body></html>
  `);
  w.document.close();
  w.print();
}

export default function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) router.push("/login");
    const storedUser = localStorage.getItem("registeredUser");
    const userEmail = storedUser ? JSON.parse(storedUser).email : "";
    if (userEmail) {
      fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`)
        .then((r) => r.json())
        .then((data) => setOrders(data.orders ?? []))
        .catch(() => setOrders([]));
    }
  }, [router]);

  const STATUS_FILTERS = ["All", "Pending Verification", "Pending Payment", "Confirmed", "Shipped", "Delivered", "Received", "Cancelled"];

  const filtered = orders
    .filter((o) => filterStatus === "All" || o.trackingStatus === filterStatus)
    .filter((o) => o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">History</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
        </div>

        {/* Search + Filter */}
        {orders.length > 0 && (
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders or products..."
                className="w-full border rounded-full pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
              {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">📋</span>
            <h2 className="text-lg font-bold text-gray-800 mb-1">No past orders</h2>
            <p className="text-sm text-gray-400 mb-6">Your completed orders will appear here.</p>
            <Link href="/shop" className="bg-gray-900 hover:bg-amber-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm py-16 text-center text-gray-400">
            No orders match your filter.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((order) => (
              <div key={order.orderNumber} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                      <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${statusColor[order.trackingStatus] ?? "bg-gray-100 text-gray-500"}`}>
                        {order.trackingStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{order.date} · {order.items.length} item(s) · ₱{order.total}.00</p>
                  </div>
                  <span className="text-gray-400 text-lg">{expanded === order.orderNumber ? "▲" : "▼"}</span>
                </div>

                {/* Expanded Details */}
                {expanded === order.orderNumber && (
                  <div className="border-t border-gray-100 p-5 flex flex-col gap-5">
                    {order.trackingStatus !== "Cancelled" && <TrackingBar status={order.trackingStatus} />}
                    {order.cancelledAt && <p className="text-xs text-red-400 font-semibold">Cancelled on {order.cancelledAt}</p>}

                    {/* Items */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items</p>
                      <div className="flex flex-col gap-3">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3">
                            <img src={item.img} alt={item.name}
                              onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }}
                              className="rounded-xl object-cover w-12 h-12" />
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                              {(() => { const avg = getAverageRating(item.productId); return avg > 0 ? (
                                <span className="flex items-center gap-0.5">{[1,2,3,4,5].map((s) => <span key={s} className={`text-xs ${s <= Math.round(avg) ? "text-amber-400" : "text-gray-200"}`}>★</span>)}</span>
                              ) : null; })()}
                              <p className="text-xs text-gray-400">x{item.quantity}</p>
                            </div>
                            <p className="font-bold text-sm text-gray-800">₱{item.price * item.quantity}.00</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment & Delivery */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Deliver to</p>
                        <p className="font-semibold text-gray-800">{order.customer.name}</p>
                        <p className="text-gray-500">{order.customer.phone}</p>
                        <p className="text-gray-500">{order.customer.address}, {order.customer.city}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment</p>
                        <p className="font-semibold text-gray-800">{methodLabel[order.payment.method] ?? order.payment.method}</p>
                        {order.payment.bank && <p className="text-gray-500">{order.payment.bank}</p>}
                        {order.payment.referenceNumber && <p className="text-gray-500 text-xs">Ref: {order.payment.referenceNumber}</p>}
                        <p className="text-xs mt-1">
                          <span className={`font-bold ${order.payment.status === "Verified" ? "text-green-600" : order.payment.status === "Rejected" ? "text-red-500" : "text-yellow-600"}`}>
                            {order.payment.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Total + Print */}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                      <p className="font-extrabold text-amber-600 text-lg">₱{order.total}.00</p>
                      <button onClick={() => printReceipt(order)}
                        className="text-xs font-semibold text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-400 px-4 py-1.5 rounded-full transition-colors">
                        🖨️ Print Receipt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
