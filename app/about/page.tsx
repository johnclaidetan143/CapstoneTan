import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <section className="bg-gray-900 text-white py-20 text-center px-6">
          <img src="/logo.png" alt="Cheni Craft" className="h-20 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold mb-3">About Cheni Craft</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Handcrafted with love — bringing nature&apos;s beauty to your doorstep through felt bouquets, flower pots, and charming keychains.
          </p>
        </section>

        {/* Our Story */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-2 text-center">Our Story</p>
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-6">Made with Heart 🌸</h2>
          <div className="bg-white rounded-2xl shadow-sm p-8 text-sm text-gray-600 leading-relaxed flex flex-col gap-4">
            <p>Cheni Craft started as a small passion project — a love for handcrafting beautiful things that last forever. Unlike fresh flowers that wilt, our felt bouquets and botanical pieces are made to be cherished for years.</p>
            <p>Every piece is carefully handcrafted petal by petal, with attention to detail and quality materials. Whether it&apos;s a gift for someone special or a decoration for your home, each item carries a piece of our heart.</p>
            <p>We believe that handmade gifts are the most meaningful — they carry time, effort, and love that no store-bought item can replicate.</p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-2 text-center">What We Stand For</p>
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: "🌸", title: "Handcrafted Quality", desc: "Every item is made by hand with premium materials, ensuring lasting beauty." },
                { icon: "💝", title: "Made with Love", desc: "Each piece carries care and dedication from our hands to yours." },
                { icon: "🌿", title: "Lasting Beauty", desc: "Our felt creations never wilt — they stay beautiful forever." },
              ].map((v) => (
                <div key={v.title} className="text-center p-6 bg-gray-50 rounded-2xl">
                  <span className="text-4xl">{v.icon}</span>
                  <h3 className="font-bold text-gray-900 mt-3 mb-2">{v.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="max-w-3xl mx-auto px-6 py-14 text-center">
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-2">Connect With Us</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Follow Our Journey</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { label: "Facebook", icon: "📘", href: "https://facebook.com/chenicraftshop", color: "bg-blue-50 text-blue-600 border-blue-200" },
              { label: "Instagram", icon: "📸", href: "https://instagram.com/chenicraftshop", color: "bg-pink-50 text-pink-600 border-pink-200" },
              { label: "TikTok", icon: "🎵", href: "https://tiktok.com/@chenicraftshop", color: "bg-gray-50 text-gray-700 border-gray-200" },
              { label: "Shopee", icon: "🛍️", href: "https://shopee.ph/chenicraftshop", color: "bg-orange-50 text-orange-600 border-orange-200" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-2 px-5 py-3 rounded-full border font-semibold text-sm transition-all hover:scale-105 ${s.color}`}>
                <span>{s.icon}</span>{s.label}
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-amber-50 border-t border-amber-100 py-12 text-center px-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Ready to shop?</h2>
          <p className="text-sm text-gray-500 mb-5">Explore our handcrafted collection and find something you&apos;ll love.</p>
          <Link href="/shop" className="bg-gray-900 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">
            Browse Shop →
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
