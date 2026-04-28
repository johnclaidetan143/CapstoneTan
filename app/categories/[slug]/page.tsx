"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allProducts } from "@/lib/products";
import { addToCart } from "@/lib/cart";

const categoryMeta: Record<string, { label: string; description: string }> = {
  bouquet: { label: "Bouquet", description: "Handcrafted floral arrangements for every occasion." },
  "flower-pot": { label: "Flower Pot", description: "Lush potted plants to brighten any space." },
  keychain: { label: "Keychain", description: "Charming handmade keychains, perfect as gifts." },
};

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };

  useEffect(() => {
    // no redirect — allow guest browsing
  }, []);

  function handleAddToCart(p: typeof allProducts[0]) {
    if (!localStorage.getItem("loggedIn")) { router.push("/login"); return; }
    addToCart(p);
    window.dispatchEvent(new Event("cartUpdated"));
  }

  const meta = categoryMeta[slug];
  const products = allProducts.filter((p) => p.slug === slug);

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#fafaf8]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="text-5xl mb-4">🌿</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Category not found</h2>
          <Link href="/categories" className="text-sm text-amber-600 hover:underline">← Back to Categories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/categories" className="hover:text-amber-600 transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{meta.label}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">{products.length} items</p>
          <h1 className="text-3xl font-extrabold text-gray-900">{meta.label}</h1>
          <p className="text-sm text-gray-400 mt-1">{meta.description}</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="overflow-hidden">
                <Image src={p.img} alt={p.name} width={400} height={300} className="w-full h-52 object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
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
