
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

router.use(authenticate);

router.get("/", getMe);
router.patch("/", updateMe);
router.get("/courses", getMyCourses)
router.get("/dashboard", getDashboard);
router.get("/courses/:courseId/mastery", getCourseTopicMastery);

export default router;
