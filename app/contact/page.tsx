"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { setError("Failed to send. Please try again."); return; }
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-14">
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-8 text-center">
            <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Get in Touch</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Contact Us</h1>
            <p className="text-sm text-gray-500 mt-2">We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you soon.</p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: "📍", label: "Address", value: "Cebu City, Philippines" },
              { icon: "📞", label: "Phone", value: "+63 912 345 6789" },
              { icon: "✉️", label: "Email", value: "chenicraftshop@gmail.com" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-2">{item.label}</p>
                <p className="text-xs text-gray-600 mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {sent ? (
              <div className="text-center py-8">
                <span className="text-4xl">🌸</span>
                <h2 className="text-lg font-extrabold text-gray-900 mt-3">Message Sent!</h2>
                <p className="text-sm text-gray-500 mt-1">Thank you for reaching out. We&apos;ll reply as soon as possible.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-400 px-6 py-2.5 rounded-full transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your message here..."
                    className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2.5 rounded-full text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
                {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
