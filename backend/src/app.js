import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import apiRoutes from "./routes/api.routes.js";
import { AppError, globalErrorHandler } from "./utils/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api", apiRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(globalErrorHandler);

export default app;
