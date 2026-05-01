"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    localStorage.setItem("registeredUser", JSON.stringify({
      name: form.name,
      email: form.email,
      password: form.password,
    }));

    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-gray-50 p-8 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Chenni Craft Shop
        </h1>
        <p className="text-xs text-center text-gray-400 mb-4">Create an account</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Full Name</label>
            <input name="name" type="text" placeholder="Enter your full name"
              value={form.name} onChange={handleChange} required
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input name="email" type="email" placeholder="Enter your email"
              value={form.email} onChange={handleChange} required
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Password</label>
            <input name="password" type="password" placeholder="Enter your password"
              value={form.password} onChange={handleChange} required
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Confirm Password</label>
            <input name="confirm" type="password" placeholder="Re-enter your password"
              value={form.confirm} onChange={handleChange} required
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit"
            className="bg-gray-800 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-700">
            Register
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-700 font-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
}
