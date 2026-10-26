
import { supabase } from "../config/supabase.js";
import { getQuizQuestions } from "../services/quizQuestion.service.js";

const MAX_QUESTIONS = 20;

function isPositiveInteger(value) {
    return Number.isSafeInteger(value) && value > 0;
}

function sendError(res, status, code, message) {
    return res.status(status).json({
        error: { code, message },
    });
}

async function getOwnedQuiz(quizId, studentId) {
    return supabase
        .from("quizzes")
        .select("id, student_id, course_id, topic_id, status, created_at, finished_at")
        .eq("id", quizId)
        .eq("student_id", studentId)
        .maybeSingle();
}

async function isEnrolled(studentId, courseId) {
    const { data, error } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .maybeSingle();

    if (error) throw error;
    return Boolean(data);
}

async function getQuizQuestionsWithAnswers(quizId) {
    return supabase
        .from("quiz_questions")
        .select(`
      question_id,
      position,
      questions (
        id, topic_id, type, difficulty, prompt,
        options, correct_answer, explanation
      )
    `)
        .eq("quiz_id", quizId)
        .order("position", { ascending: true });
}

// POST /api/quizzes
export async function startQuiz(req, res, next) {
    try {
        const { course_id, topic_id = null, question_count = 10 } = req.body ?? {};

        if (!isPositiveInteger(course_id)) {
            return sendError(res, 400, "INVALID_COURSE_ID",
                "course_id must be a positive integer.");
        }

        if (topic_id !== null && !isPositiveInteger(topic_id)) {
            return sendError(res, 400, "INVALID_TOPIC_ID",
                "topic_id must be a positive integer or null.");
        }

        if (!isPositiveInteger(question_count) || question_count > MAX_QUESTIONS) {
            return sendError(res, 400, "INVALID_QUESTION_COUNT",
                `question_count must be between 1 and ${MAX_QUESTIONS}.`);
        }

        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id")
            .eq("id", course_id)
            .maybeSingle();

        if (courseError) return next(courseError);

        if (!course) {
            return sendError(res, 404, "COURSE_NOT_FOUND",
                "Course not found.");
        }

        if (!(await isEnrolled(req.user.id, course_id))) {
            return sendError(res, 403, "COURSE_ENROLLMENT_REQUIRED",
                "Enroll in this course before starting a quiz.");
        }

        if (topic_id !== null) {
            const { data: topic, error: topicError } = await supabase
                .from("topics")
                .select("id")
                .eq("id", topic_id)
                .eq("course_id", course_id)
                .maybeSingle();

            if (topicError) return next(topicError);

            if (!topic) {
                return sendError(res, 404, "TOPIC_NOT_FOUND",
                    "Topic not found in this course.");
            }
        }

        // Resume an existing unfinished quiz for the same scope.
        let existingQuery = supabase
            .from("quizzes")
            .select("id, course_id, topic_id, status, created_at")
            .eq("student_id", req.user.id)
            .eq("course_id", course_id)
            .eq("status", "in_progress");

        existingQuery = topic_id === null
            ? existingQuery.is("topic_id", null)
            : existingQuery.eq("topic_id", topic_id);

        const { data: existing, error: existingError } =
            await existingQuery.order("created_at", { ascending: false }).limit(1);

        if (existingError) return next(existingError);

        if (existing?.length) {
            return res.status(200).json({
                resumed: true,
                quiz: existing[0],
            });
        }

        const questions = await getQuizQuestions({
            courseId: course_id,
            topicId: topic_id,
            studentId: req.user.id,
            questionCount: question_count,
        });

        if (!questions.length) {
            return sendError(res, 422, "NO_QUESTIONS_AVAILABLE",
                "No eligible MCQs are available for this selection.");
        }

        // The question bank uses string options and correct_answer values.
        const validQuestions = questions.filter(q =>
            q.type === "mcq" &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            typeof q.correct_answer === "string" &&
            q.options.includes(q.correct_answer)
        );

        if (!validQuestions.length) {
            return sendError(res, 422, "INVALID_QUESTION_BANK",
                "No questions have a valid MCQ answer format.");
        }

        const { data: quiz, error: quizError } = await supabase
            .from("quizzes")
            .insert({
                student_id: req.user.id,
                course_id,
                topic_id,
                status: "in_progress",
            })
            .select("id, course_id, topic_id, status, created_at")
            .single();

        if (quizError) return next(quizError);

        const assignments = validQuestions.map((q, index) => ({
            quiz_id: quiz.id,
            question_id: q.id,
            position: index + 1,
        }));

        const { error: assignmentError } = await supabase
            .from("quiz_questions")
            .insert(assignments);

        if (assignmentError) {
            // Avoid leaving an empty quiz if assignment insertion fails.
            await supabase.from("quizzes").delete().eq("id", quiz.id);
            return next(assignmentError);
        }

        return res.status(201).json({
            resumed: false,
            quiz,
            question_count: validQuestions.length,
        });
    } catch (error) {
        return next(error);
    }
}

