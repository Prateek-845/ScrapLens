import React from "react";

export default function InventoryBinCard({ user, onEdit, onDelete }) {
  return (
    <div className="bg-[#fcfbfa] border border-[#1e140f]/25 p-5 rounded-none h-[400px] flex flex-col text-xs">
      <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1e140f] border-b border-[#1e140f]/20 pb-2 mb-3">
        Scrap Bin
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {user?.inventory?.length ? (
          user.inventory.map((item) => (
            <div key={item._id} className="p-3 bg-[#f7f4ef] border border-[#1e140f]/15 rounded-none flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={item.imageUrl} alt={item.materialType} className="w-10 h-10 object-cover rounded-none border border-[#1e140f]/20" />
                <div>
                  <p className="font-serif font-bold text-[#1e140f]">{item.itemName || item.materialType}</p>
                  <p className="text-[10px] text-[#1e140f]/60 font-mono">{item.estimatedWeightGrams}g</p>
                </div>
              </div>
              {user?.pickupStatus === "idle" && (
                <div className="flex gap-2.5 font-mono text-[9px]">
                  <button onClick={(e) => onEdit(item, e)} className="text-[#ab4e35] hover:underline cursor-pointer">
                    Edit
                  </button>
                  <button onClick={(e) => onDelete(item._id, e)} className="text-[#1e140f]/50 hover:text-red-700 cursor-pointer">
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-[#1e140f]/50 text-center font-mono mt-12">Bin is empty.</p>
        )}
      </div>
    </div>
  );
}
