import express from "express";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import { JWT_SECRET, TOTAL_DECIMALS } from "../config.js";
import { authMiddleware } from "../middleware.js";
import { createTaskInput } from "../Validator.js";
import User  from "../models/User.js";
import  Task  from "../models/Task.js";
import  Option  from "../models/Options.js";
import  Submission  from "../models/Submittion.js";

dotenv.config();
const userRouter = express.Router();
const connection = new Connection('https://api.devnet.solana.com' || "");

const DEFAULT_TITLE = "Select the most clickable thumbnail";
const PARENT_WALLET_ADDRESS = "GNMUWomkBXrVMfZuo6MTkDd9XpZaNkaBbCCXVcYGA7Hj";

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || "",
        secretAccessKey: process.env.ACCESS_SECRET || ""
    },
    region: "us-east-1"
});

userRouter.get("/task", authMiddleware, async (req, res) => {
    const taskId = req.query.taskId;
    const userId = req.userId;

    const task = await Task.findOne({
        _id: taskId,
        user_id: userId
    }).populate("options");

    if (!task) {
        return res.status(411).json({ message: "You don't have access to this task" });
    }

    const submissions = await Submission.find({ task_id: taskId }).populate("option_id");

    const result = {};
    task.options.forEach(option => {
        result[option._id] = {
            count: 0,
            option: {
                imageUrl: option.image_url
            }
        };
    });

    submissions.forEach(s => {
        const key = s.option_id._id.toString();
        if (result[key]) result[key].count += 1;
    });

    res.json({ result, taskDetails: task });
});

userRouter.post("/task", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const body = req.body;
    const parsed = createTaskInput.safeParse(body);

    if (!parsed.success) {
        return res.status(411).json({ message: "You've sent the wrong inputs" });
    }

    const user = await User.findById(userId);
    const tx = await connection.getTransaction(parsed.data.signature, {
        maxSupportedTransactionVersion: 1
    });

    if ((tx?.meta?.postBalances[1] ?? 0) - (tx?.meta?.preBalances[1] ?? 0) !== 100_000_000) {
        return res.status(411).json({ message: "Transaction signature/amount incorrect" });
    }

    if (tx?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
        return res.status(411).json({ message: "Transaction sent to wrong address" });
    }

    if (tx?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
        return res.status(411).json({ message: "Transaction not sent from your wallet" });
    }

    const session = await Task.startSession();
    let createdTask;

    try {
        await session.withTransaction(async () => {
            createdTask = await Task.create([{
                title: parsed.data.title || DEFAULT_TITLE,
                amount: 0.1 * TOTAL_DECIMALS,
                signature: parsed.data.signature,
                user_id: userId
            }], { session });

            const taskId = createdTask[0]._id;
            const optionsData = parsed.data.options.map(opt => ({
                image_url: opt.imageUrl,
                task_id: taskId
            }));

            await Option.insertMany(optionsData, { session });
        });

        res.json({ id: createdTask[0]._id });
    } catch (err) {
        res.status(500).json({ message: "Error creating task" });
    } finally {
        await session.endSession();
    }
});

userRouter.get("/presignedUrl", authMiddleware, async (req, res) => {
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: 'hkirat-cms',
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ['content-length-range', 0, 5 * 1024 * 1024]
        ],
        Expires: 3600
    });

    res.json({ preSignedUrl: url, fields });
});

userRouter.post("/signin", async (req, res) => {
    const { publicKey, signature } = req.body;
    const message = new TextEncoder().encode("Sign into mechanical turks");

    const verified = nacl.sign.detached.verify(
        message,
        new Uint8Array(signature.data),
        new PublicKey(publicKey).toBytes()
    );

    if (!verified) {
        return res.status(411).json({ message: "Incorrect signature" });
    }

    let user = await User.findOne({ address: publicKey });

    if (!user) {
        user = await User.create({ address: publicKey });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
});

export default userRouter
