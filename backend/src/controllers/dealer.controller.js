import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Dealer from "../models/dealer.model.js";
import User from "../models/user.model.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";

const signToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET);

export const registerDealer = catchAsync(async (req, res, next) => {
  const { companyName, email, password, servicePinCodes } = req.body;
  if (!companyName || !email || !password || !servicePinCodes) {
    return next(new AppError("All fields are required", 400));
  }

  const existing = await Dealer.findOne({ email });
  if (existing) return next(new AppError("Email already registered", 400));

  const passwordHash = await bcrypt.hash(password, 10);
  const dealer = await Dealer.create({
    companyName,
    email,
    passwordHash,
    servicePinCodes,
  });

  res.status(201).json({
    status: "success",
    token: signToken(dealer._id, "dealer"),
    data: { dealer: { id: dealer._id, companyName, email, servicePinCodes } },
  });
});

export const loginDealer = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Email and password required", 400));

  const dealer = await Dealer.findOne({ email });
  if (!dealer || !(await bcrypt.compare(password, dealer.passwordHash))) {
    return next(new AppError("Invalid credentials", 401));
  }

  res.json({
    status: "success",
    token: signToken(dealer._id, "dealer"),
    data: {
      dealer: {
        id: dealer._id,
        companyName: dealer.companyName,
        email: dealer.email,
      },
    },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const dealer = await Dealer.findById(req.user.id);
  res.json({
    status: "success",
    data: { dealer },
  });
});

export const getDealerDispatches = catchAsync(async (req, res, next) => {
  const dispatches = await User.find({
    assignedDealer: req.user.id,
    pickupStatus: "accepted",
  }).populate("inventory");
  
  res.json({
    status: "success",
    data: { dispatches }
  });
});

export const getOpenRequests = catchAsync(async (req, res, next) => {
  const dealer = await Dealer.findById(req.user.id);
  if (!dealer) return next(new AppError("Dealer not found", 404));

  const openRequests = await User.find({
    pinCode: { $in: dealer.servicePinCodes },
    pickupStatus: "requested"
  }).populate("inventory");

  res.json({
    status: "success",
    data: { openRequests }
  });
});
