import express from "express";
import nacl from "tweetnacl";
import jwt from "jsonwebtoken";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import dotenv from "dotenv";
import { workerMiddleware } from "../middleware.js";
import { TOTAL_DECIMALS, WORKER_JWT_SECRET } from "../config.js";
import { getNextTask } from "../db.js";
import { createSubmissionInput } from "../Validator.js";
import  Worker  from "../models/Workers.js";
import  Submission from "../models/Submittion.js";
import { Payout } from "../models/Payout.js";
import { privateKey } from "../PrivateKey.js";
dotenv.config();
const router = express.Router();
const connection = new Connection('https://api.devnet.solana.com' || "");
const TOTAL_SUBMISSIONS = 100;

router.post("/payout", workerMiddleware, async (req, res) => {
    const userId = req.userId;
    const worker = await Worker.findById(userId);

    if (!worker) {
        return res.status(403).json({ message: "User not found" });
    }

    const lamports = 1_000_000_000 * worker.pending_amount / TOTAL_DECIMALS;
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: new PublicKey("GNMUWomkBXrVMfZuo6MTkDd9XpZaNkaBbCCXVcYGA7Hj"),
            toPubkey: new PublicKey(worker.address),
            lamports
        })
    );

    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    let signature = "";

    try {
        signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
    } catch (e) {
        return res.json({ message: "Transaction failed" });
    }

    try {
        await Worker.findByIdAndUpdate(userId, {
            $inc: {
                pending_amount: -worker.pending_amount,
                locked_amount: worker.pending_amount
            }
        });

        await Payout.create({
            user_id: worker._id,
            amount: worker.pending_amount,
            status: "Processing",
            signature
        });

        res.json({
            message: "Processing payout",
            amount: worker.pending_amount
        });
    } catch (e) {
        res.status(500).json({ message: "Error during payout update" });
    }
});

router.get("/balance", workerMiddleware, async (req, res) => {
    const worker = await Worker.findById(req.userId);
    res.json({
        pendingAmount: worker?.pending_amount,
        lockedAmount: worker?.locked_amount
    });
});

router.post("/submission", workerMiddleware, async (req, res) => {
    const userId = req.userId;
    const parsedBody = createSubmissionInput.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const task = await getNextTask(userId);
    if (!task || task.id.toString() !== parsedBody.data.taskId) {
        return res.status(411).json({ message: "Incorrect task id" });
    }

    const amount = (Number(task.amount) / TOTAL_SUBMISSIONS);

    try {
        const submission = await Submission.create({
            option_id: parsedBody.data.selection,
            worker_id: userId,
            task_id: parsedBody.data.taskId,
            amount
        });

        await Worker.findByIdAndUpdate(userId, {
            $inc: { pending_amount: amount }
        });

        const nextTask = await getNextTask(userId);
        res.json({ nextTask, amount });
    } catch (e) {
        res.status(500).json({ message: "Submission failed" });
    }
});

router.get("/nextTask", workerMiddleware, async (req, res) => {
    const task = await getNextTask(req.userId);
    if (!task) {
        res.status(411).json({ message: "No more tasks left for you to review" });
    } else {
        res.json({ task });
    }
});

router.post("/signin", async (req, res) => {
    const { publicKey, signature } = req.body;
    const message = new TextEncoder().encode("Sign into mechanical turks as a worker");

    const verified = nacl.sign.detached.verify(
        message,
        new Uint8Array(signature.data),
        new PublicKey(publicKey).toBytes()
    );

    if (!verified) {
        return res.status(411).json({ message: "Incorrect signature" });
    }

    let worker = await Worker.findOne({ address: publicKey });

    if (!worker) {
        worker = await Worker.create({
            address: publicKey,
            pending_amount: 0,
            locked_amount: 0
        });
    }

    const token = jwt.sign({ userId: worker._id }, WORKER_JWT_SECRET);
    res.json({
        token,
        amount: worker.pending_amount / TOTAL_DECIMALS
    });
});

export default router
