"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";
import { getPromoCodes, savePromoCodes, PromoCode } from "@/lib/promo";
import { getAnnouncements, saveAnnouncements, Announcement } from "@/lib/announcements";

const emptyPromo: Omit<PromoCode, "active"> = { code: "", type: "percent", value: 0, minOrder: 0 };

export default function AdminPromosPage() {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [promoForm, setPromoForm] = useState<Omit<PromoCode, "active">>({ code: "", type: "percent", value: 0, minOrder: 0, expiresAt: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ message: "", type: "sale" as Announcement["type"] });
  const [tab, setTab] = useState<"promos" | "announcements">("promos");

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    setPromos(getPromoCodes());
    setAnnouncements(getAnnouncements());
  }, [router]);

  // --- PROMOS ---
  function handleAddPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoForm.code.trim()) return;
    const updated = [...promos, { ...promoForm, code: promoForm.code.toUpperCase(), active: true }];
    setPromos(updated);
    savePromoCodes(updated);
    setPromoForm({ code: "", type: "percent", value: 0, minOrder: 0, expiresAt: "" });
  }

  function togglePromo(code: string) {
    const updated = promos.map((p) => p.code === code ? { ...p, active: !p.active } : p);
    setPromos(updated);
    savePromoCodes(updated);
  }

  function deletePromo(code: string) {
    const updated = promos.filter((p) => p.code !== code);
    setPromos(updated);
    savePromoCodes(updated);
  }

  // --- ANNOUNCEMENTS ---
  function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!newAnnouncement.message.trim()) return;
    const updated = [...announcements, { ...newAnnouncement, id: Date.now(), active: true }];
    setAnnouncements(updated);
    saveAnnouncements(updated);
    setNewAnnouncement({ message: "", type: "sale" });
  }

  function toggleAnnouncement(id: number) {
    const updated = announcements.map((a) => a.id === id ? { ...a, active: !a.active } : a);
    setAnnouncements(updated);
    saveAnnouncements(updated);
  }

  function deleteAnnouncement(id: number) {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    saveAnnouncements(updated);
  }

  const inputClass = "border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300";
  const tabClass = (t: typeof tab) => `px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === t ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"}`;

  return (
    <AdminLayout>
      <div className="mb-6">
        <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-2xl font-extrabold text-gray-900">Promos & Announcements</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <button className={tabClass("promos")} onClick={() => setTab("promos")}>🎟️ Promo Codes</button>
        <button className={tabClass("announcements")} onClick={() => setTab("announcements")}>📢 Announcements</button>
      </div>

      {/* PROMO CODES */}
      {tab === "promos" && (
        <div className="flex flex-col gap-5">
          {/* Add Form */}
          <form onSubmit={handleAddPromo} className="bg-white rounded-2xl shadow-sm p-5 grid grid-cols-5 gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Code</label>
              <input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SAVE20" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Type</label>
              <select value={promoForm.type} onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value as "percent" | "fixed" })}
                className={inputClass}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (₱)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Value</label>
              <input type="number" min={1} value={promoForm.value} onChange={(e) => setPromoForm({ ...promoForm, value: Number(e.target.value) })}
                className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Min Order (₱)</label>
              <input type="number" min={0} value={promoForm.minOrder} onChange={(e) => setPromoForm({ ...promoForm, minOrder: Number(e.target.value) })}
                className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Expiry Date (optional)</label>
              <input type="date" value={promoForm.expiresAt || ""} onChange={(e) => setPromoForm({ ...promoForm, expiresAt: e.target.value })}
                className={inputClass} />
            </div>
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2 rounded-full text-sm transition-colors">
              Add Code
            </button>
          </form>

          {/* Promo List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-6 text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3 border-b border-gray-100">
              <span className="col-span-2">Code</span>
              <span>Type</span>
              <span>Value</span>
              <span>Min / Expiry</span>
              <span className="text-right">Actions</span>
            </div>
            {promos.map((p) => (
              <div key={p.code} className="grid grid-cols-6 items-center px-5 py-3 border-b border-gray-50">
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{p.code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <span className="text-xs text-gray-600 capitalize">{p.type}</span>
                <span className="text-sm font-semibold text-amber-600">{p.type === "percent" ? `${p.value}%` : `₱${p.value}`}</span>
                <span className="text-xs text-gray-500">
                  ₱{p.minOrder}.00
                  {p.expiresAt && <span className="block text-[10px] text-red-400">Exp: {new Date(p.expiresAt).toLocaleDateString()}</span>}
                </span>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => togglePromo(p.code)} className={`text-xs font-semibold transition-colors ${p.active ? "text-yellow-500 hover:text-yellow-700" : "text-green-500 hover:text-green-700"}`}>
                    {p.active ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => deletePromo(p.code)} className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">Delete</button>
                </div>
              </div>
            ))}
            {promos.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No promo codes yet.</div>}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {tab === "announcements" && (
        <div className="flex flex-col gap-5">
          {/* Add Form */}
          <form onSubmit={handleAddAnnouncement} className="bg-white rounded-2xl shadow-sm p-5 flex gap-3 items-end">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Message</label>
              <input value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                placeholder="e.g. 🌸 Grand Sale! Use CHENNI10 for 10% off!" className={`${inputClass} w-full`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Type</label>
              <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as Announcement["type"] })}
                className={inputClass}>
                <option value="sale">Sale (Amber)</option>
                <option value="info">Info (Dark)</option>
                <option value="warning">Warning (Red)</option>
              </select>
            </div>
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors">
              Add
            </button>
          </form>

          {/* Announcement List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium">{a.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">{a.type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      {a.active ? "Showing" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleAnnouncement(a.id)} className={`text-xs font-semibold transition-colors ${a.active ? "text-yellow-500 hover:text-yellow-700" : "text-green-500 hover:text-green-700"}`}>
                    {a.active ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => deleteAnnouncement(a.id)} className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">Delete</button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No announcements yet.</div>}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
