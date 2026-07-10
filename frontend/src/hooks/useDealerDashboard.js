import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

export default function useDealerDashboard(user) {
  const [priceRates, setPriceRates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState({});
  const socketRef = useRef(null);

  const [dismissedReqs, setDismissedReqs] = useState(() => {
    return JSON.parse(localStorage.getItem("scraplens_dismissed_requests") || "[]");
  });

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  const fetchRates = async () => {
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
  };

  const fetchOpenRequests = useCallback(async () => {
    try {
      const res = await api.get("/users/dealer/open-requests");
      setRequests(res.data.data.openRequests || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDispatches = useCallback(async () => {
    try {
      const res = await api.get("/users/dealer/dispatches");
      const list = res.data.data.dispatches || [];
      setDispatches(list);

      const loadedChats = {};
      list.forEach((disp) => {
        if (disp.chatHistory) loadedChats[disp._id] = disp.chatHistory;
      });
      setChats((prev) => ({ ...prev, ...loadedChats }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get("/scrap/history");
      setHistory(res.data.data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    fetchOpenRequests();
    fetchDispatches();
    fetchHistory();
  }, [fetchOpenRequests, fetchDispatches, fetchHistory]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("pickup_requested", (reqData) => {
      if (dismissedReqs.includes(reqData.userId)) return;
      setRequests((prev) => {
        if (prev.some((x) => x.userId === reqData.userId)) return prev;
        return [...prev, reqData];
      });
    });

    socket.on("pickup_claimed", (payload) => {
      setRequests((prev) => prev.filter((r) => r.userId !== payload.userId));
    });

    socket.on("dispatch_cancelled", (payload) => {
      setDispatches((prev) => prev.filter((d) => d._id !== payload.userId));
      setRequests((prev) => prev.filter((r) => r.userId !== payload.userId));
    });

    socket.on("counter_offer_declined", () => {
      fetchOpenRequests();
      fetchDispatches();
    });

    socket.on("pickup_completed", () => {
      fetchDispatches();
      fetchHistory();
    });

    socket.on("new_message", (m) => {
      setChats((prev) => ({
        ...prev,
        [m.roomId]: [...(prev[m.roomId] || []), m]
      }));
    });

    return () => socket.disconnect();
  }, [SOCKET_URL, dismissedReqs, fetchOpenRequests, fetchDispatches, fetchHistory]);

  useEffect(() => {
    if (socketRef.current && isConnected && dispatches.length > 0) {
      dispatches.forEach((d) => {
        socketRef.current.emit("join_chat", { roomId: d._id });
      });
    }
  }, [isConnected, dispatches]);

  const handleSendMessage = (customerId, text) => {
    if (!socketRef.current) return;
    socketRef.current.emit("send_message", {
      roomId: customerId,
      senderId: user?.id || user?._id,
      senderName: user?.companyName || user?.name || "Dealer",
      message: text,
      senderRole: "dealer"
    });
  };

  const handleRejectRequest = (customerId) => {
    const updated = [...dismissedReqs, customerId];
    setDismissedReqs(updated);
    localStorage.setItem("scraplens_dismissed_requests", JSON.stringify(updated));
    setRequests((prev) => prev.filter((r) => r.userId !== customerId));
  };

  return {
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
  };
}
