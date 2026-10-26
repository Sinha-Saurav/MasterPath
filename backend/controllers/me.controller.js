
import { supabase } from "../config/supabase.js";

export async function getMe(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, branch, semester")
      .eq("id", req.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "Profile not found",
          },
        });
      }

      throw error;
    }

    return res.json(data);
  } catch (error) {
    next(error);
  }
}


export async function updateMe(req, res, next) {
  try {

    if (
      req.body === null ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST_BODY",
          message: "Request body must be a JSON object.",
        },
      });
    }

    const allowedFields = ["full_name", "branch", "semester"];
    const updates = { ...req.body };

    // 1. Validate the request body.
    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST_BODY",
          message: "Request body must be a JSON object.",
        },
      });
    }

    // 2. Reject empty request bodies.
    const fields = Object.keys(updates);

    if (fields.length === 0) {
      return res.status(400).json({
        error: {
          code: "EMPTY_UPDATE",
          message: "Provide at least one field to update.",
        },
      });
    }

    // 3. Reject unsupported fields.
    const invalidFields = fields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: {
          code: "INVALID_FIELDS",
          message: `These fields cannot be updated: ${invalidFields.join(", ")}`,
        },
      });
    }

    // 4. Validate full_name and branch.
    for (const field of ["full_name", "branch"]) {
      if (field in updates) {
        if (
          typeof updates[field] !== "string" ||
          updates[field].trim().length === 0
        ) {
          return res.status(400).json({
            error: {
              code: "INVALID_FIELD",
              message: `${field} must be a non-empty string.`,
            },
          });
        }

        // Trim unnecessary whitespace.
        updates[field] = updates[field].trim();
      }
    }

    // 5. Validate semester.
    if ("semester" in updates) {
      if (
        !Number.isInteger(updates.semester) ||
        updates.semester < 1 ||
        updates.semester > 8
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_SEMESTER",
            message: "Semester must be an integer between 1 and 8.",
          },
        });
      }
    }

    // 6. Update only the authenticated student's profile.
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select("id, full_name, role, branch, semester")
      .maybeSingle();

    if (error) {
      return next(error);
    }

    // 7. Handle a profile that does not exist.
    if (!data) {
      return res.status(404).json({
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Student profile was not found.",
        },
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}


async function buildCourseMastery(studentId) {
  // Get the courses this student is enrolled in.
  const { data: enrollments, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", studentId);

  if (enrollmentError) throw enrollmentError;

  const courseIds = (enrollments ?? []).map((item) => item.course_id);

  if (courseIds.length === 0) return [];

  // Get course details and their topics.
  const [
    { data: courses, error: courseError },
    { data: topics, error: topicError },
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, name")
      .in("id", courseIds),

    supabase
      .from("topics")
      .select("id, course_id, name, unit")
      .in("course_id", courseIds),
  ]);

  if (courseError) throw courseError;
  if (topicError) throw topicError;

  const topicList = topics ?? [];
  const topicIds = topicList.map((topic) => topic.id);

  // Fetch only this student's mastery records.
  let masteryRecords = [];

  if (topicIds.length > 0) {
    const { data, error } = await supabase
      .from("mastery")
      .select("topic_id, score, confidence, attempts_count")
      .eq("student_id", studentId)
      .in("topic_id", topicIds);

    if (error) throw error;

    masteryRecords = data ?? [];
  }

  const masteryByTopic = new Map(
    masteryRecords.map((record) => [record.topic_id, record])
  );

  // Aggregate assessed topics into course-level mastery.
  return (courses ?? []).map((course) => {
    const courseTopics = topicList.filter(
      (topic) => topic.course_id === course.id
    );

    const assessedTopics = courseTopics
      .map((topic) => ({
        topic,
        mastery: masteryByTopic.get(topic.id),
      }))
      .filter(({ mastery }) => mastery != null);

    const weightedScore = assessedTopics.reduce((sum, item) => {
      const confidence = Number(item.mastery.confidence);
      const weight = Number.isFinite(confidence) && confidence > 0
        ? confidence
        : 0;

      return sum + Number(item.mastery.score) * weight;
    }, 0);

    const totalWeight = assessedTopics.reduce((sum, item) => {
      const confidence = Number(item.mastery.confidence);
      return sum + (
        Number.isFinite(confidence) && confidence > 0 ? confidence : 0
      );
    }, 0);

    return {
      course_id: course.id,
      course_code: course.code,
      course_name: course.name,
      mastery_score:
        totalWeight > 0
          ? Number((weightedScore / totalWeight).toFixed(3))
          : null,
      topics_assessed: assessedTopics.length,
      total_topics: courseTopics.length,
    };
  });
}

export async function getCourseTopicMastery(req, res, next) {
  try {
    const studentId = req.user.id;
    const courseId = Number(req.params.courseId);

    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        error: {
          code: "INVALID_COURSE_ID",
          message: "courseId must be a positive integer.",
        },
      });
    }

    // Verify the student is enrolled in this course.
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (enrollmentError) throw enrollmentError;

    if (!enrollment) {
      return res.status(403).json({
        error: {
          code: "COURSE_NOT_ENROLLED",
          message: "You are not enrolled in this course.",
        },
      });
    }

    const [
      { data: course, error: courseError },
      { data: topics, error: topicError },
    ] = await Promise.all([
      supabase
        .from("courses")
        .select("id, code, name")
        .eq("id", courseId)
        .maybeSingle(),

      supabase
        .from("topics")
        .select("id, name, unit, position")
        .eq("course_id", courseId)
        .order("position", { ascending: true }),
    ]);

    if (courseError) throw courseError;
    if (topicError) throw topicError;

    if (!course) {
      return res.status(404).json({
        error: {
          code: "COURSE_NOT_FOUND",
          message: "Course not found.",
        },
      });
    }

    const topicList = topics ?? [];
    const topicIds = topicList.map((topic) => topic.id);

    let masteryRecords = [];

    if (topicIds.length > 0) {
      const { data, error } = await supabase
        .from("mastery")
        .select(
          "topic_id, score, confidence, attempts_count, correct_count, updated_at"
        )
        .eq("student_id", studentId)
        .in("topic_id", topicIds);

      if (error) throw error;

      masteryRecords = data ?? [];
    }

    const masteryByTopic = new Map(
      masteryRecords.map((record) => [record.topic_id, record])
    );

    const topicMastery = topicList.map((topic) => {
      const record = masteryByTopic.get(topic.id);

      return {
        topic_id: topic.id,
        topic_name: topic.name,
        unit: topic.unit,
        mastery_score: record ? Number(record.score) : null,
        confidence: record ? Number(record.confidence) : null,
        attempts_count: record ? record.attempts_count : 0,
        correct_count: record ? record.correct_count : 0,
        assessed: Boolean(record),
        updated_at: record?.updated_at ?? null,
      };
    });

    return res.status(200).json({
      course,
      topics: topicMastery,
    });
  } catch (error) {
    next(error);
  }
}


