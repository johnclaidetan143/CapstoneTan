"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@chenni.com";
const ADMIN_PASSWORD = "admin123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Check if admin credentials
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("adminLoggedIn", "true");
      router.push("/admin/overview");
      return;
    }

    // Check regular user
    const stored = localStorage.getItem("registeredUser");
    if (!stored) { setError("No account found. Please register first."); return; }
    const user = JSON.parse(stored);
    if (email === user.email && password === user.password) {
      localStorage.setItem("loggedIn", "true");
      router.push("/");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-gray-50 p-8 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-base font-bold text-gray-800 text-center mb-4">
          Chenni Craft Shop
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            className="bg-gray-800 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-700"
          >
            Log In
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-4">
          No account yet?{" "}
          <a href="/register" className="text-gray-700 font-semibold">Register</a>
        </p>
      </div>
    </div>
  );
}
