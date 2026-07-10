import React from "react";

export default function PriceChart({ priceRates }) {
  return (
    <div className="bg-transparent p-0 text-xs">
      <h3 className="font-serif text-base font-bold uppercase tracking-wider text-[#1e140f] border-b-2 border-[#1e140f] pb-2 mb-3">
        Price Chart
      </h3>
      <div className="divide-y divide-[#1e140f]/15">
        {priceRates.map((r, i) => (
          <div key={i} className="flex justify-between font-mono text-[10px] text-[#1e140f]/70 py-2.5">
            <span className="uppercase tracking-wider">{r.item}</span>
            <span className="font-bold text-[#1e140f]">{r.rate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
