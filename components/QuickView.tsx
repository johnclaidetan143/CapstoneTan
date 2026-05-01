"use client";
import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isWishlisted } from "@/lib/wishlist";
import { showToast } from "@/lib/toast";
import { getAverageRating, getReviews } from "@/lib/reviews";
import { getStockLabel, getProductStock } from "@/lib/stock";
import { useRouter } from "next/navigation";
import { BOUQUET_SIZES, POT_SIZES } from "@/lib/products";

type Product = {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  slug: string;
  img: string;
  description?: string;
};

type Props = {
  product: Product;
  stock: number;
  onClose: () => void;
};

export default function QuickView({ product, stock: initialStock, onClose }: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(initialStock);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(isWishlisted(product.id));

  const sizes = product.category === "Bouquet" ? BOUQUET_SIZES : product.category === "Flower Pot" ? POT_SIZES : null;
  const [selectedSize, setSelectedSize] = useState(sizes ? sizes[0].label : "");
  const avg = getAverageRating(product.id);
  const reviewCount = getReviews(product.id).length;
  const stockLabel = getStockLabel(stock);

  const sizeObj = sizes?.find((s) => s.label === selectedSize);
  const finalPrice = product.price + (sizeObj?.priceAdd ?? 0);
  const productWithSize = { ...product, price: finalPrice, subtitle: sizes ? `${selectedSize} — ${product.subtitle}` : product.subtitle };

  function handleAddToCart() {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); onClose(); return; }
    if (stock === 0) { showToast("This item is out of stock.", "error"); return; }
    addToCart(productWithSize);
    window.dispatchEvent(new Event("cartUpdated"));
    showToast(`${product.name} (${selectedSize || ""}) added to cart! 🛒`);
    setAdded(true);
    setStock(getProductStock(product.id));
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); onClose(); return; }
    if (stock === 0) { showToast("This item is out of stock.", "error"); return; }
    addToCart(productWithSize);
    window.dispatchEvent(new Event("cartUpdated"));
    onClose();
    router.push("/checkout");
  }

  function handleWishlist() {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); onClose(); return; }
    const updated = toggleWishlist(product.id);
    setWishlisted(updated.includes(product.id));
    window.dispatchEvent(new Event("wishlistUpdated"));
    showToast(updated.includes(product.id) ? `${product.name} added to wishlist! ♥` : "Removed from wishlist", updated.includes(product.id) ? "success" : "info");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden grid grid-cols-2"
        onClick={(e) => e.stopPropagation()}>

        {/* Image */}
        <div className="bg-gray-50 flex items-center justify-center p-6">
          <img
            src={product.img}
            alt={product.name}
            onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }}
            className="w-full max-h-[320px] object-contain rounded-xl"
          />
        </div>

        {/* Info */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            {/* Close */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{product.category}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stockLabel.color}`}>{stockLabel.label}</span>
                {stock > 0 && <span className="text-xs text-gray-400 font-medium">{stock} in stock</span>}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors">✕</button>
            </div>

            <h2 className="text-xl font-extrabold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{product.subtitle}</p>

            {/* Rating */}
            {avg > 0 && (
              <div className="flex items-center gap-0.5 mt-2">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className={`text-sm ${s <= Math.round(avg) ? "text-amber-400" : "text-gray-200"}`}>★</span>
                ))}
                <span className="text-xs text-gray-400 ml-1">({reviewCount})</span>
              </div>
            )}

            <p className="text-2xl font-extrabold text-amber-600 mt-3">₱{finalPrice}.00</p>

            {/* Size Selector */}
            {sizes && (
              <div className="mt-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Size</p>
                <div className="flex gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setSelectedSize(s.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        selectedSize === s.label
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-gray-200 text-gray-500 hover:border-amber-400"
                      }`}
                    >
                      {s.label}{s.priceAdd > 0 ? ` +₱${s.priceAdd}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-4">
              {product.description ?? `A beautifully handcrafted ${product.name.toLowerCase()} made with love and care. Perfect as a gift or a treat for yourself.`}
            </p>

            <div className="mt-3 flex flex-col gap-1 text-xs text-gray-400">
              <p>✅ Handcrafted with premium materials</p>
              <p>✅ Gift-ready packaging</p>
              <p>✅ Free shipping on all orders</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-5">
            <div className="flex gap-2">
              <button onClick={handleAddToCart} disabled={stock === 0}
                className={`flex-1 font-bold py-2.5 rounded-full text-sm transition-colors ${
                  stock === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : added ? "bg-green-500 text-white"
                  : "bg-gray-900 hover:bg-amber-600 text-white"
                }`}>
                {stock === 0 ? "Out of Stock" : added ? "✓ Added!" : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} disabled={stock === 0}
                className={`flex-1 font-bold py-2.5 rounded-full text-sm transition-colors ${
                  stock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 text-white"
                }`}>
                Buy Now
              </button>
              <button onClick={handleWishlist}
                className={`w-11 h-11 rounded-full border flex items-center justify-center text-lg transition-colors ${
                  wishlisted ? "bg-red-50 border-red-300 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"
                }`}>
                {wishlisted ? "♥" : "♡"}
              </button>
            </div>
            <Link href={`/product/${product.id}`} onClick={onClose}
              className="text-center text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors py-1">
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
