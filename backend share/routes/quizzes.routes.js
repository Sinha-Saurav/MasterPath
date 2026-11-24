
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  startQuiz,
  getQuiz,
  saveQuizAnswer,
  finishQuiz,
  getQuizResults,
} from "../controllers/quizzes.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", startQuiz);
router.get("/:id", getQuiz);
router.put("/:id/answers/:questionId", saveQuizAnswer);
router.post("/:id/finish", finishQuiz);
router.get("/:id/results", getQuizResults);

export default router;
