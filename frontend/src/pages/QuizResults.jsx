
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiArrowLeft,
    FiRotateCcw,
    FiBookOpen,
    FiAward,
} from "react-icons/fi";
import api from "../services/api";

function StatCard({ icon: Icon, label, value, style }) {
    return (
        <div className="rounded-card border border-border bg-surface p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style}`}>
                <Icon size={19} />
            </div>
            <p className="mt-4 font-heading text-2xl font-bold text-foreground">
                {value}
            </p>
            <p className="mt-1 text-sm text-muted">{label}</p>
        </div>
    );
}

function getPerformanceLabel(score) {
    if (score >= 90) return "Excellent work!";
    if (score >= 75) return "Great performance!";
    if (score >= 60) return "Good effort!";
    if (score >= 40) return "Keep practicing!";
    return "Room for improvement";
}

export default function QuizResults() {
    const navigate = useNavigate();
    const { quizId } = useParams();

    const [result, setResult] = useState(null);
    const [courseName, setCourseName] = useState("");
    const [topicName, setTopicName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // FETCH PERSISTED RESULTS
    // --------------------------------------------------

    useEffect(() => {
        let active = true;

        async function fetchResults() {
            try {
                setLoading(true);
                setError("");

                const [resultsResponse, quizResponse] = await Promise.all([
                    api.get(`/quizzes/${quizId}/results`),
                    api.get(`/quizzes/${quizId}`),
                ]);

                if (!active) return;

                const resultsData = resultsResponse.data;
                const quizData = quizResponse.data?.quiz;

                if (
                    !resultsData ||
                    !Array.isArray(resultsData.results)
                ) {
                    throw new Error("Invalid results returned by the server.");
                }

                if (resultsData.status !== "finished") {
                    throw new Error(
                        "This quiz has not been submitted yet."
                    );
                }

                setResult(resultsData);

                // Resolve course and topic names for the page heading.
                try {
                    const [coursesResponse, topicsResponse] =
                        await Promise.all([
                            api.get("/courses"),
                            api.get(
                                `/courses/${quizData.course_id}/topics`
                            ),
                        ]);

                    if (!active) return;

                    const courses = coursesResponse.data;
                    const topics = topicsResponse.data;

                    const course = Array.isArray(courses)
                        ? courses.find(
                              (item) =>
                                  String(item.id) ===
                                  String(quizData.course_id)
                          )
                        : null;

                    const topic = Array.isArray(topics)
                        ? topics.find(
                              (item) =>
                                  String(item.id) ===
                                  String(quizData.topic_id)
                          )
                        : null;

                    setCourseName(
                        course?.name ||
                            `Course ${quizData.course_id}`
                    );

                    setTopicName(
                        quizData.topic_id
                            ? topic?.name ||
                                  `Topic ${quizData.topic_id}`
                            : "All course topics"
                    );
                } catch {
                    if (!active) return;

                    setCourseName(
                        `Course ${quizData.course_id}`
                    );

                    setTopicName(
                        quizData.topic_id
                            ? `Topic ${quizData.topic_id}`
                            : "All course topics"
                    );
                }
            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.error?.message ||
                        err.message ||
                        "Unable to load quiz results."
                );
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchResults();

        return () => {
            active = false;
        };
    }, [quizId]);

    // --------------------------------------------------
    // LOADING STATE
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-app">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
                    <p className="mt-4 text-sm text-muted">
                        Loading your results...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR STATE
    // --------------------------------------------------

    if (error || !result) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-app px-4">
                <div className="max-w-md rounded-panel border border-border bg-surface p-8 text-center">
                    <FiAlertCircle
                        className="mx-auto text-warning"
                        size={32}
                    />

                    <h1 className="mt-4 font-heading text-xl font-bold text-foreground">
                        Results unavailable
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted">
                        {error || "We couldn't find this quiz attempt."}
                    </p>

                    <button
                        onClick={() => navigate("/quizzes")}
                        className="mt-5 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
                    >
                        Back to quizzes
                    </button>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // RESULT CALCULATIONS
    // --------------------------------------------------

    const questions = result.results;

    const totalQuestions = result.total_questions;
    const answeredCount = result.answered_questions;
    const correctCount = result.correct_answers;

    const incorrectCount = Math.max(
        0,
        answeredCount - correctCount
    );

    const unansweredCount = Math.max(
        0,
        totalQuestions - answeredCount
    );

    const score = Math.round(
        Number(result.percentage) || 0
    );

    const performanceLabel = getPerformanceLabel(score);

    return (
        <div className="min-h-screen bg-app px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* Header */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <button
                            onClick={() => navigate("/quizzes")}
                            className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-brand"
                        >
                            <FiArrowLeft size={16} />
                            Back to quizzes
                        </button>

                        <h1 className="font-heading text-3xl font-bold text-foreground">
                            Quiz Results
                        </h1>

                        <p className="mt-2 text-sm text-muted">
                            {courseName}
                            {topicName && ` · ${topicName}`}
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                        <FiCheckCircle className="mr-1 inline" />
                        Quiz submitted
                    </span>
                </header>

                {/* Score card */}
                <section className="rounded-panel border border-border bg-surface p-6 sm:p-8">
                    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[220px_1fr]">

                        <div className="flex flex-col items-center justify-center">
                            <div
                                className="flex h-44 w-44 items-center justify-center rounded-full"
                                style={{
                                    background: `conic-gradient(var(--color-brand) ${score}%, var(--color-brand-soft) ${score}% 100%)`,
                                }}
                            >
                                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-surface">
                                    <span className="font-heading text-4xl font-bold text-foreground">
                                        {score}%
                                    </span>

                                    <span className="mt-1 text-xs text-muted">
                                        Your score
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-brand">
                                <FiAward size={22} />
                                <span className="text-sm font-semibold">
                                    Assessment completed
                                </span>
                            </div>

                            <h2 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                                {performanceLabel}
                            </h2>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                                You answered {correctCount} out of{" "}
                                {totalQuestions} questions correctly.
                                Review your answers below to understand
                                where you can improve.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate("/quizzes")}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
                                >
                                    <FiRotateCcw size={16} />
                                    Take another quiz
                                </button>

                                <button
                                    onClick={() => navigate("/quizzes")}
                                    className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-app"
                                >
                                    Explore quizzes
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Summary statistics */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        icon={FiBookOpen}
                        label="Total questions"
                        value={totalQuestions}
                        style="bg-brand-soft text-brand"
                    />

                    <StatCard
                        icon={FiCheckCircle}
                        label="Correct answers"
                        value={correctCount}
                        style="bg-success/10 text-success"
                    />

                    <StatCard
                        icon={FiXCircle}
                        label="Incorrect answers"
                        value={incorrectCount}
                        style="bg-error/10 text-error"
                    />

                    <StatCard
                        icon={FiAlertCircle}
                        label="Unanswered"
                        value={unansweredCount}
                        style="bg-warning/10 text-warning"
                    />
                </section>

                {/* Detailed answer review */}
                <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
                    <div>
                        <h2 className="font-heading text-xl font-bold text-foreground">
                            Review your answers
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            Check the correct answers and read their explanations.
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        {questions.map((question, index) => {
                            const selected = question.answer;
                            const correctAnswer = question.correct_answer;

                            const isCorrect = question.is_correct;
                            const isUnanswered = selected === null;

                            return (
                                <article
                                    key={question.question_id}
                                    className="rounded-xl border border-border p-4 sm:p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <h3 className="flex-1 text-sm font-semibold leading-6 text-foreground">
                                            <span className="mr-2 text-muted">
                                                Q{index + 1}.
                                            </span>
                                            {question.prompt}
                                        </h3>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                isUnanswered
                                                    ? "bg-warning/10 text-warning"
                                                    : isCorrect
                                                      ? "bg-success/10 text-success"
                                                      : "bg-error/10 text-error"
                                            }`}
                                        >
                                            {isUnanswered
                                                ? "Unanswered"
                                                : isCorrect
                                                  ? "Correct"
                                                  : "Incorrect"}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {question.options.map(
                                            (option, optionIndex) => {
                                                const isAnswer =
                                                    option === correctAnswer;

                                                const isSelected =
                                                    option === selected;

                                                return (
                                                    <div
                                                        key={optionIndex}
                                                        className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                                                            isAnswer
                                                                ? "border-success/30 bg-success/5 text-success"
                                                                : isSelected
                                                                  ? "border-error/30 bg-error/5 text-error"
                                                                  : "border-border text-muted"
                                                        }`}
                                                    >
                                                        <span className="font-semibold">
                                                            {String.fromCharCode(
                                                                65 + optionIndex
                                                            )}
                                                            .
                                                        </span>

                                                        <span className="flex-1">
                                                            {option}
                                                        </span>

                                                        {isAnswer && (
                                                            <FiCheckCircle size={17} />
                                                        )}

                                                        {!isAnswer &&
                                                            isSelected && (
                                                                <FiXCircle size={17} />
                                                            )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    <div className="mt-4 rounded-xl bg-app p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                            Explanation
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-foreground">
                                            {question.explanation ||
                                                "No explanation is available for this question."}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* Bottom action */}
                <section className="flex flex-col items-start justify-between gap-4 rounded-panel border border-border bg-surface p-5 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="font-heading font-bold text-foreground">
                            Keep improving
                        </h3>

                        <p className="mt-1 text-sm text-muted">
                            Continue learning and take another quiz.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/quizzes")}
                        className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
                    >
                        Back to quizzes
                    </button>
                </section>
            </div>
        </div>
    );
}
