// models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  option_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  amount: { type: String, required: true }
});

 const Submittion = mongoose.model('Submission', submissionSchema);
export default Submittion
