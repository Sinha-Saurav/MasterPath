
import { Router } from "express";
import { 
    getMe,
    updateMe,
 } from "../controllers/me.controller.js";
import { getMyCourses } from "../controllers/courses.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getMe);
router.patch("/", authenticate, updateMe);
router.get("/courses", authenticate, getMyCourses)

export default router;
