
import { supabase } from "../config/supabase.js";
import { generateMcqQuestions } from "./gemini.service.js";

const DIFFICULTY_LEVELS = ["easy", "medium", "hard", "adaptive"];

export class QuizGenerationError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

function getDifficultyFromMastery(score) {
    if (score < 0.4) return "easy";
    if (score < 0.75) return "medium";
    return "hard";
}

function averageMastery(rows) {
    const assessed = (rows ?? []).filter(
        row => Number(row.attempts_count) > 0
    );

    if (!assessed.length) return null;

    const total = assessed.reduce(
        (sum, row) => sum + Number(row.score),
        0
    );

    return total / assessed.length;
}


async function resolveDifficulty({
    requestedDifficulty,
    studentId,
    courseId,
    topicId,
}) {
    if (requestedDifficulty !== "adaptive") {
        return requestedDifficulty;
    }

    // Fetch every topic in the course so we can calculate
    // course mastery even when this is a topic-specific quiz.
    const { data: courseTopics, error: topicsError } = await supabase
        .from("topics")
        .select("id")
        .eq("course_id", courseId);

    if (topicsError) throw topicsError;

    const topicIds = (courseTopics ?? []).map(topic => topic.id);

    if (!topicIds.length) return "medium";

    const { data: masteryRows, error: masteryError } = await supabase
        .from("mastery")
        .select("topic_id, score, attempts_count")
        .eq("student_id", studentId)
        .in("topic_id", topicIds);

    if (masteryError) throw masteryError;

    // For a topic quiz, prefer that topic's mastery.
    if (topicId !== null) {
        const topicMastery = masteryRows?.find(
            row => row.topic_id === topicId
        );

        if (topicMastery && Number(topicMastery.attempts_count) > 0) {
            return getDifficultyFromMastery(
                Number(topicMastery.score)
            );
        }
    }

    // For a course quiz, or an unassessed topic,
    // use the average mastery across assessed course topics.
    const courseMastery = averageMastery(masteryRows);

    return courseMastery === null
        ? "medium"
        : getDifficultyFromMastery(courseMastery);
}


function validateGeneratedQuestions(questions, topics, difficulty) {
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new QuizGenerationError(
            422,
            "EMPTY_GENERATION",
            "Gemini did not generate any questions."
        );
    }

    const topicIds = new Set(topics.map(topic => topic.id));

    const allowedDifficulties = {
        easy: [1, 2],
        medium: [3],
        hard: [4, 5],
    };

    for (const question of questions) {
        if (!topicIds.has(question.topic_id)) {
            throw new QuizGenerationError(
                422,
                "INVALID_GENERATED_TOPIC",
                "Gemini generated a question for an invalid topic."
            );
        }

        if (!allowedDifficulties[difficulty].includes(question.difficulty)) {
            throw new QuizGenerationError(
                422,
                "INVALID_GENERATED_DIFFICULTY",
                "Gemini generated a question with an unexpected difficulty."
            );
        }

        if (
            typeof question.prompt !== "string" ||
            !question.prompt.trim()
        ) {
            throw new QuizGenerationError(
                422,
                "INVALID_GENERATED_PROMPT",
                "A generated question has an invalid prompt."
            );
        }

        if (
            !Array.isArray(question.options) ||
            question.options.length !== 4 ||
            question.options.some(
                option => typeof option !== "string" || !option.trim()
            ) ||
            new Set(question.options).size !== 4
        ) {
            throw new QuizGenerationError(
                422,
                "INVALID_GENERATED_OPTIONS",
                "A generated question must have four unique options."
            );
        }

        if (
            typeof question.correct_answer !== "string" ||
            !question.options.includes(question.correct_answer)
        ) {
            throw new QuizGenerationError(
                422,
                "INVALID_GENERATED_ANSWER",
                "A generated question has an invalid correct answer."
            );
        }

        if (
            typeof question.explanation !== "string" ||
            !question.explanation.trim()
        ) {
            throw new QuizGenerationError(
                422,
                "INVALID_GENERATED_EXPLANATION",
                "A generated question has an invalid explanation."
            );
        }
    }
}

export async function generateAndSaveQuestions({
    courseName,
    topics,
    studentId,
    courseId,
    topicId = null,
    difficulty = "adaptive",
    questionCount = 10,
}) {
    if (!DIFFICULTY_LEVELS.includes(difficulty)) {
        throw new QuizGenerationError(
            400,
            "INVALID_DIFFICULTY",
            "Difficulty must be easy, medium, hard, or adaptive."
        );
    }

    const resolvedDifficulty = await resolveDifficulty({
        requestedDifficulty: difficulty,
        studentId,
        courseId,
        topicId,
    });

    const generatedQuestions = await generateMcqQuestions({
        courseName,
        topics,
        difficulty: resolvedDifficulty,
        questionCount,
    });

    if (generatedQuestions.length !== questionCount) {
        throw new QuizGenerationError(
            422,
            "INCORRECT_QUESTION_COUNT",
            `Gemini generated ${generatedQuestions.length} questions instead of ${questionCount}.`
        );
    }

    validateGeneratedQuestions(
        generatedQuestions,
        topics,
        resolvedDifficulty
    );

    const rows = generatedQuestions.map(question => ({
        topic_id: question.topic_id,
        type: "mcq",
        difficulty: question.difficulty,
        prompt: question.prompt.trim(),
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation.trim(),
        source: "generated",
    }));

    const { data, error } = await supabase
        .from("questions")
        .insert(rows)
        .select("id, topic_id, difficulty");

    if (error) throw error;

    return {
        questions: data,
        difficulty: resolvedDifficulty,
    };
}
