import React from "react";
import LiveChat from "./LiveChat";

export default function DealerDispatchCard({
  disp,
  chats,
  user,
  onSendMessage,
  onComplete,
  onImageClick
}) {
  return (
    <div className="bg-[#fcfbfa] border border-[#1e140f]/25 p-5 rounded-none space-y-4 text-xs">
      <div className="flex justify-between items-start border-b border-[#1e140f]/15 pb-2">
        <div>
          <h4 className="font-serif font-bold text-[#1e140f] text-sm">{disp.name}</h4>
          <p className="text-[#1e140f]/60 font-sans mt-1 text-[11px]">
            PIN: <span className="font-mono font-bold text-[#1e140f]">{disp.pinCode}</span> | Arrival:{" "}
            <span className="font-mono text-[#ab4e35] font-bold">{disp.estimatedPickupTime}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-mono uppercase tracking-widest text-[#1e140f]/50">Earnings</p>
          <p className="font-mono font-bold text-[#ab4e35] text-sm">₹{disp.offeredPrice}</p>
        </div>
      </div>

      <div className="p-4 bg-[#f7f4ef] border border-[#1e140f]/15 rounded-none space-y-2">
        <span className="text-[9px] text-[#1e140f]/50 uppercase tracking-widest block font-mono font-bold">
          Scrap Details
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {disp.inventory?.map((item) => (
            <div key={item._id} className="flex items-center gap-2">
              <img
                src={item.imageUrl}
                alt={item.materialType}
                onClick={() => onImageClick(item.imageUrl)}
                className="w-8 h-8 object-cover rounded-none border border-[#1e140f]/20 cursor-zoom-in hover:opacity-80 transition"
              />
              <div className="min-w-0">
                <p className="font-serif font-bold text-[#1e140f] truncate">{item.itemName || item.materialType}</p>
                <p className="text-[9px] text-[#1e140f]/60 font-mono">{item.estimatedWeightGrams}g</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LiveChat
        title={`Chat room with ${disp.name}`}
        chatMessages={chats[disp._id] || []}
        senderId={user?.id || user?._id}
        onSendMessage={(text) => onSendMessage(disp._id, text)}
      />

      <button
        onClick={() => onComplete(disp._id)}
        className="w-full py-2.5 bg-[#3f5e4d] hover:bg-[#2b4236] text-[#f7f4ef] font-mono uppercase tracking-widest text-[10px] rounded-none transition cursor-pointer"
      >
        Complete Pickup
      </button>
    </div>
  );
}
