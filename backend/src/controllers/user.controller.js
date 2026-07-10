import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";

const signToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET);

export const registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, pinCode, address } = req.body;
  if (!name || !email || !password || !pinCode || !address) {
    return next(new AppError("All fields are required", 400));
  }

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError("Email already registered", 400));

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, pinCode, address });

  res.status(201).json({
    status: "success",
    token: signToken(user._id, "user"),
    data: { user: { id: user._id, name, email, pinCode, address } },
  });
});

export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Email and password required", 400));

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return next(new AppError("Invalid credentials", 401));
  }

  res.json({
    status: "success",
    token: signToken(user._id, "user"),
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pinCode: user.pinCode,
      },
    },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("inventory").populate("assignedDealer");
  res.json({
    status: "success",
    data: { user },
  });
});
