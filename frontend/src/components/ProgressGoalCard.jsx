import React from "react";

export default function ProgressGoalCard({
  user,
  userOffer,
  setUserOffer,
  estimatedPrice,
  pickupLoading,
  onOverride,
  onRequestPickup
}) {
  const weightGoal = 2000;
  const weight = user?.totalInventoryWeight || 0;
  const pct = Math.min((weight / weightGoal) * 100, 100);

  return (
    <div className="bg-[#fcfbfa] border border-[#1e140f]/25 p-5 rounded-none space-y-4 text-xs">
      <div className="flex justify-between items-end">
        <div>
          <p className="font-serif text-sm font-bold uppercase tracking-widest text-[#1e140f]">Progress Goal</p>
          <p className="text-[10px] text-[#1e140f]/70 font-mono tracking-wider">2000g minimum eligibility threshold</p>
        </div>
        <p className="text-right font-mono text-[11px] text-[#1e140f] tracking-wider">
          <span className="text-sm font-bold font-sans">{(weight / 1000).toFixed(2)}</span> / 2.0 kg
        </p>
      </div>
      
      <div className="w-full bg-[#f7f4ef] h-2.5 rounded-none overflow-hidden border border-[#1e140f]/15 p-[1px]">
        <div style={{ width: `${pct}%` }} className="bg-[#1e140f] h-full rounded-none transition-all duration-300"></div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        {!user?.isPickupEligible && (
          <button onClick={onOverride} className="text-[#ab4e35] hover:underline font-mono uppercase tracking-widest text-[9px] cursor-pointer text-left">
            Manually Mark Eligible (AI override)
          </button>
        )}
        {user?.isPickupEligible && user?.pickupStatus === "idle" && (
          <div className="space-y-3 mt-1 pt-2 border-t border-[#1e140f]/10">
            <div className="flex justify-between items-center">
              <span className="text-[#1e140f]/60 font-mono text-[11px]">Market Estimate:</span>
              <span className="font-bold text-[#1e140f] font-mono">₹{estimatedPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#1e140f]/60 font-mono text-[11px]">Expected Price (₹):</span>
              <input
                type="number"
                value={userOffer}
                onChange={(e) => setUserOffer(e.target.value)}
                placeholder={estimatedPrice.toString()}
                className="w-20 bg-[#f7f4ef] border border-[#1e140f]/20 rounded-none px-2.5 py-1 text-right text-[#1e140f] font-mono focus:outline-none focus:border-[#1e140f]"
              />
            </div>
            <button
              onClick={onRequestPickup}
              disabled={pickupLoading}
              className="w-full py-2.5 bg-[#1e140f] hover:bg-[#302016] text-[#f7f4ef] font-mono uppercase tracking-widest text-[10px] transition cursor-pointer"
            >
              {pickupLoading ? "Requesting..." : "Request Free Pickup"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
