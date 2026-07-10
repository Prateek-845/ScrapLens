import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Dealer from "../models/dealer.model.js";
import { AppError } from "../utils/errorHandler.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Unauthorized: Token missing", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser =
      decoded.role === "dealer"
        ? await Dealer.findById(decoded.id)
        : await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError("Unauthorized: Account not found", 401));
    }

    req.user = currentUser;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return next(new AppError("Unauthorized: Invalid token", 401));
  }
};

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(new AppError("Forbidden: Access denied", 403));
    }
    next();
  };
