"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CartItem } from "@/lib/cart";

type Order = {
  orderNumber: string;
  date: string;
  items: CartItem[];
  total: number;
  customer: { name: string; phone: string; address: string; city: string; payment: string };
};

const paymentLabel: Record<string, string> = {
  gcash: "GCash",
  cod: "Cash on Delivery",
  bank: "Bank Transfer",
};

export default function ConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) router.push("/login");
    const stored = localStorage.getItem("lastOrder");
    if (!stored) router.push("/");
    else setOrder(JSON.parse(stored));
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
          <p className="text-sm text-gray-400">Thank you for your purchase, <span className="font-semibold text-gray-700">{order.customer.name}</span>!</p>
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

        {/* Delivery & Payment Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Delivery & Payment</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Deliver to</p>
              <p className="font-semibold text-gray-800">{order.customer.name}</p>
              <p className="text-gray-500">{order.customer.phone}</p>
              <p className="text-gray-500">{order.customer.address}</p>
              <p className="text-gray-500">{order.customer.city}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Payment</p>
              <p className="font-semibold text-gray-800">{paymentLabel[order.customer.payment]}</p>
              <p className="text-xs text-gray-400 mt-2">Status</p>
              <span className="inline-block mt-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/shop" className="flex-1 text-center bg-gray-900 hover:bg-amber-600 text-white font-semibold py-3 rounded-full text-sm transition-colors">
            Continue Shopping
          </Link>
          <Link href="/" className="flex-1 text-center border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-full text-sm transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
