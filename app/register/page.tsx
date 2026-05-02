"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); return; }
      localStorage.setItem("registeredUser", JSON.stringify({ name: form.name, email: form.email, password: form.password }));
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all shadow-sm";

  return (
    <div className="min-h-screen flex">
      {/* Left — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-900 via-rose-800 to-rose-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 text-center">
          <img src="/logo.png" alt="Cheni Craft" className="h-24 w-auto object-contain mx-auto mb-8 drop-shadow-2xl" />
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Join Our<br />Community</h2>
          <p className="text-rose-200 text-base leading-relaxed max-w-xs">Create an account and start exploring our handcrafted collection today.</p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {["Free shipping on all orders", "Exclusive member deals", "Track your orders easily"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-rose-100 text-sm">
                <span className="text-amber-300">✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#fdfaf7] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="Cheni Craft" className="h-16 w-auto object-contain mx-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
            <p className="text-gray-500 mt-1 text-sm">Join Cheni Craft and start shopping</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input name="name" type="text" placeholder="Juan Dela Cruz" value={form.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Email address</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={form.password} onChange={handleChange} required className={inputClass + " pr-11"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
              <div className="relative">
                <input name="confirm" type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={form.confirm} onChange={handleChange} required className={inputClass + " pr-11"} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showConfirm ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500 text-sm">⚠️</span>
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-700 font-semibold hover:text-rose-800 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
