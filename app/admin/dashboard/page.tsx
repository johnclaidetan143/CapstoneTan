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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace("/admin"); return; }
    setOrders(getOrderHistory());
    setLowStock(getLowStockProducts());
  }, [router]);

  function persist(updated: OrderRecord[]) {
    setOrders(updated);
    localStorage.setItem("orderHistory", JSON.stringify(updated));
    window.dispatchEvent(new Event("orderUpdated"));
  }

  function updateTrackingStatus(orderNumber: string, status: typeof TRACKING[number]) {
    persist(orders.map((o) => o.orderNumber === orderNumber ? { ...o, trackingStatus: status, notificationRead: false } : o));
  }

  function updatePaymentStatus(orderNumber: string, status: string) {
    persist(orders.map((o) => o.orderNumber === orderNumber ? { ...o, payment: { ...o.payment, status }, notificationRead: false } : o));
  }

  function markAsPaid(orderNumber: string) {
    persist(orders.map((o) => o.orderNumber === orderNumber
      ? { ...o, payment: { ...o.payment, status: "Verified" }, trackingStatus: "Confirmed" as const, notificationRead: false }
      : o));
  }

  // Bulk status update
  function handleBulkUpdate() {
    if (!bulkStatus || selected.size === 0) return;
    persist(orders.map((o) => selected.has(o.orderNumber)
      ? { ...o, trackingStatus: bulkStatus as typeof TRACKING[number], notificationRead: false }
      : o));
    setSelected(new Set());
    setBulkStatus("");
  }

  function toggleSelect(orderNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(orderNumber) ? next.delete(orderNumber) : next.add(orderNumber);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((o) => o.orderNumber)));
  }

  // Export CSV
  function exportCSV() {
    const rows = [
      ["Order #", "Date", "Customer", "Phone", "Address", "City", "Items", "Total", "Payment", "Ref #", "Payment Status", "Order Status"],
      ...orders.map((o) => [
        o.orderNumber, o.date, o.customer.name, o.customer.phone,
        o.customer.address, o.customer.city,
        o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "),
        o.total, o.payment.method === "gcash" ? "GCash" : "COD",
        o.payment.referenceNumber || "-", o.payment.status, o.trackingStatus,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  // Print Invoice
  function printInvoice(order: OrderRecord) {
    const w = window.open("", "_blank");
    if (!w) return;
    const items = order.items.map((i) =>
      `<tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0">${i.name}</td><td style="text-align:center;border-bottom:1px solid #f0f0f0">${i.quantity}</td><td style="text-align:right;border-bottom:1px solid #f0f0f0">₱${i.price}.00</td><td style="text-align:right;border-bottom:1px solid #f0f0f0">₱${i.price * i.quantity}.00</td></tr>`
    ).join("");
    w.document.write(`<html><head><title>Invoice ${order.orderNumber}</title>
    <style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto;color:#111}
    h2{color:#d97706}table{width:100%;border-collapse:collapse}th{text-align:left;padding:8px 0;border-bottom:2px solid #eee;font-size:12px;color:#666;text-transform:uppercase}
    .total{font-weight:bold;font-size:16px}.footer{font-size:11px;color:#999;text-align:center;margin-top:32px}
    .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:bold;background:#fef3c7;color:#92400e}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px">
      <div><h2>🌸 Chenni Craft Shop</h2><p style="font-size:12px;color:#666">Official Invoice</p></div>
      <div style="text-align:right"><p style="font-size:13px;font-weight:bold">${order.orderNumber}</p><p style="font-size:12px;color:#666">${order.date}</p><span class="badge">${order.trackingStatus}</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;font-size:13px">
      <div><p style="font-weight:bold;margin-bottom:4px">Bill To:</p><p>${order.customer.name}</p><p>${order.customer.phone}</p><p>${order.customer.address}, ${order.customer.city}</p></div>
      <div><p style="font-weight:bold;margin-bottom:4px">Payment:</p><p>${order.payment.method === "gcash" ? "GCash" : "Cash on Delivery"}</p>${order.payment.referenceNumber ? `<p>Ref: ${order.payment.referenceNumber}</p>` : ""}<p>Status: ${order.payment.status}</p></div>
    </div>
    <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${items}</tbody></table>
    <div style="text-align:right;margin-top:16px"><p class="total">Total: ₱${order.total}.00</p></div>
    <div class="footer">Thank you for shopping at Chenni Craft Shop! 🌸</div></body></html>`);
    w.document.close(); w.print();
  }

  const STATUS_FILTERS = ["All", ...TRACKING];
  const filtered = orders
    .filter((o) => filterStatus === "All" || o.trackingStatus === filterStatus)
    .filter((o) => o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customer.name.toLowerCase().includes(search.toLowerCase()));

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

      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
            ⬇ Export CSV
          </button>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or name..."
            className="border rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-52" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {["Pending Verification", "Confirmed", "Shipped", "Delivered"].map((s) => (
          <div key={s} className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{orders.filter((o) => o.trackingStatus === s).length}</p>
            <p className="text-xs text-gray-400 mt-1 font-semibold">{s}</p>
          </div>
        ))}
      </div>

      {/* Bulk Update Bar */}
      {selected.size > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
          <p className="text-sm font-semibold text-amber-700">{selected.size} order(s) selected</p>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            className="border rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option value="">— Set Status —</option>
            {TRACKING.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={handleBulkUpdate}
            className="bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
            Apply to Selected
          </button>
          <button onClick={() => setSelected(new Set())}
            className="text-xs text-gray-400 hover:text-gray-600 font-semibold">
            Clear
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">No orders found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Select All */}
          <div className="flex items-center gap-2 px-2">
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
              onChange={selectAll} className="accent-amber-500 w-4 h-4" />
            <span className="text-xs text-gray-400 font-semibold">Select All ({filtered.length})</span>
          </div>

          {filtered.map((order) => (
            <div key={order.orderNumber} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}>
                <input type="checkbox" checked={selected.has(order.orderNumber)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelect(order.orderNumber)}
                  className="accent-amber-500 w-4 h-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[order.trackingStatus]}`}>{order.trackingStatus}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${paymentColor[order.payment.status] ?? "bg-gray-100 text-gray-500"}`}>{order.payment.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">{order.customer.name} · {order.date} · ₱{order.total}.00</p>
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
                        <p className="text-xs text-gray-600">Method: <span className="font-semibold">{order.payment.method === "gcash" ? "GCash" : "Cash on Delivery"}</span></p>
                        {order.payment.referenceNumber && <p className="text-xs text-gray-600">Ref #: <span className="font-semibold text-gray-800">{order.payment.referenceNumber}</span></p>}
                      </div>

                      {order.payment.status !== "Verified" && order.trackingStatus !== "Cancelled" && (
                        <button onClick={() => markAsPaid(order.orderNumber)}
                          className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors w-fit">
                          ✓ Mark as Paid & Confirm
                        </button>
                      )}

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
