import React from "react";

export default function ClaimModal({
  isOpen,
  selectedJob,
  eta,
  setEta,
  bidPrice,
  setBidPrice,
  actionLoading,
  onSubmit,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e140f]/60 backdrop-blur-xs p-4 text-xs antialiased">
      <div className="bg-[#fcfbfa] border-2 border-[#1e140f] p-5 max-w-xs w-full space-y-4 shadow-none rounded-none">
        <h3 className="font-serif text-sm font-bold text-[#1e140f]">Claim Pickup Gig</h3>
        
        <div className="space-y-1">
          <label className="text-[9px] text-[#1e140f]/50 uppercase tracking-widest block font-mono font-bold">Scheduled Arrival</label>
          <select
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            className="w-full bg-[#fcfbfa] border border-[#1e140f]/30 rounded-none py-2 px-2 text-[#1e140f] focus:outline-none text-xs font-mono"
          >
            <option value="Within 2 Hours (Today)">Within 2 Hours (Today)</option>
            <option value="Evening 5 PM - 8 PM (Today)">Evening 5 PM - 8 PM (Today)</option>
            <option value="Morning 9 AM - 12 PM (Tomorrow)">Morning 9 AM - 12 PM (Tomorrow)</option>
            <option value="Afternoon 1 PM - 5 PM (Tomorrow)">Afternoon 1 PM - 5 PM (Tomorrow)</option>
            <option value="9 AM - 6 PM (Day After Tomorrow)">9 AM - 6 PM (Day After Tomorrow)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-[#1e140f]/50 uppercase tracking-widest block font-mono font-bold">Your Offer Price (₹)</label>
          <input
            type="number"
            value={bidPrice}
            onChange={(e) => setBidPrice(e.target.value)}
            placeholder={selectedJob?.offeredPrice?.toString()}
            className="w-full bg-[#fcfbfa] border border-[#1e140f]/30 rounded-none py-2 px-3 text-[#ab4e35] font-bold font-mono focus:outline-none focus:border-[#1e140f]"
          />
          <p className="text-[9px] text-[#1e140f]/50 font-sans mt-1 leading-normal">
            Customer asks: <span className="font-semibold text-[#1e140f]">₹{selectedJob?.offeredPrice}</span> (Est: ₹{selectedJob?.estimatedPrice})
          </p>
        </div>

        <div className="flex gap-2 pt-2 font-mono text-[9px]">
          <button onClick={onSubmit} disabled={actionLoading} className="flex-1 bg-[#1e140f] hover:bg-[#302016] text-[#f7f4ef] py-2 rounded-none font-bold uppercase tracking-widest cursor-pointer transition">
            Submit Bid
          </button>
          <button onClick={onClose} className="px-3 bg-transparent border border-[#1e140f]/35 hover:bg-[#1e140f]/5 text-[#1e140f] rounded-none cursor-pointer transition uppercase tracking-wider">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
