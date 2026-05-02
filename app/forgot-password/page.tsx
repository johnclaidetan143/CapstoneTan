"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset email.");
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-gray-50 p-8 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-base font-bold text-gray-800 text-center mb-1">Cheni Craft</h1>
        <p className="text-xs text-center text-gray-400 mb-5">Reset your password</p>

        {sent ? (
          <div className="text-center">
            <span className="text-4xl">📧</span>
            <p className="text-sm font-semibold text-gray-800 mt-3">Check your email!</p>
            <p className="text-xs text-gray-400 mt-1">We sent a password reset link to <span className="font-semibold text-gray-700">{email}</span></p>
            <Link href="/login" className="block mt-5 text-xs font-semibold text-gray-700 hover:text-amber-600 transition-colors">← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300" />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="bg-gray-800 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-700 disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link href="/login" className="text-xs text-center text-gray-400 hover:text-gray-600 transition-colors">← Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
}
