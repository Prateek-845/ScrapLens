import mongoose from "mongoose";

const dealerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    servicePinCodes: { type: [String], required: true, index: true },
    socketId: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

const Dealer = mongoose.model("Dealer", dealerSchema);
export default Dealer;
