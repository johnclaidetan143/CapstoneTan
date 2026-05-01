"use client";
import Link from "next/link";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  {
    name: "Bouquet",
    slug: "bouquet",
    description: "Handcrafted floral arrangements for every occasion.",
    count: 10,
    img: "/static/images/products/red-bouquet.jpg",
  },
  {
    name: "Flower Pot",
    slug: "flower-pot",
    description: "Lush potted plants to brighten any space.",
    count: 6,
    img: "/static/images/products/chenipot-daisy.png",
  },
  {
    name: "Keychain",
    slug: "keychain",
    description: "Charming handmade keychains, perfect as gifts.",
    count: 6,
    img: "/static/images/products/fuzz-mirror.jpg",
  },
];

export default function CategoriesPage() {
  useEffect(() => {
    // no redirect — allow guest browsing
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Browse</p>
          <h1 className="text-3xl font-extrabold text-gray-900">All Categories</h1>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link href={`/categories/${cat.slug}`} key={cat.name} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.name}
                  onError={(e) => { e.currentTarget.src = "/static/images/products/default.jpg"; }}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{cat.name}</h2>
                  <span className="text-xs text-amber-600 bg-amber-50 font-semibold px-2 py-0.5 rounded-full">
                    {cat.count} items
                  </span>
                </div>
                <p className="text-sm text-gray-400">{cat.description}</p>
                <p className="mt-3 text-sm font-semibold text-amber-600 group-hover:underline">
                  Shop {cat.name} →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
