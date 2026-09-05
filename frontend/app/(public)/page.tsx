"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { LiveOfferToast } from "@/components/Toast";
import { PromotionCard } from "@/components/PromotionCard";
import { fetchPromotions, socket, Promotion } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // CHANGED: Use an object instead of a boolean to hold dynamic toast data
  const [toastData, setToastData] = useState<{
    title: string;
    action: string;
  } | null>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    "All",
    "Fashion",
    "Electronics",
    "Education",
    "Rewards",
    "Health",
  ];

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await fetchPromotions();
        setPromotions(data);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
    socket.connect();

    // UPDATED: Trigger dynamic toasts for Create, Update, AND Delete
    socket.on("promotionCreated", (newPromo) => {
      setPromotions((prev) => [newPromo, ...prev]);
      setToastData({ title: newPromo.title, action: "Just Went Live" });
    });

    socket.on("promotionUpdated", (updatedPromo) => {
      setPromotions((prev) =>
        prev.map((p) => (p.id === updatedPromo.id ? updatedPromo : p)),
      );
      setToastData({ title: updatedPromo.title, action: "Offer Updated" });
    });

    socket.on("promotionRemoved", (deletedPromo) => {
      setPromotions((prev) => prev.filter((p) => p.id !== deletedPromo.id));
      setToastData({ title: "An offer was removed", action: "Offer Ended" });
    });

    return () => {
      socket.off("promotionCreated");
      socket.off("promotionUpdated");
      socket.off("promotionRemoved");
      socket.disconnect();
    };
  }, []);

  const visiblePromos = promotions
    .filter((p) => p.status !== "Expired" && p.status !== "Draft")
    .filter((p) => activeCategory === "All" || p.category === activeCategory);

  const navLinks = ["All Promotions", "Categories", "How it Works", "About Us"];

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Icons.Tag />
            </div>
            <span
              className="text-slate-800 font-bold text-lg tracking-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              PromoHub
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link}
                className="text-slate-500 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-all"
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSignIn}
              className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-indigo-200"
            >
              Sign In <Icons.ArrowRight />
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Icons.Menu />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 pb-4 pt-2 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link}
                className="w-full text-left text-slate-600 hover:text-slate-900 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-all"
              >
                {link}
              </button>
            ))}
            <button
              onClick={handleSignIn}
              className="w-full mt-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
            >
              Sign In
            </button>
          </div>
        )}
      </header>

      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <span
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
              style={{ animation: "pulseGreen 1.5s ease infinite" }}
            />
            Updated Live — New offers added in real time
          </div>

          <h1
            className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight tracking-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Explore Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Latest Offers!
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Discover handpicked promotions refreshed daily. From flash sales to
            exclusive member rewards — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-900/40 flex items-center gap-2">
              <Icons.Sparkle /> Browse All Offers
            </button>
            <button className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-all backdrop-blur-sm">
              How it Works
            </button>
          </div>
        </div>
      </section>

      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-slate-800 text-2xl font-black"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {activeCategory === "All" ? "All Promotions" : activeCategory}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {visiblePromos.length} offer
              {visiblePromos.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
            <span
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
              style={{ animation: "pulseGreen 1.5s ease infinite" }}
            />
            Syncing live
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 text-slate-400 flex flex-col items-center">
            <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="font-medium text-slate-600">
              Connecting to database...
            </p>
          </div>
        ) : visiblePromos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePromos.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium text-slate-600">
              No active offers right now
            </p>
            <p className="text-sm mt-1">
              Check back soon — we add new deals every day.
            </p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © 2026 PromoHub. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              style={{ animation: "pulseGreen 1.5s ease infinite" }}
            />
            All systems operational — promotions syncing live
          </div>
        </div>
      </footer>

      {/* UPDATED: Pass dynamic data into the toast */}
      {toastData && (
        <div className="fixed bottom-6 right-6 z-50">
          <LiveOfferToast
            title={toastData.title}
            action={toastData.action}
            onClose={() => setToastData(null)}
          />
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseGreen {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .scrollbar-hide { scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
