// models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, default: 'Select the most clickable thumbnail' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  signature: { type: String, required: true },
  amount: { type: String, required: true }
});

 const Task= mongoose.model('Task', taskSchema);
export default Task