export async function getDashboard(req, res, next) {
  try {
    const studentId = req.user.id;

    // 1. Get all completed quizzes belonging to this student.
    const { data: quizzes, error: quizError } = await supabase
      .from("quizzes")
      .select("id, course_id, topic_id, created_at, finished_at")
      .eq("student_id", studentId)
      .eq("status", "finished")
      .order("finished_at", { ascending: false });

    if (quizError) throw quizError;

    const completedQuizzes = quizzes ?? [];
    const quizIds = completedQuizzes.map((quiz) => quiz.id);

    // 2. Fetch assigned questions and saved answers.
    let assignments = [];
    let attempts = [];

    if (quizIds.length > 0) {
      const [
        { data: assignmentData, error: assignmentError },
        { data: attemptData, error: attemptError },
      ] = await Promise.all([
        supabase
          .from("quiz_questions")
          .select("quiz_id, question_id")
          .in("quiz_id", quizIds),

        supabase
          .from("attempts")
          .select("quiz_id, question_id, is_correct")
          .eq("student_id", studentId)
          .in("quiz_id", quizIds),
      ]);

      if (assignmentError) throw assignmentError;
      if (attemptError) throw attemptError;

      assignments = assignmentData ?? [];
      attempts = attemptData ?? [];
    }

    // 3. Calculate statistics for each completed quiz.
    const attemptsByQuiz = new Map();

    for (const attempt of attempts) {
      if (!attemptsByQuiz.has(attempt.quiz_id)) {
        attemptsByQuiz.set(attempt.quiz_id, []);
      }

      attemptsByQuiz.get(attempt.quiz_id).push(attempt);
    }

    const assignmentsByQuiz = new Map();

    for (const assignment of assignments) {
      if (!assignmentsByQuiz.has(assignment.quiz_id)) {
        assignmentsByQuiz.set(assignment.quiz_id, []);
      }

      assignmentsByQuiz
        .get(assignment.quiz_id)
        .push(assignment);
    }

    const recentQuizzes = completedQuizzes.map((quiz) => {
      const quizAssignments = assignmentsByQuiz.get(quiz.id) ?? [];
      const quizAttempts = attemptsByQuiz.get(quiz.id) ?? [];

      const correctAnswers = quizAttempts.filter(
        (attempt) => attempt.is_correct === true
      ).length;

      const totalQuestions = quizAssignments.length;
      const answeredQuestions = quizAttempts.length;

      return {
        quiz_id: quiz.id,
        course_id: quiz.course_id,
        topic_id: quiz.topic_id,
        created_at: quiz.created_at,
        finished_at: quiz.finished_at,
        total_questions: totalQuestions,
        answered_questions: answeredQuestions,
        correct_answers: correctAnswers,
        percentage:
          totalQuestions > 0
            ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2))
            : 0,
      };
    });

    // 4. Calculate overall summary statistics.
    const totalQuestionsAssigned = recentQuizzes.reduce(
      (sum, quiz) => sum + quiz.total_questions,
      0
    );

    const totalQuestionsAnswered = recentQuizzes.reduce(
      (sum, quiz) => sum + quiz.answered_questions,
      0
    );

    const totalCorrectAnswers = recentQuizzes.reduce(
      (sum, quiz) => sum + quiz.correct_answers,
      0
    );

    const totalQuizPercentage = recentQuizzes.reduce(
      (sum, quiz) => sum + quiz.percentage,
      0
    );

    // 7. Calculate course-wise mastery.
    const courseMastery = await buildCourseMastery(studentId);

    // 8. Return dashboard.
    return res.status(200).json({
      summary: {
        quizzes_completed: completedQuizzes.length,
        average_score:
          completedQuizzes.length > 0
            ? Number(
              (totalQuizPercentage / completedQuizzes.length).toFixed(2)
            )
            : 0,
        questions_answered: totalQuestionsAnswered,
        overall_accuracy:
          totalQuestionsAssigned > 0
            ? Number(
              (
                (totalCorrectAnswers / totalQuestionsAssigned) *
                100
              ).toFixed(2)
            )
            : 0,
      },
      recent_quizzes: recentQuizzes.slice(0, 5),
      course_mastery: courseMastery,
    });
  } catch (error) {
    next(error);
  }
}


