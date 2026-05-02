"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";
import { allProducts } from "@/lib/products";

type Review = {
  id: string;
  product_id: number;
  order_number: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
  admin_reply?: string;
};

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    fetchReviews();
  }, [router, fetchReviews]);

  if (!mounted) return null;

  async function handleReply(id: string) {
    const text = replyText[id]?.trim();
    if (!text) return;
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminReply: text }),
    });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, admin_reply: text } : r));
    setReplyText((prev) => ({ ...prev, [id]: "" }));
  }

  async function handleDeleteReply(id: string) {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminReply: null }),
    });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, admin_reply: undefined } : r));
  }

  function getProductName(productId: number) {
    return allProducts.find((p) => p.id === productId)?.name ?? `Product #${productId}`;
  }

  const filtered = reviews.filter((r) =>
    r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
    getProductName(r.product_id).toLowerCase().includes(search.toLowerCase()) ||
    r.order_number.toLowerCase().includes(search.toLowerCase())
  );

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Product Reviews</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReviews} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-full transition-colors">🔄 Refresh</button>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviewer, product, order..."
            className="border rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <p className="text-2xl font-extrabold text-gray-900">{reviews.length}</p>
          <p className="text-xs text-gray-400 mt-1 font-semibold">Total Reviews</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <p className="text-2xl font-extrabold text-amber-500">{avg}</p>
          <p className="text-xs text-gray-400 mt-1 font-semibold">Average Rating</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-500">{reviews.filter((r) => r.admin_reply).length}</p>
          <p className="text-xs text-gray-400 mt-1 font-semibold">Replied</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">No reviews yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600">
                      {r.reviewer[0]?.toUpperCase()}
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{r.reviewer}</p>
                    <span className="text-xs text-gray-400">·</span>
                    <p className="text-xs text-amber-600 font-semibold">{getProductName(r.product_id)}</p>
                    <span className="text-xs text-gray-400">·</span>
                    <p className="text-xs text-gray-400">{r.order_number}</p>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-sm ${s <= r.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{r.rating}/5</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">{r.date}</p>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-3">{r.comment}</p>
              {r.admin_reply ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-amber-600 mb-1">🌸 Cheni Craft replied:</p>
                  <p className="text-sm text-gray-700">{r.admin_reply}</p>
                  <button onClick={() => handleDeleteReply(r.id)} className="text-xs text-red-400 hover:text-red-600 font-medium mt-2 transition-colors">Delete Reply</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={replyText[r.id] || ""} onChange={(e) => setReplyText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Write a reply..." onKeyDown={(e) => e.key === "Enter" && handleReply(r.id)}
                    className="flex-1 border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  <button onClick={() => handleReply(r.id)} className="bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-4 rounded-xl transition-colors">Reply</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