// GET /api/quizzes/:id
export async function getQuiz(req, res, next) {
    try {
        const { data: quiz, error } =
            await getOwnedQuiz(req.params.id, req.user.id);

        if (error) return next(error);
        if (!quiz) return sendError(res, 404, "QUIZ_NOT_FOUND", "Quiz not found.");

        if (!(await isEnrolled(req.user.id, quiz.course_id))) {
            return sendError(res, 403, "COURSE_ENROLLMENT_REQUIRED",
                "You must be enrolled to access this quiz.");
        }

        const { data: assignments, error: assignmentsError } =
            await getQuizQuestionsWithAnswers(quiz.id);

        if (assignmentsError) return next(assignmentsError);

        const { data: attempts, error: attemptsError } = await supabase
            .from("attempts")
            .select("question_id, answer, time_taken_sec")
            .eq("quiz_id", quiz.id)
            .eq("student_id", req.user.id);

        if (attemptsError) return next(attemptsError);

        const savedAnswers = new Map(
            (attempts ?? []).map(a => [String(a.question_id), a])
        );

        return res.json({
            quiz,
            questions: (assignments ?? []).map(item => {
                const q = item.questions;
                const saved = savedAnswers.get(String(item.question_id));

                return {
                    id: q.id,
                    topic_id: q.topic_id,
                    position: item.position,
                    type: q.type,
                    difficulty: q.difficulty,
                    prompt: q.prompt,
                    options: q.options,
                    answer: saved?.answer ?? null,
                    time_taken_sec: saved?.time_taken_sec ?? null,
                };
            }),
        });
    } catch (error) {
        return next(error);
    }
}

// PUT /api/quizzes/:id/answers/:questionId
export async function saveQuizAnswer(req, res, next) {
    try {
        const { data: quiz, error } =
            await getOwnedQuiz(req.params.id, req.user.id);

        if (error) return next(error);
        if (!quiz) return sendError(res, 404, "QUIZ_NOT_FOUND", "Quiz not found.");

        if (quiz.status !== "in_progress") {
            return sendError(res, 409, "QUIZ_ALREADY_FINISHED",
                "Answers cannot be changed after submission.");
        }

        if (!(await isEnrolled(req.user.id, quiz.course_id))) {
            return sendError(res, 403, "COURSE_ENROLLMENT_REQUIRED",
                "You must be enrolled to answer quiz questions.");
        }

        const questionId = Number(req.params.questionId);
        if (!isPositiveInteger(questionId)) {
            return sendError(res, 400, "INVALID_QUESTION_ID",
                "Question ID must be a positive integer.");
        }

        const { answer, time_taken_sec = null } = req.body ?? {};

        if (typeof answer !== "string" || !answer.trim()) {
            return sendError(res, 400, "INVALID_ANSWER",
                "answer must be a non-empty string.");
        }

        if (time_taken_sec !== null &&
            (!Number.isSafeInteger(time_taken_sec) || time_taken_sec < 0)) {
            return sendError(res, 400, "INVALID_TIME",
                "time_taken_sec must be a non-negative integer or null.");
        }

        const { data: assignment, error: assignmentError } =
            await supabase
                .from("quiz_questions")
                .select("question_id")
                .eq("quiz_id", quiz.id)
                .eq("question_id", questionId)
                .maybeSingle();

        if (assignmentError) return next(assignmentError);

        if (!assignment) {
            return sendError(res, 404, "QUESTION_NOT_IN_QUIZ",
                "This question does not belong to the quiz.");
        }

        const { data: question, error: questionError } = await supabase
            .from("questions")
            .select("topic_id, difficulty, options")
            .eq("id", questionId)
            .single();

        if (questionError) return next(questionError);

        if (!Array.isArray(question.options) ||
            !question.options.includes(answer)) {
            return sendError(res, 400, "INVALID_OPTION",
                "Select one of the available options.");
        }

        const attemptData = {
            student_id: req.user.id,
            question_id: questionId,
            quiz_id: quiz.id,
            mode: "quiz",
            topic_id: question.topic_id,
            difficulty: question.difficulty,
            answer,
            time_taken_sec,
            is_correct: null,
            score: null,
            feedback: null,
        };

        // Update an existing answer, or insert it for the first time.
        const { data: saved, error: saveError } = await supabase
            .from("attempts")
            .upsert(attemptData, {
                onConflict: "quiz_id,question_id",
            })
            .select("id, question_id, answer")
            .single();

        if (saveError) return next(saveError);

        return res.status(200).json({
            saved: true,
            attempt: saved,
        });
    } catch (error) {
        return next(error);
    }
}

