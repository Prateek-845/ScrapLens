import mongoose from "mongoose";

const scrapItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: { type: String, required: true },
    materialType: { type: String, required: true },
    itemName: { type: String, default: "" },
    estimatedWeightGrams: { type: Number, required: true },
    isRecyclable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

const ScrapItem = mongoose.model("ScrapItem", scrapItemSchema);
export default ScrapItem;
