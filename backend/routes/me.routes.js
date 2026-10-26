
import { Router } from "express";
import { 
    getMe,
    updateMe,
    getDashboard,
    getCourseTopicMastery
 } from "../controllers/me.controller.js";
import { getMyCourses } from "../controllers/courses.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getMe);
router.patch("/", authenticate, updateMe);
router.get("/courses", authenticate, getMyCourses)
router.get("/dashboard", authenticate, getDashboard);
router.get("/courses/:courseId/mastery", authenticate, getCourseTopicMastery);

export default router;
