import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-lg font-bold text-pink-500">
          Chenni Craft Shop
        </h1>

        <div className="flex gap-6 text-sm">
          <Link href="#">Shop</Link>
          <Link href="#">Categories</Link>
          <Link href="#">Orders</Link>
        </div>

        <div className="flex gap-4">
          <span>♡</span>
          <span>🛒</span>
          <span>📄</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-pink-400 text-white p-10">
        <h2 className="font-bold text-xl mb-2">
          HANDICRAFT WITH LOVE
        </h2>

        <p className="text-sm mb-4">
          Curated bouquets, lush flower pots, and botanical treasures —
          delighting fresh your day.
        </p>

        <button className="bg-white text-pink-500 px-4 py-2 rounded-lg font-semibold">
          Shop Now
        </button>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="p-6">

        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-lg">Shop by Category</h3>
          <Link href="#" className="text-sm text-gray-500">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">

          <div className="text-center">
            <Image
              src="/bouquet.jpg"
              alt="Bouquet"
              width={120}
              height={120}
              className="rounded-xl"
            />
            <p className="mt-2 text-sm">Bouquet</p>
          </div>

          <div className="text-center">
            <Image
              src="/flowerpot.jpg"
              alt="Flower Pot"
              width={120}
              height={120}
              className="rounded-xl"
            />
            <p className="mt-2 text-sm">Flower Pot</p>
          </div>

          <div className="text-center">
            <Image
              src="/keychain.jpg"
              alt="Keychain"
              width={120}
              height={120}
              className="rounded-xl"
            />
            <p className="mt-2 text-sm">Keychain</p>
          </div>

        </div>
      </section>

      {/* FEATURED PICKS */}
      <section className="p-6">

        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-lg">Featured Picks</h3>
          <Link href="#" className="text-sm text-gray-500">
            Shop All
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* ITEM */}
          <div className="bg-white rounded-xl shadow p-3">
            <Image
              src="/b1.jpg"
              alt="Bouquet"
              width={200}
              height={200}
              className="rounded-lg"
            />

            <h4 className="mt-2 font-semibold text-sm">Bouquet</h4>
            <p className="text-xs text-gray-500">Friendly Flowers</p>

            <p className="text-sm font-bold mt-1">₱100.00</p>

            <div className="flex justify-between mt-2">
              <button className="bg-pink-400 text-white px-3 py-1 rounded-md text-sm">
                Add
              </button>
              <button>♡</button>
            </div>
          </div>

          {/* ITEM */}
          <div className="bg-white rounded-xl shadow p-3">
            <Image
              src="/b2.jpg"
              alt="Flower Pot"
              width={200}
              height={200}
              className="rounded-lg"
            />

            <h4 className="mt-2 font-semibold text-sm">Flower Pot</h4>
            <p className="text-xs text-gray-500">Random Pots</p>

            <p className="text-sm font-bold mt-1">₱100.00</p>

            <div className="flex justify-between mt-2">
              <button className="bg-pink-400 text-white px-3 py-1 rounded-md text-sm">
                Add
              </button>
              <button>♡</button>
            </div>
          </div>

          {/* ITEM */}
          <div className="bg-white rounded-xl shadow p-3">
            <Image
              src="/b3.jpg"
              alt="Keychain"
              width={200}
              height={200}
              className="rounded-lg"
            />

            <h4 className="mt-2 font-semibold text-sm">Keychain</h4>
            <p className="text-xs text-gray-500">Random Pots</p>

            <p className="text-sm font-bold mt-1">₱100.00</p>

            <div className="flex justify-between mt-2">
              <button className="bg-pink-400 text-white px-3 py-1 rounded-md text-sm">
                Add
              </button>
              <button>♡</button>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white mt-10 p-6 text-sm text-gray-600">

        <div className="grid grid-cols-3 gap-6">

          <div>
            <h4 className="font-semibold">Chenni Craft Shop</h4>
            <p className="text-xs mt-2">
              Bringing nature's beauty to your doorstep.
              Handcrafted bouquets and botanical treasures.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Quick Links</h4>
            <p className="mt-2">Shop All</p>
            <p>Categories</p>
          </div>

          <div>
            <h4 className="font-semibold">Account</h4>
            <p className="mt-2">Sign In</p>
            <p>Cart</p>
            <p>Orders</p>
          </div>

        </div>

        <p className="text-center mt-6 text-xs">
          © 2026 Chenni Craft Shop. All rights reserved.
        </p>

      </footer>

    </div>
  );
}