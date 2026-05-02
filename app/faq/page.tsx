"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const faqs = [
  {
    category: "Orders",
    items: [
      { q: "How do I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout. Fill in your delivery details and choose your payment method." },
      { q: "Can I cancel my order?", a: "Yes, you can cancel your order while it is still in 'Pending Verification' or 'Pending Payment' status. Go to My Orders and click Cancel." },
      { q: "How do I track my order?", a: "Go to My Orders → Placed Orders. You'll see a tracking timeline showing your order's current status." },
    ],
  },
  {
    category: "Shipping",
    items: [
      { q: "Is shipping free?", a: "Yes! We offer free shipping on all orders within the Philippines." },
      { q: "How long does delivery take?", a: "Delivery typically takes 3–7 business days depending on your location." },
      { q: "Do you ship outside the Philippines?", a: "Currently, we only ship within the Philippines. International shipping is coming soon!" },
    ],
  },
  {
    category: "Payment",
    items: [
      { q: "What payment methods do you accept?", a: "We accept GCash and Cash on Delivery (COD)." },
      { q: "How do I pay via GCash?", a: "Select GCash at checkout, send payment to our GCash number, then enter your reference number to confirm." },
      { q: "When will my payment be verified?", a: "GCash payments are typically verified within 24 hours on business days." },
    ],
  },
  {
    category: "Products",
    items: [
      { q: "Are your products handmade?", a: "Yes! Every item is carefully handcrafted with premium felt and quality materials." },
      { q: "Do the flowers wilt?", a: "No! Our felt bouquets and flower pots are made to last forever — no watering needed." },
      { q: "Can I request a custom order?", a: "Yes! Contact us via our Contact page or message us on Facebook/Instagram for custom orders." },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for damaged or defective items. Contact us with photos of the issue." },
      { q: "How do I request a refund?", a: "Contact us via our Contact page with your order number and reason. Refunds are processed within 3–5 business days." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <span className={`text-gray-400 text-lg transition-transform flex-shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="text-sm text-gray-500 leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-14">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-2">Help Center</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
            <p className="text-sm text-gray-500 mt-2">Can&apos;t find your answer? <Link href="/contact" className="text-amber-600 font-semibold hover:underline">Contact us</Link></p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((section) => (
              <div key={section.category} className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">{section.category}</p>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
