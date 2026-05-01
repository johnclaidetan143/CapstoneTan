"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { getOrderHistory, OrderRecord } from "@/lib/orderHistory";
import { isAdminLoggedIn } from "@/lib/admin";
import { getLowStockProducts } from "@/lib/stock";

const TRACKING = ["Pending Verification", "Pending Payment", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;

const statusColor: Record<string, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-700",
  "Pending Payment":      "bg-orange-100 text-orange-600",
  "Confirmed":            "bg-blue-100 text-blue-700",
  "Shipped":              "bg-purple-100 text-purple-700",
  "Delivered":            "bg-green-100 text-green-700",
  "Cancelled":            "bg-red-100 text-red-600",
};

const paymentColor: Record<string, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-700",
  "Pending Payment":      "bg-orange-100 text-orange-600",
  "Verified":             "bg-green-100 text-green-700",
  "Rejected":             "bg-red-100 text-red-600",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [lowStock, setLowStock] = useState<{ id: number; name: string; qty: number }[]>([]);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    setOrders(getOrderHistory());
    setLowStock(getLowStockProducts());
  }, [router]);

  function persist(updated: OrderRecord[]) {
    setOrders(updated);
    localStorage.setItem("orderHistory", JSON.stringify(updated));
    // Trigger notification sync for customer navbar
    window.dispatchEvent(new Event("orderUpdated"));
  }

  function updateTrackingStatus(orderNumber: string, status: typeof TRACKING[number]) {
    const updated = orders.map((o) =>
      o.orderNumber === orderNumber ? { ...o, trackingStatus: status, notificationRead: false } : o
    );
    persist(updated);
  }

  function updatePaymentStatus(orderNumber: string, status: string) {
    const updated = orders.map((o) =>
      o.orderNumber === orderNumber ? { ...o, payment: { ...o.payment, status }, notificationRead: false } : o
    );
    persist(updated);
  }

  function markAsPaid(orderNumber: string) {
    const updated = orders.map((o) =>
      o.orderNumber === orderNumber
        ? { ...o, payment: { ...o.payment, status: "Verified" }, trackingStatus: "Confirmed" as const, notificationRead: false }
        : o
    );
    persist(updated);
  }

  const STATUS_FILTERS = ["All", ...TRACKING];
  const filtered = orders
    .filter((o) => filterStatus === "All" || o.trackingStatus === filterStatus)
    .filter((o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AdminLayout>
      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">⚠️ Low Stock Alert ({lowStock.length} products)</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className={`text-xs font-semibold px-3 py-1 rounded-full ${p.qty === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                {p.name} — {p.qty === 0 ? "Out of Stock" : `${p.qty} left`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
        </div>
        <div className="flex gap-3">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or name..."
            className="border rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-56" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["Pending Verification", "Confirmed", "Shipped", "Delivered"].map((s) => (
          <div key={s} className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{orders.filter((o) => o.trackingStatus === s).length}</p>
            <p className="text-xs text-gray-400 mt-1 font-semibold">{s}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">No orders found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <div key={order.orderNumber} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[order.trackingStatus]}`}>{order.trackingStatus}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${paymentColor[order.payment.status] ?? "bg-gray-100 text-gray-500"}`}>{order.payment.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">{order.customer.name} · {order.date} · ₱{order.total}.00</p>
                </div>
                <span className="text-gray-400">{expanded === order.orderNumber ? "▲" : "▼"}</span>
              </div>

              {expanded === order.orderNumber && (
                <div className="border-t border-gray-100 p-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                        <p className="font-semibold text-sm text-gray-800">{order.customer.name}</p>
                        <p className="text-xs text-gray-500">{order.customer.phone}</p>
                        <p className="text-xs text-gray-500">{order.customer.address}, {order.customer.city}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Items</p>
                        {order.items.map((item) => (
                          <p key={item.productId} className="text-xs text-gray-600">{item.name} x{item.quantity} — ₱{item.price * item.quantity}.00</p>
                        ))}
                        <p className="text-sm font-extrabold text-amber-600 mt-1">Total: ₱{order.total}.00</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Payment</p>
                        <p className="text-xs text-gray-600">Method: <span className="font-semibold">{order.payment.method === "gcash" ? "GCash" : order.payment.method === "cod" ? "Cash on Delivery" : "Bank / Card"}</span></p>
                        {order.payment.bank && <p className="text-xs text-gray-600">Bank: <span className="font-semibold">{order.payment.bank}</span></p>}
                        {order.payment.accountUsed && <p className="text-xs text-gray-600">Account: <span className="font-semibold">{order.payment.accountUsed}</span></p>}
                        {order.payment.referenceNumber && <p className="text-xs text-gray-600">Ref #: <span className="font-semibold text-gray-800">{order.payment.referenceNumber}</span></p>}
                      </div>

                      {/* Mark as Paid — one-click */}
                      {order.payment.status !== "Verified" && order.trackingStatus !== "Cancelled" && (
                        <button onClick={() => markAsPaid(order.orderNumber)}
                          className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors w-fit">
                          ✓ Mark as Paid & Confirm
                        </button>
                      )}

                      {/* Verify Payment */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment Status</p>
                        <div className="flex gap-2 flex-wrap">
                          {["Pending Verification", "Pending Payment", "Verified", "Rejected"].map((s) => (
                            <button key={s} onClick={() => updatePaymentStatus(order.orderNumber, s)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                                order.payment.status === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"
                              }`}>
                              {s === "Pending Verification" ? "Pending" : s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Order Status */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Order Status</p>
                        <div className="flex flex-wrap gap-2">
                          {TRACKING.map((s) => (
                            <button key={s} onClick={() => updateTrackingStatus(order.orderNumber, s)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                                order.trackingStatus === s ? "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-500 hover:border-gray-400"
                              }`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
