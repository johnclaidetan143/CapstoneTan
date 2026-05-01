"use client";
import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { toggleWishlist } from "@/lib/wishlist";
import { showToast } from "@/lib/toast";
import { getStockLabel } from "@/lib/stock";
import QuickView from "@/components/QuickView";
import { useRouter } from "next/navigation";

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
  wishlisted: boolean;
  badge?: { label: string; color: string };
  onWishlistChange?: (id: number, wishlisted: boolean) => void;
};

export default function ProductCard({ product: p, stock, wishlisted, badge, onWishlistChange }: Props) {
  const router = useRouter();
  const [showQV, setShowQV] = useState(false);
  const stockLabel = getStockLabel(stock);

  function handleAddToCart() {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    if (stock === 0) { showToast("This item is out of stock.", "error"); return; }
    addToCart(p);
    window.dispatchEvent(new Event("cartUpdated"));
    showToast(`${p.name} added to cart! 🛒`);
  }

  function handleWishlist() {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    const updated = toggleWishlist(p.id);
    const isNowWishlisted = updated.includes(p.id);
    window.dispatchEvent(new Event("wishlistUpdated"));
    showToast(isNowWishlisted ? `${p.name} added to wishlist! ♥` : "Removed from wishlist", isNowWishlisted ? "success" : "info");
    onWishlistChange?.(p.id, isNowWishlisted);
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        {/* Image */}
        <div className="relative overflow-hidden">
          <Link href={`/product/${p.id}`}>
            <img src={p.img} alt={p.name}
              onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }}
              className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stockLabel.color}`}>{stockLabel.label}</span>
          </div>

          {/* Quick View overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4">
            <button onClick={() => setShowQV(true)}
              className="bg-white text-gray-900 font-semibold text-xs px-5 py-2 rounded-full shadow-md hover:bg-amber-500 hover:text-white transition-colors">
              👁 Quick View
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{p.category}</span>
          <Link href={`/product/${p.id}`}>
            <h3 className="font-bold text-gray-900 mt-2 hover:text-amber-600 transition-colors text-sm">{p.name}</h3>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-amber-600 font-bold">₱{p.price}.00</span>
            <div className="flex gap-2">
              <button onClick={handleAddToCart} disabled={stock === 0}
                className={`text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                  stock === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-amber-600"
                }`}>
                {stock === 0 ? "Sold Out" : "Add to Cart"}
              </button>
              <button onClick={handleWishlist}
                className={`text-lg leading-none transition-colors ${wishlisted ? "text-red-400" : "text-gray-300 hover:text-red-400"}`}>
                {wishlisted ? "♥" : "♡"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQV && <QuickView product={p} stock={stock} onClose={() => setShowQV(false)} />}
    </>
  );
}
