"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { allProducts } from "@/lib/products";
import { getActiveAnnouncements, Announcement } from "@/lib/announcements";
import { getBestsellers, getTrending, RankedProduct } from "@/lib/bestsellers";
import { getStock } from "@/lib/stock";
import { getWishlist } from "@/lib/wishlist";

function FreeShippingBanner() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Set deadline to end of today
    function calcTime() {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    calcTime();
    const t = setInterval(calcTime, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="bg-[#fafaf8] py-6">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-2xl px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left — Text */}
        <div className="text-center sm:text-left">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-900 mb-0.5">Limited Time Offer</p>
          <h2 className="text-lg font-extrabold text-white leading-tight">🚚 FREE SHIPPING — Today Only!</h2>
          <p className="text-amber-100 text-xs mt-0.5">Offer ends at midnight. Order now!</p>
        </div>

        {/* Center — Countdown */}
        <div className="flex items-center gap-2">
          {[{ label: "HRS", val: timeLeft.h }, { label: "MIN", val: timeLeft.m }, { label: "SEC", val: timeLeft.s }].map((t, i) => (
            <div key={t.label} className="flex items-center gap-2">
              <div className="bg-white rounded-xl px-3 py-1.5 min-w-[52px] text-center shadow">
                <p className="text-xl font-extrabold text-amber-600 leading-none">{pad(t.val)}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{t.label}</p>
              </div>
              {i < 2 && <span className="text-lg font-extrabold text-white">:</span>}
            </div>
          ))}
        </div>

        {/* Right — CTA */}
        <Link href="/shop"
          className="bg-white text-amber-600 font-extrabold px-6 py-2.5 rounded-full text-sm hover:bg-amber-50 transition-colors shadow whitespace-nowrap">
          Shop Now 🛒
        </Link>
        </div>
      </div>
    </section>
  );
}

const features = [
  "Fast Nationwide Delivery",
  "Secure Checkout",
  "Premium Handcrafted Quality",
  "Gift-Ready Packaging",
];

type FeaturedProduct = {
  name: string;
  category: string;
  price: number;
  image: string;
  badge: string;
};

const featuredProductTargets: FeaturedProduct[] = [
  { name: "Red Bouquet", category: "Bouquet", price: 120, image: "/static/images/products/red-bouquet.jpg", badge: "LIMITED DROP" },
  { name: "Blue Bouquet", category: "Bouquet", price: 115, image: "/static/images/products/blue-bouquet.jpg", badge: "LIMITED DROP" },
  { name: "Pink Bouquet", category: "Bouquet", price: 130, image: "/static/images/products/pink-bouquet.jpg", badge: "LIMITED DROP" },
];

