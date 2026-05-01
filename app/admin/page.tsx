"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const validEmail = "admin@chenni.com";
    const validPassword = "admin123";

    if (email.trim().toLowerCase() === validEmail && password === validPassword) {
      localStorage.setItem("adminLoggedIn", "true");
      router.push("/admin/overview");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-3xl">🌸</span>
          <h1 className="text-xl font-extrabold text-gray-900 mt-2">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">Chenni Craft Shop</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@chenni.com"
              className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
          <button
            type="submit"
            className="bg-gray-900 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
          >
            Login as Admin
          </button>
        </form>

        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-xs text-amber-700 font-bold mb-1">Admin Credentials</p>
          <p className="text-xs text-gray-700">📧 admin@chenni.com</p>
          <p className="text-xs text-gray-700">🔑 admin123</p>
        </div>
      </div>
    </div>
  );
}
