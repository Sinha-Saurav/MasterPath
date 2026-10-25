
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    getCourses,
    getCourseTopics,
    enrollInCourse,
} from "../controllers/courses.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getCourses);
router.get("/:id/topics", getCourseTopics);
router.post("/:id/enroll", enrollInCourse);

export default router;
