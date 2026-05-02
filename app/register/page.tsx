"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP step
  const [step, setStep] = useState<"register" | "otp">("register");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resending, setResending] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

      // Save locally
      localStorage.setItem("registeredUser", JSON.stringify({ name: form.name, email: form.email, password: form.password }));

      // Send OTP
      await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });

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
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid OTP."); return; }
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

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#fdfaf7] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="Cheni Craft" className="h-16 w-auto object-contain mx-auto" />
          </div>

          {step === "register" ? (
            <>
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
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Verify your email</h1>
                <p className="text-gray-500 mt-2 text-sm">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-gray-800">{form.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-700">Enter OTP Code</label>
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
                  <p className="text-xs text-gray-400">Code expires in 5 minutes</p>
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
                  ) : "Verify & Continue"}
                </button>

                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => { setStep("register"); setOtp(["","","","","",""]); setError(""); }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    ← Back
                  </button>
                  <button type="button" disabled={resending}
                    onClick={async () => {
                      setResending(true);
                      await fetch("/api/auth/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email }) });
                      setResending(false);
                      setOtp(["","","","","",""]);
                      setError("");
                      otpRefs.current[0]?.focus();
                    }}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors disabled:opacity-50">
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
