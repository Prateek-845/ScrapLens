import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    pinCode: { type: String, required: true, trim: true, index: true },
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: "ScrapItem" }],
    totalInventoryWeight: { type: Number, default: 0 },
    isPickupEligible: { type: Boolean, default: false },
    pickupStatus: { type: String, enum: ["idle", "requested", "accepted"], default: "idle" },
    assignedDealer: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", default: null },
    estimatedPickupTime: { type: String, default: null },
    address: { type: String, required: true, trim: true },
    totalCo2OffsetKg: { type: Number, default: 0 },
    totalWaterSavedLiters: { type: Number, default: 0 },
    totalTreesSaved: { type: Number, default: 0 },
    chatHistory: [
      {
        senderId: { type: String },
        senderName: { type: String },
        message: { type: String },
        senderRole: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    estimatedPrice: { type: Number, default: 0 },
    offeredPrice: { type: Number, default: 0 },
    counterPrice: { type: Number, default: 0 },
    counterDealerId: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", default: null },
    counterDealerName: { type: String, default: null }
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
