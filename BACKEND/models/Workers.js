
import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  balance_id: { type: Number, required: true },
  pending_amount: { type: Number, required: true },
  locked_amount: { type: Number, required: true }
});

 const Worker = mongoose.model('Worker', workerSchema);
export default Worker
