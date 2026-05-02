"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import { getSavedAddress } from "@/lib/user";
import { saveOrder } from "@/lib/orderHistory";

const GCASH = { number: "09XXXXXXXXX", name: "Cheni Craft" };

type FormState = {
  name: string; phone: string; address: string; city: string;
  payment: string; referenceNumber: string;
};

type ErrorState = Partial<FormState>;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "", phone: "", address: "", city: "",
    payment: "", referenceNumber: "",
  });
  const [errors, setErrors] = useState<ErrorState>({});

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) router.push("/login");
    const c = getCart();
    if (c.length === 0) router.push("/orders");
    setCart(c);
    const saved = getSavedAddress();
    if (saved) setForm((prev) => ({ ...prev, name: saved.name, phone: saved.phone, address: saved.address, city: saved.city }));
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function selectPayment(value: string) {
    setForm((prev) => ({ ...prev, payment: value, referenceNumber: "" }));
    setErrors((prev) => ({ ...prev, payment: "", referenceNumber: "" }));
  }

  function validate(): ErrorState {
    const e: ErrorState = {};
    if (!form.name.trim())    e.name    = "Full name is required";
    if (!form.phone.trim())   e.phone   = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim())    e.city    = "City is required";
    if (!form.payment)        e.payment = "Please select a payment method";
    if (form.payment === "gcash" && !form.referenceNumber.trim())
      e.referenceNumber = "Reference number is required";
    return e;
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const isCOD = form.payment === "cod";
    const orderNumber = "CCH-" + Date.now().toString().slice(-6);
    const storedUser = localStorage.getItem("registeredUser");
    const userEmail = storedUser ? JSON.parse(storedUser).email : "";

    const order = {
      orderNumber,
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      customer: { name: form.name, phone: form.phone, address: form.address, city: form.city },
      customerEmail: userEmail,
      payment: {
        method: form.payment,
        bank: null,
        accountUsed: form.payment === "gcash" ? GCASH.number : null,
        referenceNumber: isCOD ? "" : form.referenceNumber,
        status: isCOD ? "Pending Payment" : "Pending Verification",
      },
      trackingStatus: "Pending Verification" as const,
    };

    // Save to localStorage for customer-side history
    localStorage.setItem("lastOrder", JSON.stringify(order));
    const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    const exists = history.find((o: { orderNumber: string }) => o.orderNumber === order.orderNumber);
    if (!exists) saveOrder(order);

    // Save to server so admin can see it
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
    } catch {
      // Non-blocking — order is already saved locally
    }

    clearCart();
    window.dispatchEvent(new Event("cartUpdated"));
    router.push("/confirmation");
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Almost there!</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
                Delivery Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex justify-end">
                  <button type="button" onClick={() => { const s = getSavedAddress(); if (s) setForm((p) => ({ ...p, ...s })); }}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                    Use Saved Address
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Juan Dela Cruz"
                    className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 09XX XXX XXXX"
                    className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Street Address</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="House No., Street, Barangay"
                    className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  {errors.address && <p className="text-xs text-red-400">{errors.address}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">City / Municipality</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Cebu City"
                    className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
                Payment Method
              </h2>

              <div className="flex flex-col gap-3">
                {[
                  { value: "gcash", label: "GCash",           icon: "📱" },
                  { value: "cod",   label: "Cash on Delivery", icon: "💵" },
                ].map((method) => (
                  <label key={method.value} onClick={() => selectPayment(method.value)}
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                      form.payment === method.value ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <input type="radio" name="payment" value={method.value}
                      checked={form.payment === method.value} onChange={() => selectPayment(method.value)}
                      className="accent-amber-500" />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-semibold text-gray-800">{method.label}</span>
                  </label>
                ))}
              </div>
              {errors.payment && <p className="text-xs text-red-400 mt-2">{errors.payment}</p>}

              {/* GCASH FLOW */}
              {form.payment === "gcash" && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Send payment to this GCash number</p>
                    <p className="text-lg font-extrabold text-gray-900">{GCASH.number}</p>
                    <p className="text-sm text-gray-500">Account Name: <span className="font-semibold text-gray-700">{GCASH.name}</span></p>
                    <p className="text-xs text-gray-400 mt-2">After sending, enter your GCash reference number below.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">GCash Reference Number</label>
                    <input name="referenceNumber" value={form.referenceNumber} onChange={handleChange}
                      placeholder="e.g. 1234567890"
                      className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    {errors.referenceNumber && <p className="text-xs text-red-400">{errors.referenceNumber}</p>}
                  </div>
                </div>
              )}

              {/* COD FLOW */}
              {form.payment === "cod" && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when your order arrives. No reference number needed.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-700">₱{item.price * item.quantity}.00</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>₱{total}.00</span>
                </div>
                <div className="flex justify-between font-extrabold text-gray-900 text-lg mt-1">
                  <span>Total</span><span>₱{total}.00</span>
                </div>
              </div>
            </div>

            <button type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-full transition-colors text-sm">
              Place Order
            </button>
            <button type="button" onClick={() => router.push("/orders")}
              className="w-full text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors">
              ← Back to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
