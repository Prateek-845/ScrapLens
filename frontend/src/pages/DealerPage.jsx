import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import HistoryTable from "../components/HistoryTable";
import DashboardLayout from "../components/DashboardLayout";
import ClaimModal from "../components/ClaimModal";
import DealerRequestCard from "../components/DealerRequestCard";
import DealerDispatchCard from "../components/DealerDispatchCard";
import useDealerDashboard from "../hooks/useDealerDashboard";

export default function DealerPage() {
  const { user, logout } = useAuth();
  const {
    priceRates,
    requests,
    dispatches,
    history,
    isConnected,
    chats,
    dismissedReqs,
    fetchOpenRequests,
    fetchDispatches,
    fetchHistory,
    handleSendMessage,
    handleRejectRequest
  } = useDealerDashboard(user);

  const [activeTab, setActiveTab] = useState("requests");
  const [actionLoading, setActionLoading] = useState(false);

  // Claim ETA state
  const [showEtaModal, setShowEtaModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [eta, setEta] = useState("Within 2 Hours (Today)");
  const [bidPrice, setBidPrice] = useState("");

  // Lightbox Modal
  const [lightboxImg, setLightboxImg] = useState(null);

  const handleConfirmAccept = async () => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      await api.post("/scrap/accept-pickup", {
        userId: selectedJob.userId || selectedJob._id,
        estimatedPickupTime: eta,
        proposedPrice: Number(bidPrice)
      });
      await fetchOpenRequests();
      await fetchDispatches();
      setShowEtaModal(false);
      setSelectedJob(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (customerId) => {
    setActionLoading(true);
    try {
      await api.post("/scrap/complete-pickup", { userId: customerId });
      await fetchDispatches();
      await fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => !dismissedReqs.includes(r.userId || r._id));

  const sidebarCards = (
    <div className="bg-transparent p-0 space-y-4 text-xs">
      <h3 className="font-serif text-base font-bold uppercase tracking-wider text-[#1e140f] border-b border-[#1e140f]/20 pb-2">Dealer Details</h3>
      <p className="font-mono text-[#1e140f]/70 tracking-wider"><span className="text-[#1e140f]/50 block uppercase text-[9px] tracking-widest mb-0.5">Company:</span> <span className="font-serif font-bold text-xs text-[#1e140f]">{user?.companyName}</span></p>
      <p className="font-mono text-[#1e140f]/70 tracking-wider"><span className="text-[#1e140f]/50 block uppercase text-[9px] tracking-widest mb-0.5">Email:</span> {user?.email}</p>
      <div>
        <span className="text-[#1e140f]/50 block uppercase text-[9px] tracking-widest mb-1.5 font-mono">PINs Serviced:</span>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {user?.servicePinCodes?.map((pin) => (
            <span key={pin} className="px-1.5 py-0.5 rounded-none bg-[#fcfbfa] border border-[#1e140f]/20 text-[10px] font-mono font-bold text-[#1e140f] tracking-wider">{pin}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="ScrapLens Dealer"
      subtitle={isConnected ? "Online" : "Connecting..."}
      userName={user?.companyName}
      onLogout={logout}
      priceRates={priceRates}
      sidebarCards={sidebarCards}
    >
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e140f]/90 backdrop-blur-xs cursor-zoom-out p-4">
          <img src={lightboxImg} alt="Scrap Detail Preview" className="max-w-full max-h-[85vh] rounded-none border-2 border-[#f7f4ef] shadow-2xl object-contain" />
        </div>
      )}

      <ClaimModal
        isOpen={showEtaModal}
        selectedJob={selectedJob}
        eta={eta}
        setEta={setEta}
        bidPrice={bidPrice}
        setBidPrice={setBidPrice}
        actionLoading={actionLoading}
        onSubmit={handleConfirmAccept}
        onClose={() => { setShowEtaModal(false); setSelectedJob(null); }}
      />

      <div className="md:col-span-3 space-y-4">
        <div className="flex border-b border-[#1e140f]/15 gap-6 text-[10px] font-mono uppercase tracking-widest pb-0.5">
          {["requests", "dispatches", "history"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-2 px-1 font-bold transition-all cursor-pointer ${
                activeTab === t ? "border-b-2 border-[#1e140f] text-[#1e140f]" : "text-[#1e140f]/50 hover:text-[#1e140f]"
              }`}
            >
              {t} ({t === "requests" ? filteredRequests.length : t === "dispatches" ? dispatches.length : history.length})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === "requests" && (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.length ? (
                filteredRequests.map((req) => (
                  <DealerRequestCard
                    key={req.userId || req._id}
                    req={req}
                    onAcceptBid={(job) => { setSelectedJob(job); setBidPrice(job.offeredPrice.toString()); setShowEtaModal(true); }}
                    onReject={(uid, e) => { e.stopPropagation(); handleRejectRequest(uid); }}
                    onImageClick={setLightboxImg}
                  />
                ))
              ) : (
                <p className="text-[#1e140f]/50 font-mono text-center py-12 text-xs">No active requests matching your PIN code area.</p>
              )}
            </div>
          )}

          {activeTab === "dispatches" && (
            <div className="grid grid-cols-1 gap-4">
              {dispatches.length ? (
                dispatches.map((disp) => (
                  <DealerDispatchCard
                    key={disp._id}
                    disp={disp}
                    chats={chats}
                    user={user}
                    onSendMessage={handleSendMessage}
                    onComplete={handleComplete}
                    onImageClick={setLightboxImg}
                  />
                ))
              ) : (
                <p className="text-[#1e140f]/50 font-mono text-center py-12 text-xs">No active dispatch schedules in progress.</p>
              )}
            </div>
          )}

          {activeTab === "history" && <HistoryTable history={history} role="dealer" />}
        </div>
      </div>
    </DashboardLayout>
  );
}