const imageFallbackSrc = "/static/images/products/default.jpg";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [bestsellers, setBestsellers] = useState<RankedProduct[]>([]);
  const [trending, setTrending] = useState<RankedProduct[]>([]);
  const [stock, setStock] = useState<Record<number, number>>({});
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    setAnnouncements(getActiveAnnouncements());
    setBestsellers(getBestsellers(6));
    setTrending(getTrending(6));
    setStock(getStock());
    setWishlist(getWishlist());
    const sync = () => setWishlist(getWishlist());
    window.addEventListener("wishlistUpdated", sync);
    return () => window.removeEventListener("wishlistUpdated", sync);
  }, []);

  const featuredProducts = useMemo(
    () =>
      featuredProductTargets.map((target) => {
        const match = allProducts.find((p) => p.name === target.name);
        if (!match) return target;

        return {
          name: match.name,
          category: match.category,
          price: match.price,
          image: match.img || target.image,
          badge: target.badge,
        };
      }),
    []
  );

  const featuredProduct = featuredProducts[activeIndex] || featuredProducts[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => setAnnouncementIdx((p) => (p + 1) % announcements.length), 4000);
    return () => clearInterval(t);
  }, [announcements.length]);

  function goToPrev() {
    setActiveIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  }

  function goToNext() {
    setActiveIndex((prev) => (prev + 1) % featuredProducts.length);
  }

  const bannerColors: Record<string, string> = {
    sale:    "bg-amber-500 text-white",
    info:    "bg-gray-900 text-white",
    warning: "bg-red-500 text-white",
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <Navbar />

      {/* Announcement Banner */}
      {showBanner && announcements.length > 0 && (
        <div className={`relative flex items-center justify-center px-6 py-2.5 text-xs font-semibold tracking-wide text-center ${bannerColors[announcements[announcementIdx]?.type ?? "info"]}`}>
          <span>{announcements[announcementIdx]?.message}</span>
          <button onClick={() => setShowBanner(false)} className="absolute right-4 text-white/70 hover:text-white text-sm">✕</button>
        </div>
      )}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,77,166,0.24),transparent_45%),radial-gradient(circle_at_82%_65%,rgba(255,133,193,0.18),transparent_42%)]" />
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />

        <div className="relative mx-auto grid min-h-screen h-auto max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-20">
          <div className="animate-fade-in space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ffc0e0]/50 bg-[#ff85c1]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffc0e0]">
              <span className="h-2 w-2 rounded-full bg-[#ff4da6] shadow-[0_0_12px_rgba(255,77,166,0.85)]" />
              NEW COLLECTION
            </div>

            <h1 className="text-5xl font-black leading-[0.95] sm:text-6xl md:text-7xl">
              Cheni Craft
              <span className="mt-2 block bg-[linear-gradient(135deg,#ff4da6,#ff85c1)] bg-clip-text text-transparent">
                Dream Drop
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#d8c7d2] sm:text-base md:mx-0">
              Handcrafted floral pieces and charm gifts with a premium, modern aesthetic. Curated drops designed to feel elegant, memorable, and gift-ready.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
              <Link
                href="/shop"
                className="btn-glow rounded-full bg-[linear-gradient(135deg,#ff4da6,#ff85c1)] px-7 py-3 text-sm font-bold tracking-wide text-white"
              >
                Shop Drop
              </Link>
              <Link
                href="/categories"
                className="rounded-full border border-[#ff85c1]/80 bg-transparent px-7 py-3 text-sm font-semibold tracking-wide text-[#ffc0e0] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,77,166,0.25)]"
              >
                Explore Catalog
              </Link>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1 md:justify-start">
              <div className="icon-pill">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 21s-6.7-4.35-9.33-8.03C.7 10.2 1.18 6.3 4.16 4.58c2.2-1.28 4.59-.56 5.84.99 1.25-1.55 3.64-2.27 5.84-.99 2.98 1.72 3.46 5.62 1.49 8.39C18.7 16.65 12 21 12 21z" />
                </svg>
              </div>
              <div className="icon-pill">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 2c.9 1.85 2.24 3.26 4.2 3.9 1.93.63 3.88.43 5.8-.5-.2 2.1-.88 3.93-2.46 5.3-1.3 1.14-2.9 1.78-4.61 2.09.62.64 1.06 1.39 1.3 2.25.62 2.2.08 4.11-1.43 5.74-.87-1.75-2.16-3.04-4.01-3.67-1.7-.58-3.37-.5-5.08.05.16-2.02.9-3.7 2.38-5.01 1.24-1.1 2.72-1.72 4.34-2.07-.58-.56-1.01-1.22-1.27-1.97-.73-2.13-.3-4.03 1.14-5.77z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute -inset-4 rounded-[30px] bg-[linear-gradient(135deg,#ff4da6,#ff85c1)] opacity-30 blur-2xl" />
            <div className="card-glow relative overflow-hidden rounded-[25px] border border-[#ffc0e0]/30 bg-[#15151f] p-4">
              <div key={activeIndex} className="hero-slide">
                <img
                  src={featuredProduct.image || imageFallbackSrc}
                  alt={featuredProduct.name}
                  className="h-[440px] w-full rounded-[20px] object-cover object-center sm:h-[520px]"
                  onError={(e) => {
                    e.currentTarget.src = imageFallbackSrc;
                  }}
                />
                <div className="absolute left-5 top-5 rounded-full border border-[#ffc0e0]/40 bg-[#15151f]/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ffc0e0] backdrop-blur">
                  {featuredProduct.badge}
                </div>
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[#ffc0e0]/25 bg-[#15151f]/70 p-4 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ffc0e0]">
                    {featuredProduct.category}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-tight text-white">
                    {featuredProduct.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-[#ffc0e0]">
                    &#8369;{featuredProduct.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#15151f]/55 px-3 py-2 backdrop-blur">
                {featuredProducts.map((product, index) => (
                  <button
                    key={product.name}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show ${product.name}`}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex ? "bg-[#ff85c1] shadow-[0_0_10px_rgba(255,133,193,0.8)]" : "bg-[#ffc0e0]/45"
                    }`}
                  />
                ))}
              </div>

              <div className="absolute left-3 right-3 top-1/2 flex -translate-y-1/2 justify-between">
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous product"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#ffc0e0]/45 bg-[#15151f]/65 text-[#ffc0e0] backdrop-blur transition-all hover:scale-105"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next product"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#ffc0e0]/45 bg-[#15151f]/65 text-[#ffc0e0] backdrop-blur transition-all hover:scale-105"
                >
                  &#8250;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#101019]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8c7d2] sm:grid-cols-2 md:grid-cols-4 md:text-xs">
          {features.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="bg-[#fafaf8] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Top Picks</p>
              <h2 className="text-2xl font-extrabold text-gray-900">🏆 Bestsellers</h2>
            </div>
            <Link href="/shop" className="text-sm text-gray-500 hover:text-amber-600 font-medium transition-colors">Shop All →</Link>
          </div>
          {bestsellers.length === 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {allProducts.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} stock={stock[p.id] ?? 10} wishlisted={wishlist.includes(p.id)}
                  badge={{ label: "Popular", color: "bg-amber-100 text-amber-700" }}
                  onWishlistChange={(id, w) => setWishlist((prev) => w ? [...prev, id] : prev.filter((x) => x !== id))} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {bestsellers.map((p, i) => (
                <ProductCard key={p.id} product={p} stock={stock[p.id] ?? 10} wishlisted={wishlist.includes(p.id)}
                  badge={{ label: i === 0 ? "🥇 #1 Bestseller" : i === 1 ? "🥈 #2" : i === 2 ? "🥉 #3" : `#${i+1} Bestseller`, color: i === 0 ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700" }}
                  onWishlistChange={(id, w) => setWishlist((prev) => w ? [...prev, id] : prev.filter((x) => x !== id))} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FREE SHIPPING BANNER */}
      <FreeShippingBanner />

      {/* TRENDING NOW */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-rose-500 font-bold tracking-widest uppercase mb-1">What&apos;s Hot</p>
              <h2 className="text-2xl font-extrabold text-gray-900">🔥 Trending Now</h2>
            </div>
            <Link href="/shop" className="text-sm text-gray-500 hover:text-amber-600 font-medium transition-colors">See All →</Link>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {(trending.length > 0 ? trending : allProducts.slice(-6)).map((p) => (
              <ProductCard key={p.id} product={p} stock={stock[p.id] ?? 10} wishlisted={wishlist.includes(p.id)}
                badge={{ label: "🔥 Trending", color: "bg-rose-100 text-rose-600" }}
                onWishlistChange={(id, w) => setWishlist((prev) => w ? [...prev, id] : prev.filter((x) => x !== id))} />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .btn-glow {
          box-shadow: 0 10px 25px rgba(255, 77, 166, 0.35);
          transition: transform 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease;
        }

        .btn-glow:hover {
          transform: scale(1.04);
          filter: brightness(1.06);
          box-shadow: 0 18px 34px rgba(255, 77, 166, 0.45);
        }

        .card-glow {
          box-shadow: 0 0 0 1px rgba(255, 192, 224, 0.14), 0 0 38px rgba(255, 77, 166, 0.32);
          animation: glowPulse 3s ease-in-out infinite;
        }

        .icon-pill {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 192, 224, 0.45);
          background: rgba(255, 133, 193, 0.08);
          color: #ffc0e0;
          box-shadow: 0 0 20px rgba(255, 77, 166, 0.2);
        }

        .particle {
          position: absolute;
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background: radial-gradient(circle, #ffc0e0 0%, #ff85c1 65%, transparent 75%);
          filter: blur(0.2px);
          opacity: 0.7;
          animation: floatY 7s ease-in-out infinite;
        }

        .particle-1 { top: 20%; left: 10%; animation-delay: 0s; }
        .particle-2 { top: 34%; left: 44%; animation-delay: 1.2s; }
        .particle-3 { top: 18%; right: 15%; animation-delay: 2.2s; }
        .particle-4 { bottom: 18%; right: 38%; animation-delay: 3.1s; }

        .animate-fade-in {
          animation: fadeIn 0.9s ease-out both;
        }

        .animate-float {
          animation: floatY 4.6s ease-in-out infinite;
        }

        .hero-slide {
          animation: heroSlideIn 0.55s ease both;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255, 192, 224, 0.14), 0 0 30px rgba(255, 77, 166, 0.25); }
          50% { box-shadow: 0 0 0 1px rgba(255, 192, 224, 0.2), 0 0 44px rgba(255, 77, 166, 0.38); }
        }
      `}</style>
    </div>
  );
}
