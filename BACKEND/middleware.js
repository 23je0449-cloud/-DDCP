import jwt from 'jsonwebtoken'
import { JWT_SECRET,WORKER_JWT_SECRET,TOTAL_DECIMALS } from './config.js';

export const authMiddleware=(req, res, next)=> {
    const authHeader = req.headers["authorization"] || "";

    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET);

        if (decoded && decoded.userId) {
            req.userId = decoded.userId; // Attach user ID to request
            return next();
        } else {
            return res.status(403).json({ message: "You are not logged in" });
        }
    } catch (e) {
        return res.status(403).json({ message: "You are not logged in" });
    }
}

export const  workerMiddleware=(req, res, next)=> {
    const authHeader = req.headers["authorization"] || "";

    try {
        const decoded = jwt.verify(authHeader, WORKER_JWT_SECRET);

        if (decoded && decoded.userId) {
            req.userId = decoded.userId;
            return next();
        } else {
            return res.status(403).json({ message: "You are not logged in" });
        }
    } catch (e) {
        return res.status(403).json({ message: "You are not logged in" });
    }
}


