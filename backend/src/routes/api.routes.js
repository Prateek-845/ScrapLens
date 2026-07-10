import express from "express";
import { 
  uploadScrap, 
  deleteScrapItem, 
  getScrapMarketRates,
  updateScrapItem
} from "../controllers/scrapItem.controller.js";
import { 
  requestPickup, 
  acceptPickup, 
  acceptCounterOffer,
  declineCounterOffer
} from "../controllers/negotiation.controller.js";
import { 
  completePickup,
  cancelPickup,
  overrideEligibility,
  getTransactionHistory
} from "../controllers/pickup.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/scrap/market-rates", protect, getScrapMarketRates);

// Scrap Item Management
router.post("/scrap/upload", protect, restrictTo("user"), uploadSingleImage, uploadScrap);
router.delete("/scrap/item/:itemId", protect, restrictTo("user"), deleteScrapItem);
router.put("/scrap/item/:itemId", protect, restrictTo("user"), updateScrapItem);

// Eligibility Overrides
router.post("/users/override-eligibility", protect, restrictTo("user"), overrideEligibility);

// Pickup Requests Lifecycle
router.post("/scrap/request-pickup", protect, restrictTo("user"), requestPickup);
router.post("/scrap/accept-pickup", protect, restrictTo("dealer"), acceptPickup);
router.post("/scrap/accept-counter", protect, restrictTo("user"), acceptCounterOffer);
router.post("/scrap/decline-counter", protect, restrictTo("user"), declineCounterOffer);
router.post("/scrap/complete-pickup", protect, restrictTo("user", "dealer"), completePickup);
router.post("/scrap/cancel-pickup", protect, restrictTo("user", "dealer"), cancelPickup);
router.get("/scrap/history", protect, getTransactionHistory);

export default router;
