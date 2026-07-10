import ScrapItem from "../models/scrapItem.model.js";
import User from "../models/user.model.js";
import { identifyScrapImage } from "../services/gemini.service.js";
import uploadFile from "../services/storage.service.js";
import { getMarketRates } from "../services/scraper.service.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";

export const uploadScrap = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("No image file provided", 400));

  const storageResult = await uploadFile(req.file.buffer);
  if (!storageResult || !storageResult.url) {
    return next(new AppError("File upload failed", 500));
  }
  const imageUrl = storageResult.url;

  const items = await identifyScrapImage(req.file.buffer, req.file.mimetype);
  const createdItemIds = [];
  let totalWeightIncrement = 0;

  for (const item of items) {
    const itemWeight = item.itemCount * item.unitWeightGrams;
    const scrapItem = await ScrapItem.create({
      userId: req.user._id,
      imageUrl,
      materialType: item.materialType,
      itemName: `${item.itemName} (x${item.itemCount})`,
      estimatedWeightGrams: itemWeight,
      isRecyclable: item.isRecyclable
    });
    createdItemIds.push(scrapItem._id);
    totalWeightIncrement += itemWeight;
  }

  let user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { inventory: { $each: createdItemIds } },
      $inc: { totalInventoryWeight: totalWeightIncrement }
    },
    { new: true }
  );

  if (user.totalInventoryWeight >= 2000 && !user.isPickupEligible) {
    user = await User.findByIdAndUpdate(req.user._id, { isPickupEligible: true }, { new: true });
  }

  res.status(201).json({
    status: "success",
    data: { itemsCount: createdItemIds.length, user }
  });
});

export const deleteScrapItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const scrapItem = await ScrapItem.findById(itemId);

  if (!scrapItem) return next(new AppError("Scrap item not found", 404));
  if (scrapItem.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Permission denied", 403));
  }

  const weightToSubtract = scrapItem.estimatedWeightGrams;
  await ScrapItem.findByIdAndDelete(itemId);

  let user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { inventory: itemId },
      $inc: { totalInventoryWeight: -weightToSubtract }
    },
    { new: true }
  );

  if (user.totalInventoryWeight < 2000 && user.isPickupEligible) {
    user = await User.findByIdAndUpdate(req.user._id, { isPickupEligible: false }, { new: true });
  }

  res.json({
    status: "success",
    message: "Scrap item deleted successfully",
    data: { user }
  });
});

export const updateScrapItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { itemName, materialType, estimatedWeightGrams } = req.body;

  let scrapItem = await ScrapItem.findById(itemId);
  if (!scrapItem) return next(new AppError("Scrap item not found", 404));
  if (scrapItem.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Permission denied", 403));
  }

  const oldWeight = scrapItem.estimatedWeightGrams;
  const newWeight = Number(estimatedWeightGrams);

  if (isNaN(newWeight) || newWeight < 0) {
    return next(new AppError("Invalid weight value", 400));
  }

  scrapItem.itemName = itemName;
  scrapItem.materialType = materialType;
  scrapItem.estimatedWeightGrams = newWeight;
  await scrapItem.save();

  const weightDifference = newWeight - oldWeight;
  let user = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { totalInventoryWeight: weightDifference } },
    { new: true }
  ).populate("inventory");

  if (user.totalInventoryWeight >= 2000 && !user.isPickupEligible) {
    user.isPickupEligible = true;
    await user.save();
  } else if (user.totalInventoryWeight < 2000 && user.isPickupEligible) {
    user.isPickupEligible = false;
    await user.save();
  }

  res.json({
    status: "success",
    message: "Scrap item updated successfully",
    data: { user }
  });
});

export const getScrapMarketRates = catchAsync(async (req, res, next) => {
  const rates = await getMarketRates();
  res.json({
    status: "success",
    data: { rates }
  });
});
