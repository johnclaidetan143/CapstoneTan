"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductImage from "@/components/ProductImage";
import { allProducts } from "@/lib/products";
import { addToCart } from "@/lib/cart";

const filters = ["All", "Bouquet", "Flower Pot", "Keychain"];

export default function ShopPage() {
  const router = useRouter();
  const [active, setActive] = useState("All");

  useEffect(() => {
    // no redirect — allow guest browsing
  }, []);

  function handleAddToCart(p: typeof allProducts[0]) {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    addToCart(p);
    window.dispatchEvent(new Event("cartUpdated"));
  }

  const filtered = active === "All" ? allProducts : allProducts.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Our Collection</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Shop All Products</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                active === f
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="overflow-hidden">
                <ProductImage src={p.img} alt={p.name} className="w-full h-[260px] object-cover block" />
              </div>
              <div className="p-4">
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{p.category}</span>
                <h3 className="font-bold text-gray-900 mt-2">{p.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-600 font-bold">₱{p.price}.00</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="bg-gray-900 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">♡</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
