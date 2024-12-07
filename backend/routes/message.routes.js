import express from "express";
import isAauthenticated from "../middlewares/isAuthenticated.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";
const router = express.Router();

router.post("/send/:id", isAauthenticated, sendMessage);
router.post("/send/:id", isAauthenticated, getMessage);

export default router;
