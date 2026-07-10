import React from "react";

export default function DealerRequestCard({ req, onAcceptBid, onReject, onImageClick }) {
  return (
    <div className="bg-[#fcfbfa] border border-[#1e140f]/25 p-5 rounded-none flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <h4 className="font-serif font-bold text-[#1e140f] text-sm">{req.userName || req.name}</h4>
          <span className="px-1.5 py-0.5 bg-[#f7f4ef] border border-[#1e140f]/20 text-[9px] font-mono font-bold text-[#1e140f]">
            {req.userPinCode || req.pinCode}
          </span>
        </div>
        <p className="text-[#1e140f]/60 font-sans">
          Total Weight: <span className="font-mono font-bold text-[#1e140f]">{((req.totalWeightGrams || req.totalInventoryWeight || 0) / 1000).toFixed(2)} kg</span>
        </p>
        <p className="text-[#1e140f]/60 font-sans">
          Address: <span className="text-[#1e140f] font-medium">{req.address}</span>
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1 max-w-xs sm:max-w-md lg:max-w-lg">
          {req.inventory?.map((item, idx) => (
            <img
              key={idx}
              src={item.imageUrl}
              alt={item.materialType}
              onClick={() => onImageClick(item.imageUrl)}
              className="w-8 h-8 object-cover rounded-none border border-[#1e140f]/20 cursor-zoom-in hover:opacity-80 transition"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col md:items-end justify-between gap-3">
        <div className="md:text-right">
          <p className="text-[9px] font-mono uppercase tracking-widest text-[#1e140f]/50">Customer asks</p>
          <p className="font-mono font-bold text-lg text-[#ab4e35]">₹{req.offeredPrice}</p>
        </div>
        <div className="flex gap-2 font-mono text-[9px]">
          <button
            onClick={() => onAcceptBid(req)}
            className="bg-[#1e140f] hover:bg-[#302016] text-[#f7f4ef] px-4 py-2 font-bold rounded-none uppercase tracking-widest cursor-pointer transition"
          >
            Accept / Bid
          </button>
          <button
            onClick={(e) => onReject(req.userId || req._id, e)}
            className="px-3 bg-transparent border border-[#1e140f]/35 text-[#1e140f] hover:text-[#ab4e35] hover:border-[#ab4e35] py-2 rounded-none font-bold uppercase tracking-widest transition cursor-pointer"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
