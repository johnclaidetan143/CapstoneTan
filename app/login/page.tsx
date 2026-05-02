"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP step
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [pendingUser, setPendingUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [devOtp, setDevOtp] = useState(""); // show OTP for testing
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid email or password."); return; }

      const user = data.user;

      // Admin skips OTP
      if (user.role === "admin") {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminUser", JSON.stringify(user));
        router.push("/admin/dashboard");
        return;
      }

      // Generate OTP for regular users
      const otpRes = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const otpData = await otpRes.json();
      setPendingUser(user);
      setDevOtp(otpData.otp ?? ""); // show for testing since no email
      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the complete 6-digit code."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid OTP."); return; }
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("registeredUser", JSON.stringify(pendingUser));
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-900 via-rose-800 to-amber-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 text-center">
          <img src="/logo.png" alt="Cheni Craft" className="h-24 w-auto object-contain mx-auto mb-8 drop-shadow-2xl" />
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Handcrafted<br />with Love</h2>
          <p className="text-rose-200 text-base leading-relaxed max-w-xs">Discover our collection of beautiful felt bouquets, flower pots, and charming keychains.</p>
          <div className="flex justify-center gap-3 mt-8">
            {["🌸", "💐", "🌿", "✨"].map((e, i) => (
              <span key={i} className="text-2xl opacity-80">{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#fdfaf7] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="Cheni Craft" className="h-16 w-auto object-contain mx-auto" />
          </div>

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                <p className="text-gray-500 mt-1 text-sm">Sign in to your Cheni Craft account</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email address</label>
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all shadow-sm" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <Link href="/forgot-password" className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all shadow-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <p className="text-red-600 text-xs font-medium">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-rose-700 font-semibold hover:text-rose-800 transition-colors">Create one</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Verify your identity</h1>
                <p className="text-gray-500 mt-1 text-sm">Enter the 6-digit code shown below</p>
              </div>

              {/* Show OTP for testing (since no email service) */}
              {devOtp && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Your OTP Code</p>
                  <p className="text-2xl font-extrabold text-amber-600 tracking-[0.3em]">{devOtp}</p>
                  <p className="text-xs text-amber-600 mt-1">Valid for 5 minutes</p>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-700">6-Digit OTP Code</label>
                  <div className="flex gap-3 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <p className="text-red-600 text-xs font-medium">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || otp.join("").length < 6}
                  className="bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : "Verify & Sign In"}
                </button>

                <button type="button" onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors text-center">
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
