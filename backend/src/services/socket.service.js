import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Dealer from "../models/dealer.model.js";
import User from "../models/user.model.js";

let io = null;

export const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const { id, role } = socket.user;
    socket.join(id);

    if (role === "dealer") {
      await Dealer.findByIdAndUpdate(id, { socketId: socket.id });
    }

    socket.on("join_chat", ({ roomId }) => socket.join(roomId));

    socket.on("send_message", async ({ roomId, senderId, senderName, message, senderRole }) => {
      try {
        const msg = { senderId, senderName, message, senderRole, timestamp: new Date() };
        await User.findByIdAndUpdate(roomId, { $push: { chatHistory: msg } });
        io.to(roomId).emit("new_message", { roomId, ...msg });
      } catch (err) {
        console.error("Chat error:", err.message);
      }
    });

    socket.on("disconnect", async () => {
      if (role === "dealer") {
        await Dealer.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
      }
    });
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (io) io.to(userId.toString()).emit(event, payload);
};

export const emitPickupRequest = (dealerSocketIds, payload) => {
  if (io) {
    dealerSocketIds.forEach((sid) => {
      if (sid) io.to(sid).emit("pickup_requested", payload);
    });
  }
};
