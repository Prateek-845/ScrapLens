import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true
    },
    dealerName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["completed", "cancelled"],
      required: true
    },
    items: [
      {
        materialType: { type: String, required: true },
        estimatedWeightGrams: { type: Number, required: true }
      }
    ],
    totalWeightGrams: {
      type: Number,
      required: true
    },
    agreedPrice: {
      type: Number,
      required: true
    },
    resolvedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
