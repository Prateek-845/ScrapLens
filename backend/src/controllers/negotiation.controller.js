import User from "../models/user.model.js";
import Dealer from "../models/dealer.model.js";
import { emitPickupRequest, emitToUser } from "../services/socket.service.js";
import { getMarketRates } from "../services/scraper.service.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";

export const requestPickup = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.user._id).populate("inventory");
  if (!user || !user.isPickupEligible) {
    return next(new AppError("Not eligible for pickup. Must reach 2kg of scrap.", 400));
  }
  if (user.pickupStatus !== "idle") {
    return next(new AppError("You already have an active pickup request.", 400));
  }

  const rates = await getMarketRates();
  const ratesMap = {};
  rates.forEach((r) => {
    const match = r.rate.match(/(\d+)/);
    if (match) ratesMap[r.item.toLowerCase()] = parseInt(match[1], 10);
  });

  let estimatedPrice = 0;
  user.inventory.forEach((item) => {
    const kg = item.estimatedWeightGrams / 1000;
    const cat = (item.materialType || "").toLowerCase();
    let rate = 0;
    if (cat.includes("cardboard") || cat.includes("paper")) rate = ratesMap["cardboard"] || 9;
    else if (cat.includes("metal") || cat.includes("iron")) rate = ratesMap["iron/metal"] || 32;
    else if (cat.includes("plastic")) rate = ratesMap["hdpe plastic"] || 14;
    else if (cat.includes("e-waste") || cat.includes("electronic")) rate = ratesMap["e-waste"] || 105;
    else if (cat.includes("glass")) rate = ratesMap["glass"] || 10;
    estimatedPrice += kg * rate;
  });

  user.pickupStatus = "requested";
  user.estimatedPrice = Math.round(estimatedPrice);
  user.offeredPrice = Math.round(req.body.offeredPrice || estimatedPrice);
  user.counterPrice = 0;
  user.counterDealerId = null;
  user.counterDealerName = null;
  await user.save();

  const matchingDealers = await Dealer.find({ servicePinCodes: { $in: [user.pinCode] }, socketId: { $ne: null } });

  const payload = {
    userId: user._id,
    userName: user.name,
    userPinCode: user.pinCode,
    totalWeightGrams: user.totalInventoryWeight,
    address: user.address || "Manual Address Placeholder",
    estimatedPrice: user.estimatedPrice,
    offeredPrice: user.offeredPrice,
    inventory: user.inventory.map((item) => ({
      materialType: item.materialType,
      estimatedWeightGrams: item.estimatedWeightGrams,
      imageUrl: item.imageUrl
    }))
  };

  emitPickupRequest(matchingDealers.map((d) => d.socketId), payload);

  res.json({
    status: "success",
    message: `Pickup requested. Dispatched.`,
    data: { notifiedDealersCount: matchingDealers.length, user }
  });
});

export const acceptPickup = catchAsync(async (req, res, next) => {
  const { userId, estimatedPickupTime, proposedPrice } = req.body;
  if (!userId || !estimatedPickupTime) {
    return next(new AppError("userId and estimatedPickupTime are required", 400));
  }

  let customer = await User.findById(userId);
  if (!customer) return next(new AppError("Customer not found", 404));

  if (customer.pickupStatus !== "requested") {
    return next(new AppError("This pickup request has already been claimed by another collector.", 400));
  }

  const isCounterOffer = proposedPrice !== undefined && Number(proposedPrice) !== customer.offeredPrice;

  if (isCounterOffer) {
    customer.counterPrice = Number(proposedPrice);
    customer.counterDealerId = req.user._id;
    customer.counterDealerName = req.user.companyName || req.user.name;
    customer.estimatedPickupTime = estimatedPickupTime;
    await customer.save();

    emitToUser(userId, "counter_offer_received", {
      counterPrice: customer.counterPrice,
      counterDealerName: customer.counterDealerName,
      counterDealerId: req.user._id,
      estimatedPickupTime
    });

    return res.json({
      status: "success",
      message: "Counter-offer sent to the household customer.",
      data: { customer }
    });
  }

  customer.pickupStatus = "accepted";
  customer.assignedDealer = req.user._id;
  customer.estimatedPickupTime = estimatedPickupTime;
  customer.counterPrice = 0;
  customer.counterDealerId = null;
  customer.counterDealerName = null;
  await customer.save();

  emitToUser(userId, "pickup_accepted", {
    companyName: req.user.companyName,
    email: req.user.email,
    estimatedPickupTime,
    agreedPrice: customer.offeredPrice
  });

  const otherDealers = await Dealer.find({ servicePinCodes: { $in: [customer.pinCode] }, _id: { $ne: req.user._id }, socketId: { $ne: null } });
  otherDealers.forEach((dealer) => emitToUser(dealer._id, "pickup_claimed", { userId }));

  res.json({
    status: "success",
    message: "Pickup request accepted successfully",
    data: { customer }
  });
});

export const acceptCounterOffer = catchAsync(async (req, res, next) => {
  let customer = await User.findById(req.user._id);
  if (!customer) return next(new AppError("User not found", 404));

  if (customer.pickupStatus !== "requested" || !customer.counterDealerId) {
    return next(new AppError("No active counter-offer to accept.", 400));
  }

  const dealerId = customer.counterDealerId;
  const agreedPrice = customer.counterPrice;

  customer.pickupStatus = "accepted";
  customer.assignedDealer = dealerId;
  customer.offeredPrice = agreedPrice;
  customer.counterPrice = 0;
  customer.counterDealerId = null;
  customer.counterDealerName = null;
  await customer.save();

  emitToUser(dealerId, "pickup_accepted", {
    companyName: req.user.name,
    email: req.user.email,
    estimatedPickupTime: customer.estimatedPickupTime,
    agreedPrice
  });

  emitToUser(customer._id, "pickup_accepted", {
    companyName: customer.assignedDealer?.companyName,
    estimatedPickupTime: customer.estimatedPickupTime,
    agreedPrice
  });

  const otherDealers = await Dealer.find({ servicePinCodes: { $in: [customer.pinCode] }, socketId: { $ne: null } });
  otherDealers.forEach((dealer) => emitToUser(dealer._id, "pickup_claimed", { userId: customer._id }));

  res.json({
    status: "success",
    message: "Counter-offer accepted successfully",
    data: { customer }
  });
});

export const declineCounterOffer = catchAsync(async (req, res, next) => {
  let customer = await User.findById(req.user._id);
  if (!customer) return next(new AppError("User not found", 404));

  const prevCounterDealerId = customer.counterDealerId;

  customer.counterPrice = 0;
  customer.counterDealerId = null;
  customer.counterDealerName = null;
  await customer.save();

  emitToUser(customer._id, "counter_offer_declined", {});

  if (prevCounterDealerId) {
    emitToUser(prevCounterDealerId, "counter_offer_declined", { userId: customer._id });
  }

  res.json({
    status: "success",
    message: "Counter-offer declined successfully",
    data: { customer }
  });
});
