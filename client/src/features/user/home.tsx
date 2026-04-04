import { useState, useEffect } from "react";

// Importing the .jfif images directly from your assets folder!
import h1 from "@/assets/h1.jfif";
import h2 from "@/assets/h2.jfif";
import h3 from "@/assets/h3.jfif";
import h4 from "@/assets/h4.jfif";
import h5 from "@/assets/h5.jfif";

const bannerImages = [h1, h2, h3, h4, h5];

export default function Home() {
  const [currentImg, setCurrentImg] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. YOUR BEAUTIFUL INSPIRATION CAROUSEL */}
      <section className="relative h-48 w-full overflow-hidden rounded-2xl md:h-64">
        {/* Images */}
        {bannerImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Banner ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === currentImg ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        
        {/* Dark gradient overlay matching the inspiration */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1426] via-[#0b1426]/40 to-transparent opacity-90"></div>
        
        {/* Text matches your screenshot perfectly */}
        <div className="absolute bottom-8 left-6">
          <h2 className="mb-1 text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            Live In-Play Action
          </h2>
          <p className="text-sm font-medium text-gray-300 drop-shadow-md">
            Bet on the action as it happens in real-time.
          </p>
        </div>

        {/* The sleek yellow and white navigation dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {bannerImages.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentImg ? "w-6 bg-yellow-400" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. THE TEAM'S STATS & BALANCE CARDS */}
      <section className="animate-lift-in rounded-3xl border border-admin-border bg-admin-card p-6 shadow-[0_16px_48px_var(--color-bg-deepest)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">
              BetCenic is live
            </h1>
            <p className="mt-1.5 text-sm text-admin-text-muted">
              Real-time odds, quick deposits, and a wallet-first flow.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-admin-border bg-admin-surface/55 p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-admin-text-muted">
              Available Balance
            </p>
            <p className="mt-2 text-2xl font-bold text-admin-accent">KES 0.00</p>
          </article>
          <article className="rounded-2xl border border-admin-border bg-admin-surface/55 p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-admin-text-muted">
              Open Bets
            </p>
            <p className="mt-2 text-2xl font-bold text-admin-blue">0</p>
          </article>
          <article className="rounded-2xl border border-admin-border bg-admin-surface/55 p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-admin-text-muted">
              Today&apos;s Activity
            </p>
            <p className="mt-2 text-2xl font-bold text-admin-gold">No activity</p>
          </article>
        </div>
      </section>

    </div>
  );
}