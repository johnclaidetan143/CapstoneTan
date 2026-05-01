"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [adminEmail, setAdminEmail] = useState("admin@chenni.com");
  const [adminName, setAdminName] = useState("Admin");
  const [profileMsg, setProfileMsg] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    try { const p = localStorage.getItem("adminProfile"); if (p) { const parsed = JSON.parse(p); setAdminEmail(parsed.email || "admin@chenni.com"); setAdminName(parsed.name || "Admin"); } } catch {}
  }, [router]);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("adminProfile", JSON.stringify({ email: adminEmail, name: adminName }));
    setProfileMsg("Profile updated!"); setTimeout(() => setProfileMsg(""), 3000);
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault(); setPwError(""); setPwMsg("");
    const stored = localStorage.getItem("adminPassword") || "admin123";
    if (pwForm.current !== stored) { setPwError("Current password is incorrect."); return; }
    if (pwForm.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    localStorage.setItem("adminPassword", pwForm.newPw);
    setPwForm({ current: "", newPw: "", confirm: "" });
    setPwMsg("Password changed!"); setTimeout(() => setPwMsg(""), 3000);
  }

  const inputClass = "border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-full";

  return (
    <AdminLayout>
      <div className="mb-6"><p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p><h1 className="text-2xl font-extrabold text-gray-900">Settings</h1></div>
      <div className="grid grid-cols-2 gap-6">
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900">Admin Profile</h2>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600">{adminName[0]?.toUpperCase()}</div>
            <div><p className="font-bold text-gray-900">{adminName}</p><p className="text-xs text-gray-400">{adminEmail}</p></div>
          </div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Display Name</label><input value={adminName} onChange={(e) => setAdminName(e.target.value)} className={inputClass} /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Email</label><input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={inputClass} /></div>
          {profileMsg && <p className="text-xs text-green-500 font-semibold">{profileMsg}</p>}
          <button type="submit" className="bg-gray-900 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">Save Profile</button>
        </form>
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900">Change Password</h2>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Current Password</label><input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} placeholder="Enter current password" className={inputClass} required /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">New Password</label><input type="password" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} placeholder="At least 6 characters" className={inputClass} required /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Re-enter new password" className={inputClass} required /></div>
          {pwError && <p className="text-xs text-red-400 font-semibold">{pwError}</p>}
          {pwMsg && <p className="text-xs text-green-500 font-semibold">{pwMsg}</p>}
          <button type="submit" className="bg-gray-900 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">Change Password</button>
          <p className="text-xs text-gray-400">Default: <span className="font-semibold">admin123</span></p>
        </form>
      </div>
    </AdminLayout>
  );
}
