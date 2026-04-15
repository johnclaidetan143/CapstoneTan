"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) {
      router.push("/register");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("loggedIn");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-6xl font-bold text-gray-800">
          Chenni Craft Shop
        </h1>
        <div className="flex gap-6 text-sm">
          <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Shop</Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Categories</Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Orders</Link>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-gray-500">♡</span>
          <span>🛒</span>
          <span>📄</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 font-medium">
            Logout
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gray-800 text-white p-10">
        <h2 className="font-bold text-xl mb-2">HANDICRAFT WITH LOVE</h2>
        <p className="text-sm mb-4 text-gray-300">
          Curated bouquets, lush flower pots, and botanical treasures —
          delighting fresh your day.
        </p>
        <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
          Shop Now
        </button>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="p-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">Shop by Category</h3>
          <Link href="#" className="text-sm text-gray-500 hover:text-gray-800">View All</Link>
        </div>
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          <div className="text-center mx-auto">
            <Image src="/bouquet.jpg" alt="Bouquet" width={200} height={200} className="rounded-xl mx-auto" />
            <p className="mt-2 text-lg text-gray-700 font-medium">Bouquet</p>
          </div>
          <div className="text-center mx-auto">
            <Image src="/flowerpot.jpg" alt="Flower Pot" width={200} height={200} className="rounded-xl mx-auto" />
            <p className="mt-2 text-lg text-gray-700 font-medium">Flower Pot</p>
          </div>
          <div className="text-center mx-auto">
            <Image src="/keychain.jpg" alt="Keychain" width={200} height={200} className="rounded-xl mx-auto" />
            <p className="mt-2 text-lg text-gray-700 font-medium">Keychain</p>
          </div>
        </div>
      </section>

      {/* FEATURED PICKS */}
      <section className="p-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">Featured Picks</h3>
          <Link href="#" className="text-sm text-gray-500 hover:text-gray-800">Shop All</Link>
        </div>
        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white rounded-xl shadow p-3">
            <Image src="/bouquet.jpg" alt="Bouquet" width={200} height={200} className="rounded-lg" />
            <h4 className="mt-2 font-semibold text-sm text-gray-800">Bouquet</h4>
            <p className="text-xs text-gray-400">Friendly Flowers</p>
            <p className="text-sm font-bold mt-1 text-gray-800">₱100.00</p>
            <div className="flex justify-between mt-2">
              <button className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700">Add</button>
              <button className="text-gray-400">♡</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-3">
            <Image src="/flowerpot.jpg" alt="Flower Pot" width={200} height={200} className="rounded-lg" />
            <h4 className="mt-2 font-semibold text-sm text-gray-800">Flower Pot</h4>
            <p className="text-xs text-gray-400">Random Pots</p>
            <p className="text-sm font-bold mt-1 text-gray-800">₱100.00</p>
            <div className="flex justify-between mt-2">
              <button className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700">Add</button>
              <button className="text-gray-400">♡</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-3">
            <Image src="/keychain.jpg" alt="Keychain" width={200} height={200} className="rounded-lg" />
            <h4 className="mt-2 font-semibold text-sm text-gray-800">Keychain</h4>
            <p className="text-xs text-gray-400">Random Pots</p>
            <p className="text-sm font-bold mt-1 text-gray-800">₱100.00</p>
            <div className="flex justify-between mt-2">
              <button className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700">Add</button>
              <button className="text-gray-400">♡</button>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white mt-10 p-6 text-sm border-t">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800">Chenni Craft Shop</h4>
            <p className="text-xs mt-2 text-gray-400">
              Bringing nature's beauty to your doorstep.
              Handcrafted bouquets and botanical treasures.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Quick Links</h4>
            <p className="mt-2 text-gray-400">Shop All</p>
            <p className="text-gray-400">Categories</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Account</h4>
            <p className="mt-2 text-gray-400">Sign In</p>
            <p className="text-gray-400">Cart</p>
            <p className="text-gray-400">Orders</p>
          </div>
        </div>
        <p className="text-center mt-6 text-xs text-gray-400">
          © 2026 Chenni Craft Shop. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
