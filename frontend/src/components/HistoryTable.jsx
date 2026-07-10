import React from "react";

export default function HistoryTable({ history, role }) {
  return (
    <div className="bg-[#fcfbfa] border border-[#1e140f]/25 p-5 rounded-none space-y-4 text-xs">
      <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1e140f] border-b border-[#1e140f]/20 pb-2.5">
        Recycling Trip History
      </h3>
      {history.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#1e140f]/60 border-b border-[#1e140f]/20 text-[9px] uppercase tracking-widest font-mono font-bold">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">{role === "user" ? "Collector / Dealer" : "Customer"}</th>
                <th className="py-2.5">Weight Recycled</th>
                <th className="py-2.5">Agreed Value</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e140f]/10">
              {history.map((tx) => (
                <tr key={tx._id} className="text-[#1e140f]/80 hover:bg-[#1e140f]/5 transition">
                  <td className="py-3 font-mono text-[10px] text-[#1e140f]/65">
                    {new Date(tx.resolvedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="py-3 font-serif font-bold text-[#1e140f]">
                    {role === "user" ? tx.dealerName : tx.userName}
                  </td>
                  <td className="py-3 font-mono">
                    {tx.status === "completed" ? `${(tx.totalWeightGrams / 1000).toFixed(2)} kg` : "--"}
                  </td>
                  <td className="py-3 font-mono font-bold text-[#ab4e35]">
                    {tx.status === "completed" ? `₹${tx.agreedPrice}` : "--"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider border rounded-none ${
                        tx.status === "completed"
                          ? "bg-[#3f5e4d]/5 text-[#3f5e4d] border-[#3f5e4d]/40"
                          : "bg-[#ab4e35]/5 text-[#ab4e35] border-[#ab4e35]/40"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[#1e140f]/50 text-center font-mono py-6">No historical records found.</p>
      )}
    </div>
  );
}
