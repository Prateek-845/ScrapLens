import ScrapItem from "../models/scrapItem.model.js";
import User from "../models/user.model.js";
import Dealer from "../models/dealer.model.js";
import Transaction from "../models/transaction.model.js";
import { emitToUser } from "../services/socket.service.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";

export const overrideEligibility = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isPickupEligible: true },
    { new: true },
  );
  res.json({
    status: "success",
    message: "Manual eligibility override successful",
    data: { user },
  });
});

export const completePickup = catchAsync(async (req, res, next) => {
  const callerIsDealer = !!req.user.companyName;
  const userId = callerIsDealer ? req.body.userId : req.user._id;
  if (!userId) return next(new AppError("Customer userId is required", 400));

  let customer = await User.findById(userId).populate("inventory");
  if (!customer) return next(new AppError("Customer not found", 404));

  let co2Offset = 0;
  let waterSaved = 0;
  let treesSaved = 0;

  customer.inventory.forEach((item) => {
    const kg = item.estimatedWeightGrams / 1000;
    const cat = (item.materialType || "").toLowerCase();

    if (cat.includes("cardboard") || cat.includes("paper")) {
      waterSaved += kg * 17;
      treesSaved += kg * 0.005;
      co2Offset += kg * 0.9;
    } else if (cat.includes("metal") || cat.includes("iron")) {
      co2Offset += kg * 1.5;
      waterSaved += kg * 25;
    } else if (cat.includes("plastic")) {
      co2Offset += kg * 1.2;
      waterSaved += kg * 10;
    } else if (cat.includes("e-waste") || cat.includes("electronic")) {
      co2Offset += kg * 3.0;
      waterSaved += kg * 15;
    }
  });

  customer.totalCo2OffsetKg = (customer.totalCo2OffsetKg || 0) + co2Offset;
  customer.totalWaterSavedLiters = (customer.totalWaterSavedLiters || 0) + waterSaved;
  customer.totalTreesSaved = (customer.totalTreesSaved || 0) + treesSaved;

  const dealerId = customer.assignedDealer || (callerIsDealer ? req.user._id : null);
  let dealerName = "Collector";
  if (dealerId) {
    const dealerObj = await Dealer.findById(dealerId);
    if (dealerObj) {
      dealerName = dealerObj.companyName || dealerObj.name;
    }
  }

  if (dealerId) {
    await Transaction.create({
      userId: customer._id,
      userName: customer.name,
      dealerId,
      dealerName,
      status: "completed",
      items: customer.inventory.map((item) => ({
        materialType: item.materialType,
        estimatedWeightGrams: item.estimatedWeightGrams,
      })),
      totalWeightGrams: customer.totalInventoryWeight,
      agreedPrice: customer.offeredPrice,
    });
  }

  await ScrapItem.deleteMany({ userId });
  customer.inventory = [];
  customer.totalInventoryWeight = 0;
  customer.isPickupEligible = false;
  customer.pickupStatus = "idle";
  customer.assignedDealer = null;
  customer.estimatedPickupTime = null;
  customer.chatHistory = [];
  await customer.save();

  emitToUser(userId, "pickup_completed", { message: "Pickup completed" });

  if (!callerIsDealer && dealerId) {
    emitToUser(dealerId, "pickup_completed", { userId });
  }

  res.json({
    status: "success",
    message: "Pickup completed, inventory reset successfully",
    data: { customer },
  });
});

export const cancelPickup = catchAsync(async (req, res, next) => {
  const callerIsDealer = !!req.user.companyName;
  const userId = callerIsDealer ? req.body.userId : req.user._id;
  if (!userId) return next(new AppError("Customer userId is required", 400));

  let customer = await User.findById(userId);
  if (!customer) return next(new AppError("Customer not found", 404));

  const assignedDealerId = customer.assignedDealer;

  if (assignedDealerId) {
    const dealerObj = await Dealer.findById(assignedDealerId);
    const dealerName = dealerObj
      ? dealerObj.companyName || dealerObj.name
      : "Collector";
    await Transaction.create({
      userId: customer._id,
      userName: customer.name,
      dealerId: assignedDealerId,
      dealerName,
      status: "cancelled",
      items: [],
      totalWeightGrams: customer.totalInventoryWeight || 0,
      agreedPrice: customer.offeredPrice || 0,
    });
  }

  customer.pickupStatus = "idle";
  customer.assignedDealer = null;
  customer.estimatedPickupTime = null;
  customer.chatHistory = [];
  await customer.save();

  emitToUser(userId, "pickup_cancelled", { message: "Pickup cancelled" });

  if (!callerIsDealer && assignedDealerId) {
    emitToUser(assignedDealerId, "dispatch_cancelled", { userId });
  }

  res.json({
    status: "success",
    message: "Pickup cancelled successfully",
    data: { customer },
  });
});

export const getTransactionHistory = catchAsync(async (req, res, next) => {
  const isDealer = !!req.user.companyName;
  const filter = isDealer
    ? { dealerId: req.user._id }
    : { userId: req.user._id };
  const transactions = await Transaction.find(filter).sort({ resolvedAt: -1 });

  res.json({
    status: "success",
    data: { transactions },
  });
});
