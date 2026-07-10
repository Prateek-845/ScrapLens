import React, { useState } from "react";

export default function LiveChat({ title, chatMessages, senderId, onSendMessage }) {
  const [msgInput, setMsgInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    onSendMessage(msgInput);
    setMsgInput("");
  };

  return (
    <div className="border border-[#1e140f]/25 rounded-none overflow-hidden bg-[#fcfbfa] text-xs">
      <div className="bg-[#f7f4ef] px-3.5 py-2.5 border-b border-[#1e140f]/20 font-serif font-bold text-[#1e140f] flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1e140f]"></span>
          {title}
        </span>
      </div>
      <div className="flex flex-col h-44">
        <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-32">
          {chatMessages.length ? (
            chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-2 rounded-none leading-relaxed ${
                  msg.senderId === senderId
                    ? "ml-auto bg-[#ab4e35]/10 border border-[#ab4e35]/25 text-[#ab4e35]"
                    : "mr-auto bg-[#f7f4ef] border border-[#1e140f]/15 text-[#1e140f]"
                }`}
              >
                <span className="block text-[8px] uppercase tracking-widest font-mono text-[#1e140f]/50 mb-0.5">
                  {msg.senderName} ({msg.senderRole})
                </span>
                <p className="text-[11px] font-sans">{msg.message}</p>
              </div>
            ))
          ) : (
            <p className="text-center font-mono text-[#1e140f]/50 text-[10px] mt-6">No messages yet. Send a note to coordinate!</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-2 border-t border-[#1e140f]/20 flex gap-2">
          <input
            type="text"
            placeholder="Type directions, note..."
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            className="flex-1 bg-[#fcfbfa] border border-[#1e140f]/20 rounded-none px-2.5 py-1.5 text-[11px] text-[#1e140f] focus:outline-none focus:border-[#1e140f]"
          />
          <button type="submit" className="bg-[#1e140f] hover:bg-[#302016] text-[#f7f4ef] px-3.5 py-1.5 font-bold uppercase font-mono tracking-widest text-[9px] rounded-none cursor-pointer transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
