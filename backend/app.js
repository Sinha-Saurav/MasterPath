
import "dotenv/config";
import express from "express";
import cors from "cors";

import meRoutes from "./routes/me.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import authRoutes from "./routes/auth.routes.js";
import quizzesRoutes from "./routes/quizzes.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/me", meRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizzesRoutes);

// Centralized error handler — keep this after all routes.
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
});

export default app;
