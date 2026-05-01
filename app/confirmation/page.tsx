"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CartItem } from "@/lib/cart";
import { saveOrder } from "@/lib/orderHistory";
import { showToast } from "@/lib/toast";

type Order = {
  orderNumber: string;
  date: string;
  items: CartItem[];
  total: number;
  customer: { name: string; phone: string; address: string; city: string };
  payment: {
    method: string;
    bank: string | null;
    accountUsed: string | null;
    referenceNumber: string;
    status: string;
  };
};

const methodLabel: Record<string, string> = {
  gcash: "GCash",
  bank:  "Bank / Card Payment",
};

export default function ConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) router.push("/login");
    const stored = localStorage.getItem("lastOrder");
    if (!stored) router.push("/");
    else {
      const parsed = JSON.parse(stored);
      setOrder(parsed);
      // Save to order history (avoid duplicates)
      const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      const exists = history.find((o: { orderNumber: string }) => o.orderNumber === parsed.orderNumber);
      if (!exists) {
        saveOrder({ ...parsed, trackingStatus: "Pending Verification" });
        setTimeout(() => showToast("📧 Order confirmation sent to your email!", "info"), 1000);
      }
    }
  }, [router]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Order Placed!</h1>
          <p className="text-sm text-gray-400">Thank you, <span className="font-semibold text-gray-700">{order.customer.name}</span>! Your order is pending verification.</p>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-6 py-3 inline-block">
            <p className="text-xs text-amber-600 font-bold tracking-widest uppercase">Order Number</p>
            <p className="text-xl font-extrabold text-amber-600">{order.orderNumber}</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">{order.date}</p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <Image src={item.img} alt={item.name} width={56} height={56} className="rounded-xl object-cover w-14 h-14" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">x{item.quantity}</p>
                </div>
                <p className="font-bold text-gray-800 text-sm">₱{item.price * item.quantity}.00</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-extrabold text-gray-900">
            <span>Total</span>
            <span className="text-amber-600">₱{order.total}.00</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Delivery Details</h2>
          <div className="text-sm flex flex-col gap-1">
            <p className="font-semibold text-gray-800">{order.customer.name}</p>
            <p className="text-gray-500">{order.customer.phone}</p>
            <p className="text-gray-500">{order.customer.address}, {order.customer.city}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Payment Details</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Method</span>
              <span className="font-semibold text-gray-800">{methodLabel[order.payment.method] ?? order.payment.method}</span>
            </div>
            {order.payment.bank && (
              <div className="flex justify-between">
                <span className="text-gray-400">Bank</span>
                <span className="font-semibold text-gray-800">{order.payment.bank}</span>
              </div>
            )}
            {order.payment.accountUsed && (
              <div className="flex justify-between">
                <span className="text-gray-400">Account Used</span>
                <span className="font-semibold text-gray-800">{order.payment.accountUsed}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Reference No.</span>
              <span className="font-semibold text-gray-800">{order.payment.referenceNumber}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-400">Payment Status</span>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                {order.payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/shop" className="flex-1 text-center bg-gray-900 hover:bg-amber-600 text-white font-semibold py-3 rounded-full text-sm transition-colors">
            Continue Shopping
          </Link>
          <Link href="/history" className="flex-1 text-center border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-full text-sm transition-colors">
            View Order History
          </Link>
          <button onClick={() => window.print()}
            className="flex-1 text-center border border-gray-200 hover:border-amber-400 hover:text-amber-600 text-gray-700 font-semibold py-3 rounded-full text-sm transition-colors">
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
