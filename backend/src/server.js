import http from "http";
import app from "./app.js";
import connectDB from "./config/db.config.js";
import { initSocket } from "./services/socket.service.js";

connectDB();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
