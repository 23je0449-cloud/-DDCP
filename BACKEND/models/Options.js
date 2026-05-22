// models/Option.js
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }
});

 const Option = mongoose.model('Option', optionSchema);
export default Option
