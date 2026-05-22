import Task from "./models/Task.js";
import Submittion from "./models/Submittion.js";
import mongoose from "mongoose";

export const getNextTask = async (userId) => {
  // Step 1: Get all task IDs already submitted by this worker
  const submittedTaskIds = await Submittion.distinct("task_id", { worker_id: mongoose.Types.ObjectId(userId) });

  // Step 2: Find a task that is not done and not in submittedTaskIds
  const task = await Task.findOne({
    done: false,
    _id: { $nin: submittedTaskIds }
  }).populate("options").lean();

  return task;
};


