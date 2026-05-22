import express from "express";
import userRouter from './routes/user.route.js'
import workerRouter from "./routes/worker.route.js"
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors())

app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});



