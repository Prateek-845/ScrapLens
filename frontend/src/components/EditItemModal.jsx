import React, { useState, useEffect } from "react";

export default function EditItemModal({ isOpen, item, onSave, onClose }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("HDPE Plastic");
  const [weight, setWeight] = useState(0);

  useEffect(() => {
    if (item) {
      // Strip out the quantity count suffix like " (x1)" for clean text editing
      const cleanName = (item.itemName || "").replace(/\s*\(x\d+\)\s*$/gi, "");
      setName(cleanName || item.materialType);
      setCategory(item.materialType);
      setWeight(item.estimatedWeightGrams || 0);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item._id, {
      itemName: name,
      materialType: category,
      estimatedWeightGrams: Number(weight)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e140f]/60 backdrop-blur-xs p-4 text-xs antialiased">
      <form onSubmit={handleSubmit} className="bg-[#fcfbfa] border-2 border-[#1e140f] p-5 max-w-xs w-full space-y-4 shadow-none rounded-none">
        <h3 className="font-serif text-sm font-bold text-[#1e140f]">Edit Scrap Item</h3>
        
        <div className="space-y-1">
          <label className="text-[9px] text-[#1e140f]/50 uppercase tracking-widest block font-mono font-bold">Item Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#fcfbfa] border border-[#1e140f]/35 focus:border-[#1e140f] rounded-none py-2 px-3 text-[#1e140f] focus:outline-none text-xs font-sans"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-[#1e140f]/50 uppercase tracking-widest block font-mono font-bold">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#fcfbfa] border border-[#1e140f]/35 focus:border-[#1e140f] rounded-none py-2 px-2 text-[#1e140f] focus:outline-none text-xs font-mono"
          >
            <option value="E-Waste">E-Waste</option>
            <option value="Iron/Metal">Iron/Metal</option>
            <option value="HDPE Plastic">HDPE Plastic</option>
            <option value="Cardboard">Cardboard</option>
            <option value="Glass">Glass</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-[#1e140f]/50 uppercase tracking-widest block font-mono font-bold">Weight (grams)</label>
          <input
            type="number"
            required
            min="1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-[#fcfbfa] border border-[#1e140f]/35 focus:border-[#1e140f] rounded-none py-2 px-3 text-[#1e140f] focus:outline-none font-mono text-xs"
          />
        </div>

        <div className="flex gap-2 pt-2 font-mono text-[9px]">
          <button type="submit" className="flex-1 bg-[#1e140f] text-[#f7f4ef] border border-[#1e140f] hover:bg-[#fcfbfa] hover:text-[#1e140f] py-2 rounded-none font-bold uppercase tracking-widest cursor-pointer transition-colors duration-200">
            Save Changes
          </button>
          <button type="button" onClick={onClose} className="px-3 bg-transparent border border-[#1e140f]/35 hover:bg-[#1e140f] hover:text-[#f7f4ef] text-[#1e140f] rounded-none cursor-pointer transition-colors duration-200 uppercase tracking-wider">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
