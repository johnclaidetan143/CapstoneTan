"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, removeFromCart, updateQuantity, CartItem } from "@/lib/cart";
import { getOrderHistory, markAllNotificationsRead, getUnreadNotifications, OrderRecord } from "@/lib/orderHistory";
import { restoreStock, getProductStock } from "@/lib/stock";
import { getAverageRating, getReviews } from "@/lib/reviews";
import { showToast } from "@/lib/toast";
import { allProducts } from "@/lib/products";

const TRACKING_STEPS = ["Pending Verification", "Confirmed", "Shipped", "Delivered"] as const;

function OrderTimeline({ status }: { status: string }) {
  const cancelled = status === "Cancelled";
  const currentIdx = TRACKING_STEPS.indexOf(status as typeof TRACKING_STEPS[number]);
  return (
    <div className="flex items-center gap-0 mb-4">
      {TRACKING_STEPS.map((step, i) => {
        const done = !cancelled && currentIdx >= i;
        const active = !cancelled && currentIdx === i;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                cancelled ? "border-red-300 bg-red-50 text-red-400" :
                done ? "border-amber-500 bg-amber-500 text-white" : "border-gray-200 bg-white text-gray-300"
              } ${active ? "ring-2 ring-amber-300 ring-offset-1" : ""}`}>
                {cancelled ? "✕" : done ? "✓" : i + 1}
              </div>
              <p className={`text-[9px] font-semibold mt-1 text-center w-16 leading-tight ${
                cancelled ? "text-red-400" : done ? "text-amber-600" : "text-gray-300"
              }`}>{cancelled && i === 0 ? "Cancelled" : step}</p>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${
                !cancelled && currentIdx > i ? "bg-amber-500" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}


  "Pending Verification": "bg-yellow-100 text-yellow-700",
  "Pending Payment":      "bg-orange-100 text-orange-600",
  "Confirmed":            "bg-blue-100 text-blue-700",
  "Shipped":              "bg-purple-100 text-purple-700",
  "Delivered":            "bg-green-100 text-green-700",
  "Cancelled":            "bg-red-100 text-red-600",
};

const methodLabel: Record<string, string> = {
  gcash: "GCash", bank: "Bank / Card", cod: "Cash on Delivery",
};

function StarDisplay({ productId }: { productId: number }) {
  const avg = getAverageRating(productId);
  const count = getReviews(productId).length;
  if (avg === 0) return null;
  return (
    <span className="flex items-center gap-0.5 text-xs text-gray-400">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={s <= Math.round(avg) ? "text-amber-400" : "text-gray-200"}>★</span>
      ))}
      <span className="ml-1">({count})</span>
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"cart" | "orders">("cart");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    setCart(getCart());

    const storedUser = localStorage.getItem("registeredUser");
    const userEmail = storedUser ? JSON.parse(storedUser).email : "";

    if (userEmail) {
      fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`)
        .then((r) => r.json())
        .then((data) => {
          const fetched: OrderRecord[] = (data.orders ?? []).map((o: {
            orderNumber: string; date: string; items: OrderRecord["items"];
            total: number; customer: OrderRecord["customer"]; payment: OrderRecord["payment"];
            trackingStatus: OrderRecord["trackingStatus"]; notificationRead?: boolean; cancelledAt?: string;
          }) => ({
            orderNumber: o.orderNumber,
            date: o.date,
            items: o.items,
            total: o.total,
            customer: o.customer,
            payment: o.payment,
            trackingStatus: o.trackingStatus,
            notificationRead: o.notificationRead ?? false,
            cancelledAt: o.cancelledAt,
          }));
          setOrders(fetched);
          setUnreadCount(fetched.filter((o) => !o.notificationRead).length);
        })
        .catch(() => setOrders([]));
    } else {
      setOrders([]);
    }

    setMounted(true);
  }, [router]);

  function handleQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;
    const currentItem = cart.find((i) => i.productId === productId);
    if (!currentItem) return;
    const stockLeft = getProductStock(productId) + currentItem.quantity; // available + what's already in cart
    if (quantity > stockLeft) { showToast(`Only ${stockLeft} available in stock.`, "error"); return; }
    setCart([...updateQuantity(productId, quantity)]);
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function handleRemove(productId: number) {
    setCart(removeFromCart(productId));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  async function handleCancel(order: OrderRecord) {
    if (!confirm(`Cancel order ${order.orderNumber}?`)) return;
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: order.orderNumber, trackingStatus: "Cancelled" }),
      });
      setOrders((prev) => prev.map((o) =>
        o.orderNumber === order.orderNumber ? { ...o, trackingStatus: "Cancelled" as const } : o
      ));
      restoreStock(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      showToast(`Order ${order.orderNumber} cancelled.`, "info");
    } catch {
      showToast("Failed to cancel order.", "error");
    }
  }

  function handleViewOrders() {
    setTab("orders");
    markAllNotificationsRead();
    setUnreadCount(0);
  }

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const STATUS_FILTERS = ["All", "Pending Verification", "Pending Payment", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  const filteredOrders = orders
    .filter((o) => filterStatus === "All" || o.trackingStatus === filterStatus)
    .filter((o) => o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase())));

  const tabClass = (t: typeof tab) =>
    `px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === t ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"}`;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">My Account</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Orders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button className={tabClass("cart")} onClick={() => setTab("cart")}>
            🛒 Cart {cart.length > 0 && <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cart.length}</span>}
          </button>
          <button className={tabClass("orders")} onClick={handleViewOrders}>
            📋 Placed Orders
            {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>}
            {unreadCount === 0 && orders.length > 0 && <span className="ml-1 bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{orders.length}</span>}
          </button>
        </div>

        {/* CART TAB */}
        {tab === "cart" && (
          <>
            {cart.length > 0 && (
              <div className="grid grid-cols-5 text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-1">
                <span className="col-span-2">Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Subtotal</span>
              </div>
            )}
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🛒</span>
                <h2 className="text-lg font-bold text-gray-800 mb-1">Your cart is empty</h2>
                <p className="text-sm text-gray-400 mb-6">Add items to your cart to get started.</p>
                <Link href="/shop" className="bg-gray-900 hover:bg-amber-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">Browse Shop</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-5 items-center gap-4">
                    <div className="col-span-2 flex items-center gap-3">
                      <img src={item.img} alt={item.name} onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }} className="rounded-xl object-cover w-16 h-16" />
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                        <StarDisplay productId={item.productId} />
                        <button onClick={() => handleRemove(item.productId)} className="text-xs text-red-400 hover:text-red-600 font-medium mt-1 transition-colors">Remove</button>
                      </div>
                    </div>
                    <p className="text-center text-sm font-semibold text-gray-700">₱{item.price}.00</p>
                    <div className="flex items-center justify-center gap-2 border border-gray-200 rounded-full px-2 py-1 w-fit mx-auto">
                      <button onClick={() => handleQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-600 font-bold text-lg">−</button>
                      <span className="text-sm font-semibold text-gray-800 w-5 text-center">{item.quantity}</span>
                      <button onClick={() => handleQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-600 font-bold text-lg">+</button>
                    </div>
                    <p className="text-right font-bold text-amber-600">₱{item.price * item.quantity}.00</p>
                  </div>
                ))}
                <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between mt-2">
                  <div>
                    <p className="text-sm text-gray-400">Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</p>
                    <p className="text-2xl font-extrabold text-gray-900">₱{cartTotal}.00</p>
                  </div>
                  <button onClick={() => router.push("/checkout")} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-full transition-colors">Checkout</button>
                </div>

                {/* Related Products — You might also like */}
                {(() => {
                  const cartIds = cart.map((i) => i.productId);
                  const cartCategories = cart.map((i) => allProducts.find((p) => p.id === i.productId)?.category).filter(Boolean);
                  const suggestions = allProducts.filter((p) => !cartIds.includes(p.id) && cartCategories.includes(p.category)).slice(0, 3);
                  if (suggestions.length === 0) return null;
                  return (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-gray-700 mb-3">You might also like</p>
                      <div className="grid grid-cols-3 gap-4">
                        {suggestions.map((p) => (
                          <Link href={`/product/${p.id}`} key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <img src={p.img} alt={p.name} onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }} className="w-full h-32 object-cover" />
                            <div className="p-3">
                              <p className="font-semibold text-xs text-gray-900">{p.name}</p>
                              <p className="text-amber-600 font-bold text-xs mt-1">₱{p.price}.00</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {/* PLACED ORDERS TAB */}
        {tab === "orders" && (
          <>
            {/* Search + Filter */}
            <div className="flex gap-3 mb-4 flex-wrap">
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

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">📦</span>
                <h2 className="text-lg font-bold text-gray-800 mb-1">{orders.length === 0 ? "No orders placed yet" : "No orders match your filter"}</h2>
                <p className="text-sm text-gray-400 mb-6">{orders.length === 0 ? "Your placed orders will appear here after checkout." : "Try a different status or search term."}</p>
                {orders.length === 0 && <Link href="/shop" className="bg-gray-900 hover:bg-amber-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">Start Shopping</Link>}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => (
                  <div key={order.orderNumber} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[order.trackingStatus] ?? "bg-gray-100 text-gray-500"}`}>{order.trackingStatus}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.payment.status === "Verified" ? "bg-green-100 text-green-700" : order.payment.status === "Rejected" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>{order.payment.status}</span>
                        </div>
                        <p className="text-xs text-gray-400">{order.date} · {order.items.length} item(s) · ₱{order.total}.00</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(order.trackingStatus === "Pending Verification" || order.trackingStatus === "Pending Payment") && (
                          <button onClick={(e) => { e.stopPropagation(); handleCancel(order); }}
                            className="text-xs font-semibold text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1 rounded-full transition-colors">
                            Cancel
                          </button>
                        )}
                        <span className="text-gray-400">{expanded === order.orderNumber ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {expanded === order.orderNumber && (
                      <div className="border-t border-gray-100 p-5 flex flex-col gap-4">
                        <OrderTimeline status={order.trackingStatus} />
                        {order.cancelledAt && <p className="text-xs text-red-400 font-semibold">Cancelled on {order.cancelledAt}</p>}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</p>
                          {order.items.map((item) => (
                            <div key={item.productId} className="flex items-center gap-3 mb-3">
                              <img src={item.img} alt={item.name} onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }} className="w-14 h-14 rounded-xl object-cover" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                <StarDisplay productId={item.productId} />
                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-sm text-gray-800">₱{item.price * item.quantity}.00</p>
                            </div>
                          ))}
                          <div className="flex justify-between font-extrabold text-gray-900 border-t border-gray-100 pt-3">
                            <span>Total</span><span className="text-amber-600">₱{order.total}.00</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Deliver to</p>
                            <p className="font-semibold text-gray-800">{order.customer.name}</p>
                            <p className="text-gray-500 text-xs">{order.customer.phone}</p>
                            <p className="text-gray-500 text-xs">{order.customer.address}, {order.customer.city}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Payment</p>
                            <p className="font-semibold text-gray-800">{methodLabel[order.payment.method] ?? order.payment.method}</p>
                            {order.payment.bank && <p className="text-xs text-gray-500">Bank: {order.payment.bank}</p>}
                            {order.payment.referenceNumber && <p className="text-xs text-gray-500">Ref #: <span className="font-semibold text-gray-700">{order.payment.referenceNumber}</span></p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
