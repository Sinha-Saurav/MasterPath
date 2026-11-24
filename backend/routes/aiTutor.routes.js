
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { askAITutor } from "../controllers/aiTutor.controller.js";

const router = Router();

router.use(authenticate);

router.post("/query", askAITutor);

export default router;
