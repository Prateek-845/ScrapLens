import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

export default function useUserDashboard(user, fetchProfile) {
  const [uploading, setUploading] = useState(false);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [priceRates, setPriceRates] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [userOffer, setUserOffer] = useState("");
  const socketRef = useRef(null);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchRates = useCallback(async () => {
    try {
      const res = await api.get("/scrap/market-rates");
      setPriceRates(res.data.data.rates);
    } catch {
      setPriceRates([
        { item: "E-Waste", rate: "₹100/kg" },
        { item: "Iron/Metal", rate: "₹34/kg" },
        { item: "HDPE Plastic", rate: "₹13/kg" },
        { item: "Cardboard", rate: "₹7/kg" },
        { item: "Glass", rate: "₹10/kg" }
      ]);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get("/scrap/history");
      setHistory(res.data.data.transactions);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    fetchHistory();
  }, [fetchRates, fetchHistory]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("pickup_accepted", fetchProfile);
    socket.on("pickup_completed", () => {
      fetchProfile();
      fetchHistory();
      setMsg("Pickup completed!");
    });
    socket.on("pickup_cancelled", () => {
      fetchProfile();
      fetchHistory();
      setError("Pickup request was cancelled.");
    });
    socket.on("counter_offer_received", fetchProfile);
    socket.on("counter_offer_declined", fetchProfile);
    socket.on("new_message", (m) => setChatMessages((prev) => [...prev, m]));

    return () => socket.disconnect();
  }, [fetchProfile, fetchHistory, SOCKET_URL]);

  useEffect(() => {
    if (socketRef.current && user?._id && user?.pickupStatus === "accepted") {
      socketRef.current.emit("join_chat", { roomId: user._id });
    }
  }, [user?.pickupStatus, user?._id]);

  useEffect(() => {
    if (user?.chatHistory) setChatMessages(user.chatHistory);
  }, [user?.chatHistory]);

  const handleSendMessage = (text) => {
    if (!socketRef.current || !user?._id) return;
    socketRef.current.emit("send_message", {
      roomId: user._id,
      senderId: user._id,
      senderName: user.name,
      message: text,
      senderRole: "user"
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("image", acceptedFiles[0]);

    try {
      await api.post("/scrap/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setUploading(false);
    }
  }, [fetchProfile]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/scrap/item/${id}`);
      await fetchProfile();
    } catch {
      setError("Failed to delete item");
    }
  };

  const handleOverride = async () => {
    try {
      await api.post("/users/override-eligibility");
      await fetchProfile();
    } catch {
      setError("Override failed");
    }
  };

  const calculateEstimate = useCallback(() => {
    let est = 0;
    const ratesMap = {};
    priceRates.forEach((r) => {
      const match = r.rate.match(/(\d+)/);
      if (match) ratesMap[r.item.toLowerCase()] = parseInt(match[1], 10);
    });

    user?.inventory?.forEach((item) => {
      const kg = item.estimatedWeightGrams / 1000;
      const cat = (item.materialType || "").toLowerCase();
      let rate = 0;
      if (cat.includes("cardboard") || cat.includes("paper")) rate = ratesMap["cardboard"] || 9;
      else if (cat.includes("metal") || cat.includes("iron")) rate = ratesMap["iron/metal"] || 32;
      else if (cat.includes("plastic")) rate = ratesMap["hdpe plastic"] || 14;
      else if (cat.includes("e-waste") || cat.includes("electronic")) rate = ratesMap["e-waste"] || 105;
      else if (cat.includes("glass")) rate = ratesMap["glass"] || 10;
      est += kg * rate;
    });
    return Math.round(est);
  }, [priceRates, user?.inventory]);

  useEffect(() => {
    if (user?.pickupStatus === "idle" && user?.inventory?.length > 0) {
      setUserOffer(calculateEstimate().toString());
    }
  }, [user?.inventory, calculateEstimate, user?.pickupStatus]);

  const handleRequestPickup = async () => {
    setPickupLoading(true);
    try {
      const res = await api.post("/scrap/request-pickup", {
        offeredPrice: parseInt(userOffer, 10) || calculateEstimate()
      });
      setMsg(res.data.message);
      await fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setPickupLoading(false);
    }
  };

  const handleAcceptCounter = async () => {
    setActionLoading(true);
    try {
      await api.post("/scrap/accept-counter");
      await fetchProfile();
      setMsg("Offer accepted!");
    } catch {
      setError("Failed to accept offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineCounter = async () => {
    setActionLoading(true);
    try {
      await api.post("/scrap/decline-counter");
      await fetchProfile();
      setMsg("Offer declined.");
    } catch {
      setError("Failed to decline offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api.post("/scrap/cancel-pickup");
      await fetchProfile();
      await fetchHistory();
    } catch {
      setError("Failed to cancel request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await api.post("/scrap/complete-pickup");
      await fetchProfile();
      await fetchHistory();
    } catch {
      setError("Failed to complete collection");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateItem = async (itemId, updatedData) => {
    setActionLoading(true);
    try {
      await api.put(`/scrap/item/${itemId}`, updatedData);
      await fetchProfile();
      setMsg("Scrap item updated successfully!");
    } catch {
      setError("Failed to update scrap item");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    uploading,
    pickupLoading,
    actionLoading,
    priceRates,
    msg,
    setMsg,
    error,
    setError,
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
  };
}
