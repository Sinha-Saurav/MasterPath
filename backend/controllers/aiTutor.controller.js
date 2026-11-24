
import { supabase } from "../config/supabase.js";
import { buildCourseMastery } from "./me.controller.js";
import { queryRag } from "../services/rag.service.js";

function getLearningLevel(score) {
  if (score === null || score === undefined) {
    return "unassessed";
  }

  if (score < 0.40) return "beginner";
  if (score < 0.75) return "developing";

  return "advanced";
}

export async function askAITutor(req, res, next) {
  try {
    const studentId = req.user.id;
    const { question, context = {} } = req.body ?? {};

    // 1. Validate question.
    if (
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_QUESTION",
          message: "Please provide a valid question.",
        },
      });
    }

    if (question.trim().length > 5000) {
      return res.status(400).json({
        error: {
          code: "QUESTION_TOO_LONG",
          message: "Question cannot exceed 5000 characters.",
        },
      });
    }

    // 2. Validate context.
    if (
      !context ||
      typeof context !== "object" ||
      Array.isArray(context)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_CONTEXT",
          message: "Context must be a JSON object.",
        },
      });
    }

    const courseId = context.course_id ?? null;
    const topicId = context.topic_id ?? null;

    const isValidId = (id) =>
      Number.isSafeInteger(Number(id)) && Number(id) > 0;

    if (courseId !== null && !isValidId(courseId)) {
      return res.status(400).json({
        error: {
          code: "INVALID_COURSE_ID",
          message: "course_id must be a positive integer or null.",
        },
      });
    }

    if (topicId !== null && !isValidId(topicId)) {
      return res.status(400).json({
        error: {
          code: "INVALID_TOPIC_ID",
          message: "topic_id must be a positive integer or null.",
        },
      });
    }

    if (topicId !== null && courseId === null) {
      return res.status(400).json({
        error: {
          code: "COURSE_REQUIRED",
          message: "A course must be selected when a topic is selected.",
        },
      });
    }

    // 3. General question: no course or topic selected.
    if (courseId === null) {
      const ragResponse = await queryRag({
        studentId,
        courseId: null,
        topicId: null,
        question: question.trim(),
        topK: 5,
        learnerContext: null,
      });

      return res.status(200).json(ragResponse);
    }

    const numericCourseId = Number(courseId);
    const numericTopicId =
      topicId === null ? null : Number(topicId);

    // 4. Verify course exists and student is enrolled.
    const [
      { data: course, error: courseError },
      { data: enrollment, error: enrollmentError },
    ] = await Promise.all([
      supabase
        .from("courses")
        .select("id, rag_course_id")
        .eq("id", numericCourseId)
        .maybeSingle(),

      supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", studentId)
        .eq("course_id", numericCourseId)
        .maybeSingle(),
    ]);

    if (courseError) throw courseError;
    if (enrollmentError) throw enrollmentError;

    if (!course) {
      return res.status(404).json({
        error: {
          code: "COURSE_NOT_FOUND",
          message: "Course not found.",
        },
      });
    }

    if (!enrollment) {
      return res.status(403).json({
        error: {
          code: "COURSE_NOT_ENROLLED",
          message: "You are not enrolled in this course.",
        },
      });
    }

    if (!course.rag_course_id) {
      throw new Error("RAG course ID is not configured.");
    }

    // 5. Get course-level mastery.
    const courseMasteryList = await buildCourseMastery(studentId);

    const selectedCourseMastery = courseMasteryList.find(
      (item) => item.course_id === numericCourseId
    );

    const courseMastery =
      selectedCourseMastery?.mastery_score ?? null;

    // 6. Get topic-level mastery if a topic is selected.
    let topicMastery = null;

    if (numericTopicId !== null) {
      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .eq("id", numericTopicId)
        .eq("course_id", numericCourseId)
        .maybeSingle();

      if (topicError) throw topicError;

      if (!topic) {
        return res.status(404).json({
          error: {
            code: "TOPIC_NOT_FOUND",
            message: "Topic does not belong to the selected course.",
          },
        });
      }

      const { data: mastery, error: masteryError } = await supabase
        .from("mastery")
        .select("score")
        .eq("student_id", studentId)
        .eq("topic_id", numericTopicId)
        .maybeSingle();

      if (masteryError) throw masteryError;

      topicMastery = mastery
        ? Number(mastery.score)
        : null;
    }

    // 7. Determine the learning level.
    // Prefer topic mastery when assessed; otherwise use course mastery.
    const relevantMastery =
      topicMastery ?? courseMastery;

    const learnerContext = {
      course_mastery: courseMastery,
      topic_mastery: topicMastery,
      learning_level: getLearningLevel(relevantMastery),
    };

    // 8. Send request to RAG.
    const ragResponse = await queryRag({
      studentId,
      courseId: course.rag_course_id,
      topicId: numericTopicId,
      question: question.trim(),
      topK: 5,
      learnerContext,
    });

    return res.status(200).json(ragResponse);

  } catch (error) {
    next(error);
  }
}
