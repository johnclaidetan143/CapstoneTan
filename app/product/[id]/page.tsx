"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allProducts } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isWishlisted } from "@/lib/wishlist";
import { showToast } from "@/lib/toast";
import ReviewSection from "@/components/ReviewSection";
import { getAverageRating, getReviews } from "@/lib/reviews";
import { getProductStock, getStockLabel } from "@/lib/stock";

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const product = allProducts.find((p) => p.id === Number(id));
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [avg, setAvg] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [stock, setStock] = useState(10);

  useEffect(() => {
    if (product) {
      setWishlisted(isWishlisted(product.id));
      setAvg(getAverageRating(product.id));
      setReviewCount(getReviews(product.id).length);
      setStock(getProductStock(product.id));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fafaf8]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="text-5xl mb-4">🌿</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Product not found</h2>
          <Link href="/shop" className="text-sm text-amber-600 hover:underline">← Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const stockLabel = getStockLabel(stock);

  function handleAddToCart() {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    if (stock === 0) { showToast("This item is out of stock.", "error"); return; }
    addToCart(product!);
    window.dispatchEvent(new Event("cartUpdated"));
    showToast(`${product!.name} added to cart! 🛒`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleWishlist() {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    const updated = toggleWishlist(product!.id);
    setWishlisted(updated.includes(product!.id));
    window.dispatchEvent(new Event("wishlistUpdated"));
    showToast(updated.includes(product!.id) ? "Added to wishlist! ♥" : "Removed from wishlist", updated.includes(product!.id) ? "success" : "info");
  }

  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/shop" className="hover:text-amber-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/categories/${product.slug}`} className="hover:text-amber-600 transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{product.name}</span>
        </div>

        {/* Product Detail */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden grid grid-cols-2 gap-0 mb-10">
          {/* Image */}
          <div className="bg-gray-50 flex items-center justify-center p-8">
            <img
              src={product.img}
              alt={product.name}
              onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }}
              className="w-full max-h-[400px] object-contain rounded-xl"
            />
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              {/* Category + Stock */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1 rounded-full">{product.category}</span>
                {stockLabel && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${stockLabel.color}`}>{stockLabel.label}</span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-400 mt-1">{product.subtitle}</p>

              {/* Rating */}
              {avg > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`text-base ${s <= Math.round(avg) ? "text-amber-400" : "text-gray-200"}`}>★</span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{avg.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
                </div>
              )}

              <p className="text-3xl font-extrabold text-amber-600 mt-4">₱{product.price}.00</p>

              {/* Description */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {(product as typeof product & { description?: string }).description ??
                    `A beautifully handcrafted ${product.name.toLowerCase()} made with love and care. Perfect as a gift or a treat for yourself.`}
                </p>
              </div>

              {/* Features */}
              <div className="mt-4 flex flex-col gap-1.5 text-sm text-gray-500">
                <p>✅ Handcrafted with premium materials</p>
                <p>✅ Gift-ready packaging</p>
                <p>✅ Free shipping on all orders</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className={`flex-1 font-bold py-3 rounded-full text-sm transition-colors ${
                  stock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : added
                    ? "bg-green-500 text-white"
                    : "bg-gray-900 hover:bg-amber-600 text-white"
                }`}
              >
                {stock === 0 ? "Out of Stock" : added ? "✓ Added to Cart!" : "Add to Cart"}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl transition-colors ${
                  wishlisted ? "bg-red-50 border-red-300 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"
                }`}
              >
                {wishlisted ? "♥" : "♡"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={product.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">You might also like</h2>
            <div className="grid grid-cols-3 gap-6">
              {related.map((p) => (
                <Link href={`/product/${p.id}`} key={p.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <img
                    src={p.img}
                    alt={p.name}
                    onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
                    <p className="text-amber-600 font-bold mt-2 text-sm">₱{p.price}.00</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
