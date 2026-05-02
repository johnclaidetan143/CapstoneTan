"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";
import { getLowStockProducts } from "@/lib/stock";

type OrderItem = { productId: number; name: string; price: number; quantity: number; img: string; subtitle: string };
type Payment = { method: string; bank: string | null; accountUsed: string | null; referenceNumber: string; status: string };
type Customer = { name: string; phone: string; address: string; city: string };

type Order = {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  payment: Payment;
  trackingStatus: string;
  notificationRead: boolean;
  createdAt: string;
};

const TRACKING = ["Pending Verification", "Pending Payment", "Confirmed", "Shipped", "Delivered", "Received", "Cancelled"] as const;

const statusColor: Record<string, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-700",
  "Pending Payment":      "bg-orange-100 text-orange-600",
  "Confirmed":            "bg-blue-100 text-blue-700",
  "Shipped":              "bg-purple-100 text-purple-700",
  "Delivered":            "bg-green-100 text-green-700",
  "Received":             "bg-emerald-100 text-emerald-700",
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [lowStock, setLowStock] = useState<{ id: number; name: string; qty: number }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newOrderBanner, setNewOrderBanner] = useState(false);
  const prevOrderCount = useRef(0);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const fetched: Order[] = data.orders ?? [];
      if (prevOrderCount.current > 0 && fetched.length > prevOrderCount.current) {
        setNewOrderBanner(true);
      }
      prevOrderCount.current = fetched.length;
      setOrders(fetched);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    setLowStock(getLowStockProducts());
    fetchOrders();
    // Poll every 10 seconds for new orders
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [router, fetchOrders]);

  if (!mounted) return null;

  async function patchOrder(orderNumber: string, trackingStatus?: string, paymentStatus?: string) {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, trackingStatus, paymentStatus }),
      });
      // Optimistic update
      setOrders((prev) => prev.map((o) => {
        if (o.orderNumber !== orderNumber) return o;
        return {
          ...o,
          ...(trackingStatus ? { trackingStatus } : {}),
          ...(paymentStatus ? { payment: { ...o.payment, status: paymentStatus } } : {}),
        };
      }));
    } catch {
      // Refetch on failure
      fetchOrders();
    }
  }

  async function markAsPaid(orderNumber: string) {
    await patchOrder(orderNumber, "Confirmed", "Verified");
  }

  async function handleBulkUpdate() {}

  function toggleSelect(orderNumber: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(orderNumber) ? n.delete(orderNumber) : n.add(orderNumber);
      return n;
    });
  }

  function exportCSV() {
    const rows = [
      ["Order #", "Date", "Customer", "Email", "Phone", "Address", "City", "Items", "Total", "Payment", "Ref #", "Payment Status", "Order Status"],
      ...orders.map((o) => [
        o.orderNumber, o.date, o.customer?.name ?? o.customerName, o.customerEmail,
        o.customer?.phone ?? "", o.customer?.address ?? "", o.customer?.city ?? "",
        o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "), o.total,
        o.payment.method === "gcash" ? "GCash" : "COD",
        o.payment.referenceNumber || "-", o.payment.status, o.trackingStatus,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function printInvoice(order: Order) {
    const w = window.open("", "_blank"); if (!w) return;
    const items = order.items.map((i) =>
      `<tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0">${i.name}</td><td style="text-align:center;border-bottom:1px solid #f0f0f0">${i.quantity}</td><td style="text-align:right;border-bottom:1px solid #f0f0f0">₱${i.price}.00</td><td style="text-align:right;border-bottom:1px solid #f0f0f0">₱${i.price * i.quantity}.00</td></tr>`
    ).join("");
    w.document.write(`<html><head><title>Invoice ${order.orderNumber}</title><style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}h2{color:#d97706}table{width:100%;border-collapse:collapse}th{text-align:left;padding:8px 0;border-bottom:2px solid #eee;font-size:12px;color:#666;text-transform:uppercase}.total{font-weight:bold;font-size:16px}.footer{font-size:11px;color:#999;text-align:center;margin-top:32px}</style></head><body>
    <div style="display:flex;justify-content:space-between;margin-bottom:24px"><div><h2>🌸 Cheni Craft</h2><p style="font-size:12px;color:#666">Official Invoice</p></div><div style="text-align:right"><p style="font-weight:bold">${order.orderNumber}</p><p style="font-size:12px;color:#666">${order.date}</p></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;font-size:13px"><div><p style="font-weight:bold">Bill To:</p><p>${order.customer?.name ?? order.customerName}</p><p>${order.customer?.phone ?? ""}</p><p>${order.customer?.address ?? ""}, ${order.customer?.city ?? ""}</p></div><div><p style="font-weight:bold">Payment:</p><p>${order.payment.method === "gcash" ? "GCash" : "Cash on Delivery"}</p>${order.payment.referenceNumber ? `<p>Ref: ${order.payment.referenceNumber}</p>` : ""}<p>Status: ${order.payment.status}</p></div></div>
    <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${items}</tbody></table>
    <div style="text-align:right;margin-top:16px"><p class="total">Total: ₱${order.total}.00</p></div>
    <div class="footer">Thank you for shopping at Cheni Craft! 🌸</div></body></html>`);
    w.document.close(); w.print();
  }

  const STATUS_FILTERS = ["All", ...TRACKING];
  const filtered = orders
    .filter((o) => filterStatus === "All" || o.trackingStatus === filterStatus)
    .filter((o) => {
      const q = search.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) ||
        (o.customer?.name ?? o.customerName).toLowerCase().includes(q) ||
        (o.customerEmail ?? "").toLowerCase().includes(q);
    });

  return (
    <AdminLayout>
      {newOrderBanner && (
        <div className="mb-5 bg-green-50 border border-green-300 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm font-bold text-green-700">🛎️ New order received! The list has been updated.</p>
          <button onClick={() => setNewOrderBanner(false)} className="text-xs text-green-600 hover:text-green-800 font-semibold">Dismiss</button>
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">⚠️ Low Stock ({lowStock.length})</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className={`text-xs font-semibold px-3 py-1 rounded-full ${p.qty === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                {p.name} — {p.qty === 0 ? "Out of Stock" : `${p.qty} left`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchOrders} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-full transition-colors">🔄 Refresh</button>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order #, name, or email..."
            className="border rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-60" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {["Pending Verification", "Confirmed", "Shipped", "Delivered", "Received"].map((s) => (
          <div key={s} className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{orders.filter((o) => o.trackingStatus === s).length}</p>
            <p className="text-xs text-gray-400 mt-1 font-semibold">{s}</p>
          </div>
        ))}
      </div>

{loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">
          {orders.length === 0 ? "No orders yet. Orders placed by customers will appear here." : "No orders match your filter."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <div key={order.orderNumber} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[order.trackingStatus] ?? "bg-gray-100 text-gray-500"}`}>{order.trackingStatus}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {order.customer?.name ?? order.customerName}
                    {order.customerEmail ? ` · ${order.customerEmail}` : ""}
                    {" · "}{order.date} · ₱{order.total}.00
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); printInvoice(order); }}
                  className="text-xs font-semibold text-gray-400 hover:text-amber-600 border border-gray-200 hover:border-amber-400 px-3 py-1 rounded-full transition-colors mr-2">
                  🖨️ Invoice
                </button>
                <span className="text-gray-400">{expanded === order.orderNumber ? "▲" : "▼"}</span>
              </div>

              {expanded === order.orderNumber && (
                <div className="border-t border-gray-100 p-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                        <p className="font-semibold text-sm text-gray-800">{order.customer?.name ?? order.customerName}</p>
                        {order.customerEmail && <p className="text-xs text-gray-400">{order.customerEmail}</p>}
                        <p className="text-xs text-gray-500">{order.customer?.phone ?? ""}</p>
                        <p className="text-xs text-gray-500">{order.customer?.address ?? ""}{order.customer?.city ? `, ${order.customer.city}` : ""}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Items</p>
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-600">{item.name} x{item.quantity} — ₱{item.price * item.quantity}.00</p>
                        ))}
                        <p className="text-sm font-extrabold text-amber-600 mt-1">Total: ₱{order.total}.00</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Payment</p>
                        <p className="text-xs text-gray-600">Method: <span className="font-semibold">{order.payment.method === "gcash" ? "GCash" : "Cash on Delivery"}</span></p>
                        {order.payment.referenceNumber && <p className="text-xs text-gray-600">Ref #: <span className="font-semibold">{order.payment.referenceNumber}</span></p>}
                      </div>

                      {order.payment.status !== "Verified" && order.trackingStatus !== "Cancelled" && (
                        <button onClick={() => markAsPaid(order.orderNumber)}
                          className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors w-fit">
                          ✓ Mark as Paid & Confirm
                        </button>
                      )}

                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Order Status</p>
                        <div className="flex flex-wrap gap-2">
                          {TRACKING.map((s) => (
                            <button key={s} onClick={() => patchOrder(order.orderNumber, s)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${order.trackingStatus === s ? "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
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
