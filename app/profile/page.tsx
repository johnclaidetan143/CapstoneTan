"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser, saveUser, getSavedAddress, saveAddress } from "@/lib/user";

type Tab = "profile" | "password" | "address";

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [mounted, setMounted] = useState(false);

  // Profile
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [profileMsg, setProfileMsg] = useState("");

  // Password
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  // Address
  const [address, setAddress] = useState({ name: "", phone: "", address: "", city: "" });
  const [addrMsg, setAddrMsg] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    const user = getUser();
    if (user) setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    const saved = getSavedAddress();
    if (saved) setAddress(saved);
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  // --- Profile Save ---
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    const storedUser = localStorage.getItem("registeredUser");
    const userEmail = storedUser ? JSON.parse(storedUser).email : "";
    if (!userEmail) return;

    // Update Supabase
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, name: profile.name, phone: profile.phone }),
    });

    // Update localStorage
    const user = getUser();
    if (user) saveUser({ ...user, name: profile.name, email: profile.email, phone: profile.phone });
    const stored = localStorage.getItem("registeredUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      localStorage.setItem("registeredUser", JSON.stringify({ ...parsed, name: profile.name }));
    }
    window.dispatchEvent(new Event("cartUpdated"));
    setProfileMsg("Profile updated successfully!");
    setTimeout(() => setProfileMsg(""), 3000);
  }

  // --- Password Change ---
  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwMsg("");
    const user = getUser();
    if (!user) return;
    if (pwForm.current !== user.password) { setPwError("Current password is incorrect."); return; }
    if (pwForm.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match."); return; }

    // Update Supabase
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: pwForm.newPw }),
    });

    saveUser({ ...user, password: pwForm.newPw });
    const stored = localStorage.getItem("registeredUser");
    if (stored) localStorage.setItem("registeredUser", JSON.stringify({ ...JSON.parse(stored), password: pwForm.newPw }));
    setPwForm({ current: "", newPw: "", confirm: "" });
    setPwMsg("Password changed successfully!");
    setTimeout(() => setPwMsg(""), 3000);
  }

  // --- Address Save ---
  function handleAddressSave(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      name: address.name.trim(),
      phone: address.phone.trim(),
      address: address.address.trim(),
      city: address.city.trim(),
    };
    if (!next.name || !next.phone || !next.address || !next.city) {
      setAddrMsg("Please fill in all delivery information fields.");
      return;
    }
    saveAddress(next);
    setAddress(next);
    setAddrMsg("Address saved successfully!");
    setTimeout(() => setAddrMsg(""), 3000);
  }

  const tabClass = (t: Tab) =>
    `px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
      tab === t ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
    }`;

  const inputClass = "border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-full";
  const labelClass = "text-xs font-semibold text-gray-600";

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Account</p>
          <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button className={tabClass("profile")} onClick={() => setTab("profile")}>Profile Info</button>
          <button className={tabClass("password")} onClick={() => setTab("password")}>Change Password</button>
          <button className={tabClass("address")} onClick={() => setTab("address")}>Saved Address</button>
        </div>

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <form onSubmit={handleProfileSave} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600">
                {profile.name ? profile.name[0].toUpperCase() : "?"}
              </div>
              <div>
                <p className="font-bold text-gray-900">{profile.name || "—"}</p>
                <p className="text-sm text-gray-400">{profile.email || "—"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Full Name</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Email</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Your email" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Phone Number</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="e.g. 09XX XXX XXXX" className={inputClass} />
            </div>

            {profileMsg && <p className="text-xs text-green-500 font-semibold">{profileMsg}</p>}
            <button type="submit" className="bg-gray-900 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
              Save Changes
            </button>
          </form>
        )}

        {/* PASSWORD TAB */}
        {tab === "password" && (
          <form onSubmit={handlePasswordSave} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Current Password</label>
              <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                placeholder="Enter current password" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>New Password</label>
              <input type="password" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                placeholder="At least 6 characters" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                placeholder="Re-enter new password" className={inputClass} required />
            </div>

            {pwError && <p className="text-xs text-red-400 font-semibold">{pwError}</p>}
            {pwMsg && <p className="text-xs text-green-500 font-semibold">{pwMsg}</p>}
            <button type="submit" className="bg-gray-900 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
              Change Password
            </button>
          </form>
        )}

        {/* ADDRESS TAB */}
        {tab === "address" && (
          <form onSubmit={handleAddressSave} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <p className="text-xs text-gray-400">This address will be auto-filled at checkout.</p>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Full Name</label>
              <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })}
                placeholder="e.g. Juan Dela Cruz" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Phone Number</label>
              <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="e.g. 09XX XXX XXXX" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Street Address</label>
              <input value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })}
                placeholder="House No., Street, Barangay" className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>City / Municipality</label>
              <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="e.g. Cebu City" className={inputClass} required />
            </div>

            {addrMsg && <p className="text-xs text-green-500 font-semibold">{addrMsg}</p>}
            <button type="submit" className="bg-gray-900 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
              Save Address
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
