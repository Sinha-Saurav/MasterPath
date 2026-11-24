import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const { course, topic } = req.query;

    if (
      typeof course !== "string" ||
      typeof topic !== "string" ||
      !course.trim() ||
      !topic.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Course and topic are required",
      });
    }

    const serviceUrl = process.env.YOUTUBE_SERVICE_URL;

    if (!serviceUrl) {
      return res.status(500).json({
        success: false,
        message: "YouTube service URL is not configured",
      });
    }

    const params = new URLSearchParams({
      course: course.trim(),
      topic: topic.trim(),
    });

    const response = await fetch(
      `${serviceUrl.replace(/\/$/, "")}/api/resources/youtube?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("YouTube service error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to fetch educational videos",
    });
  }
});

export default router;