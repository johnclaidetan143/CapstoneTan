"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuickView from "@/components/QuickView";
import ProductCard from "@/components/ProductCard";
import { allProducts } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, getWishlist } from "@/lib/wishlist";
import { showToast } from "@/lib/toast";
import { getStock, getStockLabel } from "@/lib/stock";
import { getAverageRating, getReviews } from "@/lib/reviews";
import { getBestsellers, getTrending } from "@/lib/bestsellers";

const filters = ["All", "Bouquet", "Flower Pot", "Keychain"];

type Product = typeof allProducts[0] & { description?: string };

export default function ShopPage() {
  const router = useRouter();
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [stock, setStock] = useState<Record<number, number>>({});
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);

  useEffect(() => {
    setWishlist(getWishlist());
    setStock(getStock());
    setBestsellers(getBestsellers(4));
    setTrending(getTrending(4));
    const sync = () => setWishlist(getWishlist());
    window.addEventListener("wishlistUpdated", sync);
    return () => window.removeEventListener("wishlistUpdated", sync);
  }, []);

  function handleAddToCart(p: Product) {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    const qty = stock[p.id] ?? 10;
    if (qty === 0) { showToast("This item is out of stock.", "error"); return; }
    addToCart(p);
    window.dispatchEvent(new Event("cartUpdated"));
    showToast(`${p.name} added to cart! 🛒`);
  }

  function handleWishlist(p: Product) {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    const updated = toggleWishlist(p.id);
    setWishlist([...updated]);
    window.dispatchEvent(new Event("wishlistUpdated"));
    showToast(updated.includes(p.id) ? `${p.name} added to wishlist! ♥` : "Removed from wishlist", updated.includes(p.id) ? "success" : "info");
  }

  const filtered = (allProducts as Product[])
    .filter((p) => active === "All" || p.category === active)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.subtitle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header + Search */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Our Collection</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Shop All Products</h1>
          </div>
          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full border rounded-full pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8">
          {filters.map((f) => (
            <button key={f} onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                active === f ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
              }`}>
              {f}
            </button>
          ))}
          {search && (
            <span className="ml-auto text-xs text-gray-400 self-center">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;
            </span>
          )}
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-gray-800">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((p) => {
              const qty = stock[p.id] ?? 10;
              const stockLabel = getStockLabel(qty);
              const avg = getAverageRating(p.id);
              const cnt = getReviews(p.id).length;
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {/* Image with Quick View overlay */}
                  <div className="relative overflow-hidden">
                    <Link href={`/product/${p.id}`}>
                      <img src={p.img} alt={p.name}
                        onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }}
                        className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105" />
                    </Link>
                    {stockLabel && (
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${stockLabel.color}`}>
                        {stockLabel.label}
                      </span>
                    )}
                    {/* Quick View Button — appears on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4">
                      <button
                        onClick={() => setQuickView(p)}
                        className="bg-white text-gray-900 font-semibold text-xs px-5 py-2 rounded-full shadow-md hover:bg-amber-500 hover:text-white transition-colors">
                        👁 Quick View
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{p.category}</span>
                    <Link href={`/product/${p.id}`}>
                      <h3 className="font-bold text-gray-900 mt-2 hover:text-amber-600 transition-colors">{p.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
                    {avg > 0 && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map((s) => <span key={s} className={`text-xs ${s <= Math.round(avg) ? "text-amber-400" : "text-gray-200"}`}>★</span>)}
                        <span className="text-[10px] text-gray-400 ml-1">({cnt})</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-amber-600 font-bold">₱{p.price}.00</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleAddToCart(p)} disabled={qty === 0}
                          className={`text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                            qty === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-amber-600"
                          }`}>
                          {qty === 0 ? "Sold Out" : "Add to Cart"}
                        </button>
                        <button onClick={() => handleWishlist(p)}
                          className={`text-lg leading-none transition-colors ${wishlist.includes(p.id) ? "text-red-400" : "text-gray-300 hover:text-red-400"}`}>
                          {wishlist.includes(p.id) ? "♥" : "♡"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && active === "All" && !search && (
        <div className="max-w-6xl mx-auto px-6 pb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Top Picks</p>
              <h2 className="text-xl font-extrabold text-gray-900">🏆 Bestsellers</h2>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {bestsellers.map((p, i) => (
              <ProductCard key={p.id} product={p} stock={stock[p.id] ?? 10} wishlisted={wishlist.includes(p.id)}
                badge={{ label: i === 0 ? "🥇 #1" : `#${i+1} Bestseller`, color: i === 0 ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700" }}
                onWishlistChange={(id, w) => setWishlist((prev) => w ? [...prev, id] : prev.filter((x) => x !== id))} />
            ))}
          </div>
        </div>
      )}

      {/* TRENDING NOW */}
      {trending.length > 0 && active === "All" && !search && (
        <div className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-rose-500 font-bold tracking-widest uppercase mb-1">What&apos;s Hot</p>
              <h2 className="text-xl font-extrabold text-gray-900">🔥 Trending Now</h2>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} stock={stock[p.id] ?? 10} wishlisted={wishlist.includes(p.id)}
                badge={{ label: "🔥 Trending", color: "bg-rose-100 text-rose-600" }}
                onWishlistChange={(id, w) => setWishlist((prev) => w ? [...prev, id] : prev.filter((x) => x !== id))} />
            ))}
          </div>
        </div>
      )}

      <Footer />

      {/* Quick View Modal */}
      {quickView && (
        <QuickView
          product={quickView}
          stock={stock[quickView.id] ?? 10}
          onClose={() => setQuickView(null)}
        />
      )}
    </div>
  );
}
