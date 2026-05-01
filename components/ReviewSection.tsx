"use client";
import { useEffect, useState } from "react";
import { getReviews, saveReview, hasReviewed, getAverageRating, Review } from "@/lib/reviews";
import { getOrderHistory } from "@/lib/orderHistory";
import { showToast } from "@/lib/toast";

function Stars({ rating, onSelect }: { rating: number; onSelect?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect?.(s)}
          onMouseEnter={() => onSelect && setHovered(s)}
          onMouseLeave={() => onSelect && setHovered(0)}
          className={`text-xl transition-colors ${
            s <= (hovered || rating) ? "text-amber-400" : "text-gray-200"
          } ${onSelect ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [eligibleOrders, setEligibleOrders] = useState<{ orderNumber: string; productName: string }[]>([]);
  const [form, setForm] = useState({ orderNumber: "", rating: 0, comment: "" });
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("loggedIn"));
    setReviews(getReviews(productId));
    setAvg(getAverageRating(productId));

    // Find delivered orders that contain this product and haven't been reviewed
    const history = getOrderHistory();
    const eligible = history
      .filter((o) => o.trackingStatus === "Delivered" && o.items.some((i) => i.productId === productId) && !hasReviewed(o.orderNumber, productId))
      .map((o) => ({ orderNumber: o.orderNumber, productName: o.items.find((i) => i.productId === productId)!.name }));
    setEligibleOrders(eligible);
  }, [productId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.orderNumber) { setError("Please select an order."); return; }
    if (form.rating === 0) { setError("Please select a star rating."); return; }
    if (!form.comment.trim()) { setError("Please write a review."); return; }

    const user = localStorage.getItem("registeredUser");
    const reviewer = user ? JSON.parse(user).name : "Anonymous";

    const saved = saveReview({ productId, orderNumber: form.orderNumber, reviewer, rating: form.rating, comment: form.comment });
    if (!saved) { setError("You already reviewed this product for this order."); return; }

    setReviews(getReviews(productId));
    setAvg(getAverageRating(productId));
    setEligibleOrders((prev) => prev.filter((o) => o.orderNumber !== form.orderNumber));
    setForm({ orderNumber: "", rating: 0, comment: "" });
    showToast("Review submitted! Thank you 🌸", "success");
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1">
            <Stars rating={Math.round(avg)} />
            <span className="text-sm text-gray-500 font-semibold">{avg.toFixed(1)} ({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Review Form — only if logged in and has eligible delivered orders */}
      {loggedIn && eligibleOrders.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col gap-4">
          <h3 className="font-bold text-gray-900">Leave a Review</h3>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Select Order</label>
            <select
              value={form.orderNumber}
              onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
              className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="">— Choose an order —</option>
              {eligibleOrders.map((o) => (
                <option key={o.orderNumber} value={o.orderNumber}>{o.orderNumber}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Rating</label>
            <Stars rating={form.rating} onSelect={(r) => setForm({ ...form, rating: r })} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Your Review</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Share your experience..."
              rows={3}
              className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
          <button type="submit" className="bg-gray-900 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
            Submit Review
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600">
                    {r.reviewer[0].toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{r.reviewer}</p>
                </div>
                <p className="text-xs text-gray-400">{r.date}</p>
              </div>
              <Stars rating={r.rating} />
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.comment}</p>
              {(r as (typeof r) & { adminReply?: string }).adminReply && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-600 mb-1">🌸 Chenni Craft Shop replied:</p>
                  <p className="text-sm text-gray-700">{(r as (typeof r) & { adminReply?: string }).adminReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
