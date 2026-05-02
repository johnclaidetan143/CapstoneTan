"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!token || !email) router.push("/forgot-password");
  }, [token, email, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);

    // Verify token
    const { data } = await supabase.from("profiles").select("reset_token, reset_expires")
      .eq("email", email!).single();

    if (!data || data.reset_token !== token) { setError("Invalid or expired reset link."); setLoading(false); return; }
    if (new Date(data.reset_expires) < new Date()) { setError("Reset link has expired. Please request a new one."); setLoading(false); return; }

    // Update password
    await supabase.from("profiles").update({ password, reset_token: null, reset_expires: null }).eq("email", email!);

    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (done) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <span className="text-4xl">✅</span>
        <p className="text-sm font-semibold text-gray-800 mt-3">Password reset successfully!</p>
        <p className="text-xs text-gray-400 mt-1">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-gray-50 p-8 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-base font-bold text-gray-800 text-center mb-1">Cheni Craft</h1>
        <p className="text-xs text-center text-gray-400 mb-5">Enter your new password</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input type={showPw ? "text" : "password"} placeholder="New password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="w-full border rounded-lg px-3 py-1.5 pr-9 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{showPw ? "🙈" : "👁️"}</button>
          </div>
          <input type="password" placeholder="Confirm new password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} required
            className="border rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-gray-800 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-700 disabled:opacity-60">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
