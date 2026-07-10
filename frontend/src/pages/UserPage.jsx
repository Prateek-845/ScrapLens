import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../context/AuthContext";
import LiveChat from "../components/LiveChat";
import HistoryTable from "../components/HistoryTable";
import DashboardLayout from "../components/DashboardLayout";
import ProgressGoalCard from "../components/ProgressGoalCard";
import InventoryBinCard from "../components/InventoryBinCard";
import EditItemModal from "../components/EditItemModal";
import useUserDashboard from "../hooks/useUserDashboard";

export default function UserPage() {
  const { user, logout, fetchProfile } = useAuth();
  const [editingItem, setEditingItem] = useState(null);
  const {
    uploading,
    pickupLoading,
    actionLoading,
    priceRates,
    msg,
    error,
    history,
    chatMessages,
    userOffer,
    setUserOffer,
    handleSendMessage,
    onDrop,
    handleDelete,
    handleOverride,
    calculateEstimate,
    handleRequestPickup,
    handleAcceptCounter,
    handleDeclineCounter,
    handleCancel,
    handleComplete,
    handleUpdateItem
  } = useUserDashboard(user, fetchProfile);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: false
  });

  const sidebarCards = (
    <>
      {user?.address && (
        <div className="bg-transparent p-0 space-y-2">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1e140f] border-b border-[#1e140f]/20 pb-2">Pickup Address</h3>
          <p className="text-[#1e140f]/70 leading-relaxed font-sans text-[11px]">{user.address}</p>
        </div>
      )}
      <div className="bg-transparent p-0 space-y-3">
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1e140f] border-b border-[#1e140f]/20 pb-2">Environmental Impact</h3>
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-[#1e140f]/70 tracking-wider">
            <span>CO₂ Offset</span>
            <span className="font-bold text-[#ab4e35]">{(user?.totalCo2OffsetKg || 0).toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#1e140f]/70 tracking-wider">
            <span>Water Saved</span>
            <span className="font-bold text-[#ab4e35]">{(user?.totalWaterSavedLiters || 0).toFixed(1)} L</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#1e140f]/70 tracking-wider">
            <span>Trees Conserved</span>
            <span className="font-bold text-[#ab4e35]">{(user?.totalTreesSaved || 0).toFixed(3)} trees</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout
      title="ScrapLens"
      subtitle={`PIN: ${user?.pinCode}`}
      userName={user?.name}
      onLogout={logout}
      priceRates={priceRates}
      sidebarCards={sidebarCards}
    >
      {/* Center Dashboard Panel */}
      <div className="md:col-span-2 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-mono py-3 px-4 rounded-none">{error}</div>}
        {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono py-3 px-4 rounded-none">{msg}</div>}

        {user?.pickupStatus !== "idle" && (
          <div className="bg-[#fcfbfa] border border-[#1e140f]/25 p-6 rounded-none space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-[#1e140f]/15 pb-2">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#1e140f]">Pickup Status</span>
              <span className="text-[10px] font-mono px-2 py-0.5 uppercase border border-[#1e140f] text-[#1e140f]">{user?.pickupStatus}</span>
            </div>
            {user?.pickupStatus === "requested" ? (
              <div className="bg-[#f7f4ef] p-4 border border-[#1e140f]/15 rounded-none space-y-2.5">
                <div className="flex justify-between font-mono text-[#1e140f]/70">
                  <span>Market Estimate:</span>
                  <span className="font-bold text-[#1e140f]">₹{user?.estimatedPrice}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e140f]/10 pb-2 font-mono text-[#1e140f]/70">
                  <span>Your Expected Price:</span>
                  <span className="font-bold text-[#ab4e35]">₹{user?.offeredPrice}</span>
                </div>
                {user?.counterPrice > 0 ? (
                  <div className="p-4 bg-[#ab4e35]/5 border border-[#ab4e35]/25 rounded-none space-y-3">
                    <p className="font-serif font-bold text-[#ab4e35] text-sm leading-tight">
                      Counter-bid from {user?.counterDealerName}: <span className="underline">₹{user?.counterPrice}</span>
                    </p>
                    <p className="text-[10px] font-mono text-[#1e140f]/75">Scheduled: {user?.estimatedPickupTime}</p>
                    <div className="flex gap-2 font-mono text-[9px] tracking-wider">
                      <button onClick={handleAcceptCounter} disabled={actionLoading} className="flex-1 bg-[#1e140f] text-[#f7f4ef] border border-[#1e140f] hover:bg-[#f7f4ef] hover:text-[#1e140f] py-2 rounded-none font-bold uppercase tracking-widest cursor-pointer transition-colors duration-200">
                        Accept Bid
                      </button>
                      <button onClick={handleDeclineCounter} disabled={actionLoading} className="px-3 bg-transparent border border-[#1e140f]/35 text-[#1e140f] hover:bg-[#1e140f] hover:text-[#f7f4ef] py-2 rounded-none font-bold uppercase tracking-widest cursor-pointer transition-colors duration-200">
                        Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#1e140f]/60 font-serif italic leading-relaxed">Broadcasted to local collectors. Waiting for bids...</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#f7f4ef] p-4 border border-[#1e140f]/15 rounded-none space-y-2 text-[#1e140f]">
                  <p className="font-serif font-bold text-sm">Dealer Assigned: {user?.assignedDealer?.companyName}</p>
                  <p className="text-[#1e140f]/65 font-mono text-[10px] tracking-wider">{user?.assignedDealer?.email}</p>
                  <div className="flex justify-between border-t border-[#1e140f]/10 pt-2 mt-2 font-mono text-[11px] tracking-wider">
                    <span className="text-[#1e140f]/60">Scheduled Arrival:</span>
                    <span className="font-bold">{user?.estimatedPickupTime}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] tracking-wider">
                    <span className="text-[#1e140f]/60">Agreed Price:</span>
                    <span className="font-bold text-[#ab4e35]">₹{user?.offeredPrice}</span>
                  </div>
                </div>
                <LiveChat title="Live Coordination Chat" chatMessages={chatMessages} senderId={user._id} onSendMessage={handleSendMessage} />
              </div>
            )}
            <div className="flex gap-2 font-mono text-[9px] tracking-widest">
              {user?.pickupStatus === "accepted" && (
                <button onClick={handleComplete} disabled={actionLoading} className="flex-1 py-2.5 bg-[#3f5e4d] text-[#f7f4ef] border border-[#3f5e4d] hover:bg-[#fcfbfa] hover:text-[#3f5e4d] font-bold rounded-none uppercase tracking-widest cursor-pointer transition-colors duration-200">
                  Complete Collection
                </button>
              )}
              <button onClick={handleCancel} disabled={actionLoading} className="flex-1 py-2.5 bg-transparent border border-[#1e140f]/40 text-[#1e140f] hover:bg-[#1e140f] hover:text-[#f7f4ef] font-bold rounded-none uppercase tracking-widest cursor-pointer transition-colors duration-200">
                Cancel Request
              </button>
            </div>
          </div>
        )}

        {user?.pickupStatus === "idle" && (
          <div
            {...getRootProps({
              className: "border border-[#1e140f] p-10 text-center cursor-pointer transition-all duration-200 hover:opacity-90 rounded-none"
            })}
            style={{ backgroundColor: "#1e140f", color: "#f7f4ef" }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center py-4 text-xs font-mono" style={{ color: "#f7f4ef" }}>
                <span className="animate-spin h-6 w-6 border-2 rounded-full mb-2" style={{ borderColor: "#f7f4ef", borderTopColor: "transparent" }}></span>
                <span>AI identifying material and weight...</span>
              </div>
            ) : (
              <div className="text-xs py-4" style={{ color: "#f7f4ef" }}>
                <p className="text-base font-serif font-bold mb-1" style={{ color: "#f7f4ef" }}>Upload Scrap Photo</p>
                <p className="font-mono text-[10px] tracking-widest uppercase opacity-60" style={{ color: "#f7f4ef" }}>Drag & drop or click to upload</p>
              </div>
            )}
          </div>
        )}

        <ProgressGoalCard
          user={user}
          userOffer={userOffer}
          setUserOffer={setUserOffer}
          estimatedPrice={calculateEstimate()}
          pickupLoading={pickupLoading}
          onOverride={handleOverride}
          onRequestPickup={handleRequestPickup}
        />
      </div>

      {/* Right Inventory Bin Panel */}
      <div className="md:col-span-1">
        <InventoryBinCard user={user} onEdit={(item, e) => { e.stopPropagation(); setEditingItem(item); }} onDelete={handleDelete} />
      </div>

      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onSave={async (id, data) => {
          await handleUpdateItem(id, data);
          setEditingItem(null);
        }}
        onClose={() => setEditingItem(null)}
      />

      <footer className="col-span-full mt-4">
        <HistoryTable history={history} role="user" />
      </footer>
    </DashboardLayout>
  );
}
