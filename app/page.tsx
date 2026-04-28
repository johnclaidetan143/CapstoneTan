"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  "Fast Nationwide Delivery",
  "Secure Checkout",
  "Premium Handcrafted Quality",
  "Gift-Ready Packaging",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <Navbar />

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
              CHENNI CRAFT
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
              <Image
                src="/Bouquet.jpg"
                alt="Featured bouquet"
                width={780}
                height={920}
                className="h-[440px] w-full rounded-[20px] object-cover object-center sm:h-[520px]"
                priority
              />
              <div className="absolute left-5 top-5 rounded-full border border-[#ffc0e0]/40 bg-[#15151f]/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ffc0e0] backdrop-blur">
                Limited Drop
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

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
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
