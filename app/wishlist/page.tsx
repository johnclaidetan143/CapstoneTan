"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allProducts } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) router.push("/login");
    setWishlistIds(getWishlist());
  }, [router]);

  const products = allProducts.filter((p) => wishlistIds.includes(p.id));

  function handleRemove(id: number) {
    const updated = toggleWishlist(id);
    setWishlistIds([...updated]);
    window.dispatchEvent(new Event("wishlistUpdated"));
  }

  function handleAddToCart(p: typeof allProducts[0]) {
    addToCart(p);
    window.dispatchEvent(new Event("cartUpdated"));
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Saved Items</p>
          <h1 className="text-3xl font-extrabold text-gray-900">My Wishlist</h1>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">♡</span>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Your wishlist is empty</h2>
            <p className="text-sm text-gray-400 mb-6">Save items you love by clicking the ♡ button.</p>
            <Link href="/shop" className="bg-gray-900 hover:bg-amber-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <Link href={`/product/${p.id}`}>
                  <Image src={p.img} alt={p.name} width={400} height={300} className="w-full h-48 object-cover" />
                </Link>
                <div className="p-4">
                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{p.category}</span>
                  <h3 className="font-bold text-gray-900 mt-2">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
                  <p className="text-amber-600 font-bold mt-2">₱{p.price}.00</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="flex-1 bg-gray-900 hover:bg-amber-600 text-white text-xs font-semibold py-2 rounded-full transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="w-9 h-9 rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition-colors text-sm flex items-center justify-center"
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
