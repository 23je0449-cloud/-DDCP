import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",         // Reference to the User collection
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  signature: {
    type: String,
    required: true,
    unique: true       // Optional: ensure no duplicate payouts
  },
  status: {
    type: String,
    enum: ["Processing", "Success", "Failure"],
    required: true
  }
}, {
  timestamps: true // Optional: adds createdAt and updatedAt fields
});

export const Payout = mongoose.model("Payout", payoutSchema);
