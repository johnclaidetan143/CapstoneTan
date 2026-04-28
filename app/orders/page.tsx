"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, removeFromCart, updateQuantity, CartItem, getCartTotal } from "@/lib/cart";

export default function OrdersPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) router.push("/login");
    setCart(getCart());
  }, [router]);

  function handleQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;
    const updated = updateQuantity(productId, quantity);
    setCart([...updated]);
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function handleRemove(productId: number) {
    const updated = removeFromCart(productId);
    setCart(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Cart</p>
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
        </div>

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
            <span className="text-5xl mb-4">📦</span>
            <h2 className="text-lg font-bold text-gray-800 mb-1">No orders yet</h2>
            <p className="text-sm text-gray-400 mb-6">Looks like you haven't added anything yet. Start shopping!</p>
            <Link href="/shop" className="bg-gray-900 hover:bg-amber-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Items */}
            {cart.map((item) => (
              <div key={item.productId} className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-5 items-center gap-4">
                {/* Product */}
                <div className="col-span-2 flex items-center gap-3">
                  <Image src={item.img} alt={item.name} width={64} height={64} className="rounded-xl object-cover w-16 h-16" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.subtitle}</p>
                    <button onClick={() => handleRemove(item.productId)} className="text-xs text-red-400 hover:text-red-600 font-medium mt-1 transition-colors">Remove</button>
                  </div>
                </div>
                {/* Price */}
                <p className="text-center text-sm font-semibold text-gray-700">₱{item.price}.00</p>
                {/* Quantity */}
                <div className="flex items-center justify-center gap-2 border border-gray-200 rounded-full px-2 py-1 w-fit mx-auto">
                  <button onClick={() => handleQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-600 font-bold text-lg transition-colors">−</button>
                  <span className="text-sm font-semibold text-gray-800 w-5 text-center">{item.quantity}</span>
                  <button onClick={() => handleQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-600 font-bold text-lg transition-colors">+</button>
                </div>
                {/* Subtotal */}
                <p className="text-right font-bold text-amber-600">₱{item.price * item.quantity}.00</p>
              </div>
            ))}

            {/* Total */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between mt-2">
              <div>
                <p className="text-sm text-gray-400">Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</p>
                <p className="text-2xl font-extrabold text-gray-900">₱{getCartTotal()}.00</p>
              </div>
              <button onClick={() => router.push("/checkout")} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-full transition-colors">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