// POST /api/quizzes/:id/finish

export async function finishQuiz(req, res, next) {
    try {
        const quizId = req.params.id;
        const studentId = req.user.id;

        const { data, error } = await supabase.rpc(
            "finish_quiz_transaction",
            {
                p_quiz_id: quizId,
                p_student_id: studentId,
            }
        );

        if (error) {
            if (error.message.includes("QUIZ_NOT_FOUND")) {
                return sendError(
                    res, 404, "QUIZ_NOT_FOUND", "Quiz not found."
                );
            }

            if (error.message.includes("COURSE_ENROLLMENT_REQUIRED")) {
                return sendError(
                    res, 403, "COURSE_ENROLLMENT_REQUIRED",
                    "You must be enrolled to finish this quiz."
                );
            }

            if (error.message.includes("INVALID_QUIZ_STATUS")) {
                return sendError(
                    res, 409, "INVALID_QUIZ_STATUS",
                    "This quiz cannot be finished in its current state."
                );
            }

            return next(error);
        }

        return res.json(data);
    } catch (error) {
        return next(error);
    }
}


// GET /api/quizzes/:id/results
export async function getQuizResults(req, res, next) {
    try {
        const { data: quiz, error } =
            await getOwnedQuiz(req.params.id, req.user.id);

        if (error) return next(error);
        if (!quiz) return sendError(res, 404, "QUIZ_NOT_FOUND", "Quiz not found.");

        if (quiz.status !== "finished") {
            return sendError(res, 409, "QUIZ_NOT_FINISHED",
                "Submit the quiz before viewing results.");
        }

        if (!(await isEnrolled(req.user.id, quiz.course_id))) {
            return sendError(res, 403, "COURSE_ENROLLMENT_REQUIRED",
                "You must be enrolled to view quiz results.");
        }

        const { data: assignments, error: assignmentsError } =
            await getQuizQuestionsWithAnswers(quiz.id);

        if (assignmentsError) return next(assignmentsError);

        const { data: attempts, error: attemptsError } = await supabase
            .from("attempts")
            .select("question_id, answer, is_correct, score, feedback")
            .eq("quiz_id", quiz.id)
            .eq("student_id", req.user.id);

        if (attemptsError) return next(attemptsError);

        const attemptMap = new Map(
            (attempts ?? []).map(a => [String(a.question_id), a])
        );

        const results = (assignments ?? []).map(item => {
            const q = item.questions;
            const attempt = attemptMap.get(String(q.id));

            return {
                question_id: q.id,
                position: item.position,
                prompt: q.prompt,
                options: q.options,
                answer: attempt?.answer ?? null,
                correct_answer: q.correct_answer,
                is_correct: attempt?.is_correct ?? false,
                explanation: q.explanation,
                feedback: attempt?.feedback ?? "Not answered.",
            };
        });

        const total = results.length;
        const correct = results.filter(q => q.is_correct).length;

        return res.json({
            quiz_id: quiz.id,
            status: quiz.status,
            total_questions: total,
            answered_questions: attempts?.length ?? 0,
            correct_answers: correct,
            percentage: total ? Number((correct / total * 100).toFixed(2)) : 0,
            results,
        });
    } catch (error) {
        return next(error);
    }
}
