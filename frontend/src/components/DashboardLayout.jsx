import React from "react";
import PriceChart from "./PriceChart";

export default function DashboardLayout({
  title,
  subtitle,
  userName,
  onLogout,
  priceRates,
  sidebarCards,
  children
}) {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1e140f] pb-16 font-sans antialiased">
      {/* Editorial Header */}
      <header className="border-b-2 border-[#1e140f] bg-[#fcfbfa] py-5 px-6 flex justify-between items-end sticky top-0 z-20">
        <div>
          <h1 className="text-3xl font-serif font-bold italic tracking-tight text-[#1e140f]">{title}</h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#1e140f]/50 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#1e140f]/70">{userName}</span>
          <button
            onClick={onLogout}
            className="text-[10px] font-mono uppercase tracking-widest border border-[#1e140f]/40 hover:border-[#1e140f] text-[#1e140f] py-1.5 px-3 hover:bg-[#1e140f]/5 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Grid Section */}
      <main className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Asymmetric Sidebar (left) */}
        <div className="space-y-6 text-xs md:col-span-1">
          <PriceChart priceRates={priceRates} />
          {sidebarCards}
        </div>

        {/* Main Content Pane */}
        {children}
      </main>
    </div>
  );
}
