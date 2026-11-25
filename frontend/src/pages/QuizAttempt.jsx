
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiClock,
    FiChevronLeft,
    FiChevronRight,
    FiFlag,
    FiCheckCircle,
    FiAlertCircle,
} from "react-icons/fi";
import api from "../services/api";

export default function QuizAttempt() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [courseName, setCourseName] = useState("");
    const [topicName, setTopicName] = useState("");

    const [answers, setAnswers] = useState({});
    const [marked, setMarked] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [pendingSaves, setPendingSaves] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Keeps answer requests ordered per question.
    const saveQueues = useRef(new Map());

    // --------------------------------------------------
    // LOAD QUIZ FROM BACKEND
    // --------------------------------------------------

    useEffect(() => {
        let active = true;

        async function loadQuiz() {
            try {
                setLoading(true);
                setError("");

                const { data } = await api.get(`/quizzes/${quizId}`);

                if (!active) return;

                if (!data?.quiz || !Array.isArray(data.questions)) {
                    throw new Error("Invalid quiz response from server.");
                }

                if (data.quiz.status !== "in_progress") {
                    navigate(`/quizzes/${quizId}/results`, {
                        replace: true,
                    });
                    return;
                }

                if (data.questions.length === 0) {
                    throw new Error("This quiz has no questions.");
                }

                setQuiz(data.quiz);
                setQuestions(data.questions);

                // Restore answers already saved in the backend.
                const savedAnswers = {};

                data.questions.forEach((question) => {
                    if (question.answer) {
                        savedAnswers[question.id] = question.answer;
                    }
                });

                setAnswers(savedAnswers);

                // Keep an estimated duration based on question count.
                setTimeLeft(data.questions.length * 150);

                // Load course and topic names for the heading.
                try {
                    const [coursesResponse, topicsResponse] =
                        await Promise.all([
                            api.get("/courses"),
                            api.get(
                                `/courses/${data.quiz.course_id}/topics`
                            ),
                        ]);

                    if (!active) return;

                    const courses = coursesResponse.data;
                    const topics = topicsResponse.data;

                    const course = Array.isArray(courses)
                        ? courses.find(
                              (item) =>
                                  String(item.id) ===
                                  String(data.quiz.course_id)
                          )
                        : null;

                    const topic = Array.isArray(topics)
                        ? topics.find(
                              (item) =>
                                  String(item.id) ===
                                  String(data.quiz.topic_id)
                          )
                        : null;

                    setCourseName(
                        course?.name ||
                            `Course ${data.quiz.course_id}`
                    );

                    setTopicName(
                        data.quiz.topic_id
                            ? topic?.name || `Topic ${data.quiz.topic_id}`
                            : "All course topics"
                    );
                } catch {
                    if (!active) return;

                    setCourseName(`Course ${data.quiz.course_id}`);
                    setTopicName(
                        data.quiz.topic_id
                            ? `Topic ${data.quiz.topic_id}`
                            : "All course topics"
                    );
                }
            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.error?.message ||
                        err.message ||
                        "Unable to load this quiz."
                );
            } finally {
                if (active) setLoading(false);
            }
        }

        loadQuiz();

        return () => {
            active = false;
        };
    }, [quizId, navigate]);

    // --------------------------------------------------
    // TIMER
    // --------------------------------------------------

    useEffect(() => {
        if (loading || submitting || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((previous) => Math.max(0, previous - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, submitting, timeLeft]);

    const formattedTime = `${String(
        Math.floor(timeLeft / 60)
    ).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

    // --------------------------------------------------
    // DERIVED VALUES
    // --------------------------------------------------

    const currentQuestion = questions[currentIndex];

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;
    const markedCount = marked.length;

    const progress =
        questions.length > 0
            ? (answeredCount / questions.length) * 100
            : 0;

    const difficultyLabel = (difficulty) => {
        if (difficulty <= 2) return "Easy";
        if (difficulty === 3) return "Medium";
        return "Hard";
    };

    // --------------------------------------------------
    // SAVE ANSWER TO BACKEND
    // --------------------------------------------------

    function selectAnswer(option) {
        if (!currentQuestion || submitting) return;

        const questionId = currentQuestion.id;

        // Update the UI immediately.
        setAnswers((previous) => ({
            ...previous,
            [questionId]: option,
        }));

        setSaveError("");
        setPendingSaves((previous) => previous + 1);

        // Queue requests for the same question so rapid changes
        // cannot cause an older answer to overwrite a newer one.
        const previousRequest =
            saveQueues.current.get(questionId) || Promise.resolve();

        const request = previousRequest
            .catch(() => {})
            .then(() =>
                api.put(
                    `/quizzes/${quizId}/answers/${questionId}`,
                    { answer: option }
                )
            );

        saveQueues.current.set(questionId, request);

        request
            .catch((err) => {
                setSaveError(
                    err.response?.data?.error?.message ||
                        "Your answer could not be saved. Please try again."
                );
            })
            .finally(() => {
                if (saveQueues.current.get(questionId) === request) {
                    saveQueues.current.delete(questionId);
                }

                setPendingSaves((previous) =>
                    Math.max(0, previous - 1)
                );
            });
    }

    // --------------------------------------------------
    // QUESTION NAVIGATION
    // --------------------------------------------------

    function toggleMark() {
        if (!currentQuestion || submitting) return;

        setMarked((previous) =>
            previous.includes(currentQuestion.id)
                ? previous.filter(
                      (id) => id !== currentQuestion.id
                  )
                : [...previous, currentQuestion.id]
        );
    }

    function goToQuestion(index) {
        if (
            index >= 0 &&
            index < questions.length &&
            !submitting
        ) {
            setCurrentIndex(index);
        }
    }

    // --------------------------------------------------
    // SUBMIT QUIZ
    // --------------------------------------------------

    async function submitQuiz() {
        if (submitting) return;

        try {
            setSubmitting(true);
            setSaveError("");

            // Wait for any answer requests still in progress.
            await Promise.all([...saveQueues.current.values()]);

            // Finalize the quiz on the backend.
            await api.post(`/quizzes/${quizId}/finish`);

            // Results page fetches the persisted result itself.
            navigate(`/quizzes/${quizId}/results`, {
                replace: true,
            });
        } catch (err) {
            setSubmitting(false);
            setShowSubmitModal(false);

            setSaveError(
                err.response?.data?.error?.message ||
                    "Unable to submit the quiz. Please try again."
            );
        }
    }

    // --------------------------------------------------
    // LOADING / ERROR STATES
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-app">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
                    <p className="mt-4 text-sm text-muted">
                        Loading your quiz...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !quiz || !currentQuestion) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-app px-4">
                <div className="max-w-md rounded-panel border border-border bg-surface p-7 text-center">
                    <FiAlertCircle
                        className="mx-auto text-error"
                        size={32}
                    />
                    <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
                        Unable to load quiz
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                        {error || "Quiz data is unavailable."}
                    </p>
                    <button
                        onClick={() => navigate("/quizzes")}
                        className="mt-6 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
                    >
                        Back to quizzes
                    </button>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // MAIN UI
    // --------------------------------------------------

    return (
        <div className="min-h-screen bg-app px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Quiz heading */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <button
                            onClick={() => navigate("/quizzes")}
                            disabled={submitting}
                            className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-brand disabled:opacity-50"
                        >
                            <FiChevronLeft />
                            Back to quizzes
                        </button>

                        <h1 className="font-heading text-2xl font-bold text-foreground">
                            {quiz.topic_id
                                ? "Topic Practice Quiz"
                                : "Course Practice Quiz"}
                        </h1>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                            <span>{courseName}</span>
                            <span>·</span>
                            <span>{topicName}</span>
                            <span>·</span>
                            <span>
                                {difficultyLabel(
                                    currentQuestion.difficulty
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                            <FiClock className="text-brand" size={19} />
                            <div>
                                <p className="text-xs text-muted">
                                    Estimated duration
                                </p>
                                <p className="font-semibold text-foreground">
                                    {Math.round(
                                        (questions.length * 2.5) * 10
                                    ) / 10}{" "}
                                    minutes
                                </p>
                            </div>
                        </div>

                        <div
                            className={`flex items-center gap-3 rounded-xl border p-3 ${
                                timeLeft <= 60
                                    ? "border-error/30 bg-error/5 text-error"
                                    : "border-border bg-surface text-foreground"
                            }`}
                        >
                            <FiClock size={19} />
                            <div>
                                <p className="text-xs text-muted">
                                    Time remaining
                                </p>
                                <p className="font-heading text-lg font-bold tabular-nums">
                                    {formattedTime}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Progress */}
                <div className="mt-7 rounded-xl border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Your progress
                            </p>
                            <p className="mt-1 text-xs text-muted">
                                {answeredCount} of {questions.length} questions answered
                            </p>
                        </div>

                        <p className="font-heading text-lg font-bold text-brand">
                            {Math.round(progress)}%
                        </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-soft">
                        <div
                            className="h-full rounded-full bg-brand transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Save error */}
                {saveError && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
                        <FiAlertCircle className="mt-0.5 shrink-0" />
                        <p>{saveError}</p>
                    </div>
                )}

                {/* Main quiz layout */}
                <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">

                    {/* Question */}
                    <main className="rounded-panel border border-border bg-surface p-5 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-lg bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                                Question {currentIndex + 1} of {questions.length}
                            </span>

                            <button
                                onClick={toggleMark}
                                disabled={submitting}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                                    marked.includes(currentQuestion.id)
                                        ? "border-warning/40 bg-warning/10 text-warning"
                                        : "border-border text-muted hover:border-warning/40 hover:text-warning"
                                }`}
                            >
                                <FiFlag size={15} />
                                {marked.includes(currentQuestion.id)
                                    ? "Marked for review"
                                    : "Mark for review"}
                            </button>
                        </div>

                        <h2 className="mt-7 font-heading text-xl font-bold leading-8 text-foreground sm:text-2xl">
                            {currentQuestion.prompt}
                        </h2>

                        <p className="mt-3 text-sm text-muted">
                            Select one correct answer.
                        </p>

                        <div className="mt-7 space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const selected =
                                    answers[currentQuestion.id] === option;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectAnswer(option)}
                                        disabled={submitting}
                                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${
                                            selected
                                                ? "border-brand bg-brand-wash"
                                                : "border-border hover:border-brand/40 hover:bg-app"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                                selected
                                                    ? "bg-brand text-white"
                                                    : "bg-app text-muted"
                                            }`}
                                        >
                                            {String.fromCharCode(65 + index)}
                                        </span>

                                        <span
                                            className={`flex-1 text-sm ${
                                                selected
                                                    ? "font-semibold text-foreground"
                                                    : "text-foreground"
                                            }`}
                                        >
                                            {option}
                                        </span>

                                        {selected && (
                                            <FiCheckCircle
                                                className="shrink-0 text-brand"
                                                size={19}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row">
                            <button
                                onClick={() =>
                                    goToQuestion(currentIndex - 1)
                                }
                                disabled={
                                    currentIndex === 0 || submitting
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted transition hover:bg-app disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft />
                                Previous
                            </button>

                            {currentIndex < questions.length - 1 ? (
                                <button
                                    onClick={() =>
                                        goToQuestion(currentIndex + 1)
                                    }
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50"
                                >
                                    Next question
                                    <FiChevronRight />
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        setShowSubmitModal(true)
                                    }
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50"
                                >
                                    Submit quiz
                                    <FiCheckCircle />
                                </button>
                            )}
                        </div>
                    </main>

                    {/* Question navigator */}
                    <aside className="h-fit rounded-panel border border-border bg-surface p-5">
                        <h3 className="font-heading font-bold text-foreground">
                            Question navigator
                        </h3>
                        <p className="mt-1 text-xs text-muted">
                            Jump to any question.
                        </p>

                        <div className="mt-5 grid grid-cols-5 gap-2">
                            {questions.map((question, index) => {
                                const isAnswered =
                                    answers[question.id] !== undefined;
                                const isMarked = marked.includes(question.id);
                                const isCurrent = currentIndex === index;

                                return (
                                    <button
                                        key={question.id}
                                        onClick={() =>
                                            goToQuestion(index)
                                        }
                                        disabled={submitting}
                                        aria-label={`Go to question ${index + 1}`}
                                        className={`relative flex h-10 items-center justify-center rounded-lg border text-sm font-semibold transition disabled:opacity-50 ${
                                            isCurrent
                                                ? "border-brand bg-brand text-white"
                                                : isAnswered
                                                  ? "border-success/30 bg-success/10 text-success"
                                                  : "border-border bg-surface text-muted hover:border-brand"
                                        }`}
                                    >
                                        {index + 1}
                                        {isMarked && (
                                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-surface" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 space-y-3 border-t border-border pt-4 text-xs text-muted">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                Answered ({answeredCount})
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full border border-border bg-surface" />
                                Not answered ({unansweredCount})
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                                Marked for review ({markedCount})
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl bg-app p-3">
                            <p className="text-xs leading-5 text-muted">
                                You can revisit questions and change your answers anytime before submitting.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowSubmitModal(true)}
                            disabled={submitting}
                            className="mt-5 w-full rounded-xl border border-brand/30 py-3 text-sm font-semibold text-brand transition hover:bg-brand-wash disabled:opacity-50"
                        >
                            Submit quiz
                        </button>
                    </aside>
                </div>
            </div>

            {/* Submit confirmation */}
            {showSubmitModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!submitting) setShowSubmitModal(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="submit-title"
                        className="w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                            <FiAlertCircle size={23} />
                        </div>

                        <h2
                            id="submit-title"
                            className="mt-4 font-heading text-xl font-bold text-foreground"
                        >
                            Submit your quiz?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            You have answered {answeredCount} out of{" "}
                            {questions.length} questions.
                            {unansweredCount > 0 &&
                                ` ${unansweredCount} questions are still unanswered.`}
                        </p>

                        {pendingSaves > 0 && (
                            <p className="mt-3 text-xs text-muted">
                                Saving your answers...
                            </p>
                        )}

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() =>
                                    setShowSubmitModal(false)
                                }
                                disabled={submitting}
                                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted hover:bg-app disabled:opacity-50"
                            >
                                Continue quiz
                            </button>

                            <button
                                onClick={submitQuiz}
                                disabled={submitting || pendingSaves > 0}
                                className="flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
