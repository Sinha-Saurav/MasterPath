
import { useEffect, useMemo, useState } from "react";
import {
    FiBookOpen,
    FiChevronDown,
    FiChevronRight,
    FiCheckCircle,
    FiTarget,
    FiTrendingUp,
    FiSearch,
    FiLayers,
    FiPlay,
    FiClock,
    FiHelpCircle,
    FiZap,
    FiX,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ---------------------------------------------
// HELPERS
// ---------------------------------------------

function formatMastery(score) {
    return score == null ? null : Math.round(score * 100);
}

function getCourseColor(index) {
    const colors = [
        "bg-brand-soft text-brand",
        "bg-info/10 text-info",
        "bg-success/10 text-success",
        "bg-warning/10 text-warning",
    ];

    return colors[index % colors.length];
}

function getErrorMessage(error) {
    return (
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again."
    );
}

// ---------------------------------------------
// SMALL REUSABLE COMPONENTS
// ---------------------------------------------

function SummaryCard({ icon: Icon, label, value, description, iconStyle }) {
    return (
        <div className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}>
                    <Icon size={19} />
                </div>
                <span className="text-xs text-muted">{description}</span>
            </div>

            <p className="mt-4 font-heading text-2xl font-bold text-foreground">
                {value}
            </p>

            <p className="mt-1 text-sm text-muted">{label}</p>
        </div>
    );
}

function MasteryBar({ value }) {
    const color =
        value == null
            ? "bg-border"
            : value < 40
                ? "bg-error"
                : value < 60
                    ? "bg-warning"
                    : "bg-brand";

    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-soft">
            <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{
                    width: `${Math.min(100, Math.max(0, value ?? 0))}%`,
                }}
            />
        </div>
    );
}

function MasteryLabel({ value }) {
    if (value == null) {
        return (
            <span className="rounded-full bg-app px-2 py-1 text-xs font-medium text-muted">
                Not assessed
            </span>
        );
    }

    if (value < 40) {
        return (
            <span className="rounded-full bg-error/10 px-2 py-1 text-xs font-medium text-error">
                Needs practice
            </span>
        );
    }

    if (value < 60) {
        return (
            <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                Improving
            </span>
        );
    }

    return (
        <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
            Good progress
        </span>
    );
}

// ---------------------------------------------
// COURSE MASTERY CARD
// ---------------------------------------------

function CourseMasteryCard({
    course,
    expanded,
    onExpand,
    onSelectCourse,
    onSelectTopic,
}) {
    return (
        <div
            className={`overflow-hidden rounded-card border bg-surface transition ${
                expanded
                    ? "border-brand/40 shadow-sm"
                    : "border-border"
            }`}
        >
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-heading font-bold ${course.color}`}
                        >
                            {course.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="font-heading font-bold text-foreground">
                                {course.name}
                            </h3>

                            <p className="mt-1 text-xs text-muted">
                                {course.totalTopics} topics · {course.code}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:min-w-64">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-muted">
                                    Overall mastery
                                </span>

                                <span className="font-heading text-lg font-bold text-foreground">
                                    {course.mastery == null
                                        ? "—"
                                        : `${course.mastery}%`}
                                </span>
                            </div>

                            <MasteryBar value={course.mastery} />
                        </div>

                        <button
                            onClick={() => onExpand(course.id)}
                            aria-label={`${expanded ? "Collapse" : "Expand"} ${course.name} topics`}
                            aria-expanded={expanded}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-brand-wash hover:text-brand"
                        >
                            {expanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <MasteryLabel value={course.mastery} />

                    <button
                        onClick={() => onSelectCourse(course)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-hover"
                    >
                        Create course quiz
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-border bg-app/60 p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h4 className="font-heading font-bold text-foreground">
                                Topic mastery
                            </h4>

                            <p className="mt-1 text-xs text-muted">
                                Select a topic to create a focused practice quiz.
                            </p>
                        </div>

                        <span className="text-xs text-muted">
                            {course.topics.length} topics
                        </span>
                    </div>

                    <div className="space-y-3">
                        {course.topics.map((topic) => (
                            <div
                                key={topic.id}
                                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium text-foreground">
                                            {topic.name}
                                        </span>

                                        <span className="shrink-0 text-sm font-semibold text-foreground">
                                            {topic.mastery == null
                                                ? "Not assessed"
                                                : `${topic.mastery}%`}
                                        </span>
                                    </div>

                                    <MasteryBar value={topic.mastery} />
                                </div>

                                <button
                                    onClick={() => onSelectTopic(course, topic)}
                                    className="shrink-0 rounded-lg border border-brand/30 px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand-wash"
                                >
                                    Practice topic
                                </button>
                            </div>
                        ))}

                        {course.topics.length === 0 && (
                            <p className="py-5 text-center text-sm text-muted">
                                No topics are available for this course.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------
// QUIZ BUILDER
// ---------------------------------------------

function QuizBuilder({
    courses,
    selectedCourseId,
    selectedTopicId,
    scope,
    questionCount,
    difficulty,
    isGenerating,
    onCourseChange,
    onTopicChange,
    onScopeChange,
    onQuestionCountChange,
    onDifficultyChange,
    onGenerate,
}) {
    const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
    );

    const [customCount, setCustomCount] = useState("20");
    const [error, setError] = useState("");

    function handleGenerate() {
        if (!selectedCourseId) {
            setError("Please select a course first.");
            return;
        }

        if (scope === "topic" && !selectedTopicId) {
            setError("Please select a topic for your quiz.");
            return;
        }

        const count =
            questionCount === "custom"
                ? Number(customCount)
                : Number(questionCount);

        if (!Number.isInteger(count) || count < 1 || count > 20) {
            setError("Enter a question count between 1 and 20.");
            return;
        }

        setError("");

        onGenerate({
            courseId: selectedCourseId,
            topicId: scope === "topic" ? selectedTopicId : null,
            questionCount: count,
            difficulty,
        });
    }

    return (
        <section
            id="quiz-builder"
            className="scroll-mt-24 rounded-panel border border-border bg-surface p-5 shadow-sm sm:p-6"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <FiZap size={21} />
                </div>

                <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">
                        Create your quiz
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                        Choose what you want to practice and customize your quiz.
                    </p>
                </div>
            </div>

            {/* Scope */}
            <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                    What would you like to practice?
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            onScopeChange("course");
                            onTopicChange("");
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                            scope === "course"
                                ? "border-brand bg-brand-wash"
                                : "border-border hover:border-brand/40"
                        }`}
                    >
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                scope === "course"
                                    ? "bg-brand-soft text-brand"
                                    : "bg-app text-muted"
                            }`}
                        >
                            <FiBookOpen size={18} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Entire course
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                                All course topics
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onScopeChange("topic")}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                            scope === "topic"
                                ? "border-brand bg-brand-wash"
                                : "border-border hover:border-brand/40"
                        }`}
                    >
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                scope === "topic"
                                    ? "bg-brand-soft text-brand"
                                    : "bg-app text-muted"
                            }`}
                        >
                            <FiLayers size={18} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Specific topic
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                                Focused practice
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Course and topic */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        Select course
                    </label>

                    <select
                        value={selectedCourseId}
                        onChange={(event) => onCourseChange(event.target.value)}
                        disabled={courses.length === 0 || isGenerating}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="">Choose a course</option>

                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        Select topic
                    </label>

                    <select
                        value={selectedTopicId}
                        disabled={
                            scope !== "topic" ||
                            !selectedCourse ||
                            isGenerating
                        }
                        onChange={(event) => onTopicChange(event.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:bg-app disabled:text-muted"
                    >
                        <option value="">
                            {scope === "topic"
                                ? "Choose a topic"
                                : "Select topic mode first"}
                        </option>

                        {selectedCourse?.topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Question count */}
            <div className="mt-5">
                <label className="mb-3 block text-sm font-semibold text-foreground">
                    Number of questions
                </label>

                <div className="grid grid-cols-5 gap-2">
                    {["5", "10", "15", "20", "custom"].map((count) => (
                        <button
                            key={count}
                            type="button"
                            disabled={isGenerating}
                            onClick={() => onQuestionCountChange(count)}
                            className={`rounded-xl border px-2 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                                questionCount === count
                                    ? "border-brand bg-brand-wash text-brand"
                                    : "border-border text-muted hover:border-brand/40"
                            }`}
                        >
                            {count === "custom" ? "Custom" : count}
                        </button>
                    ))}
                </div>

                {questionCount === "custom" && (
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={customCount}
                        disabled={isGenerating}
                        onChange={(event) => setCustomCount(event.target.value)}
                        placeholder="Enter number of questions (1–20)"
                        className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
                    />
                )}
            </div>

            {/* Difficulty */}
            <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                    Difficulty
                </label>

                <select
                    value={difficulty}
                    disabled={isGenerating}
                    onChange={(event) => onDifficultyChange(event.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand sm:max-w-md"
                >
                    <option value="adaptive">Adaptive</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>

                {difficulty === "adaptive" && (
                    <p className="mt-2 text-xs text-muted">
                        Difficulty adjusts according to your recorded topic or course mastery.
                    </p>
                )}
            </div>

            {error && (
                <p
                    role="alert"
                    className="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
                >
                    {error}
                </p>
            )}

            {/* Summary */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-app p-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                    <FiHelpCircle size={14} />
                    {questionCount === "custom"
                        ? customCount || "Custom"
                        : questionCount}{" "}
                    questions
                </span>

                <span className="flex items-center gap-1.5">
                    <FiTarget size={14} />
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>

                <span className="flex items-center gap-1.5">
                    <FiBookOpen size={14} />
                    {scope === "course" ? "Entire course" : "Topic practice"}
                </span>
            </div>

            <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || courses.length === 0}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                <FiPlay size={17} />
                {isGenerating ? "Generating quiz..." : "Generate quiz"}
            </button>
        </section>
    );
}

// ---------------------------------------------
// MAIN PAGE
// ---------------------------------------------

export default function Quizzes() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [summary, setSummary] = useState({
        quizzesCompleted: 0,
        averageScore: 0,
        questionsAnswered: 0,
    });

    const [attemptHistory, setAttemptHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [generateError, setGenerateError] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const [expandedCourse, setExpandedCourse] = useState(null);

    const [scope, setScope] = useState("course");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedTopicId, setSelectedTopicId] = useState("");

    const [questionCount, setQuestionCount] = useState("10");
    const [difficulty, setDifficulty] = useState("adaptive");

    const [search, setSearch] = useState("");

    // -----------------------------------------
    // FETCH REAL DASHBOARD AND MASTERY DATA
    // -----------------------------------------

    useEffect(() => {
        let active = true;

        async function loadQuizPage() {
            try {
                setLoading(true);
                setPageError("");

                const { data: dashboard } = await api.get("/me/dashboard");

                const courseMastery = dashboard.course_mastery ?? [];

                // Fetch topic-level mastery for every enrolled course.
                const masteryResponses = await Promise.all(
                    courseMastery.map((course) =>
                        api.get(`/me/courses/${course.course_id}/mastery`)
                    )
                );

                if (!active) return;

                const mappedCourses = courseMastery.map((course, index) => {
                    const masteryData = masteryResponses[index].data;
                    const topics = masteryData.topics ?? [];

                    return {
                        id: String(course.course_id),
                        code: course.course_code,
                        name: course.course_name,
                        icon: course.course_code || "CS",
                        color: getCourseColor(index),
                        mastery: formatMastery(course.mastery_score),
                        totalTopics: course.total_topics,
                        topics: topics.map((topic) => ({
                            id: String(topic.topic_id),
                            name: topic.topic_name,
                            unit: topic.unit,
                            mastery: formatMastery(topic.mastery_score),
                            assessed: topic.assessed,
                        })),
                    };
                });

                const courseById = new Map(
                    mappedCourses.map((course) => [course.id, course])
                );

                const recentQuizzes = (dashboard.recent_quizzes ?? []).map(
                    (quiz) => {
                        const course = courseById.get(String(quiz.course_id));

                        const topic = course?.topics.find(
                            (item) => item.id === String(quiz.topic_id)
                        );

                        return {
                            id: quiz.quiz_id,
                            quizId: quiz.quiz_id,
                            title: topic
                                ? `${topic.name} quiz`
                                : "Course-wide quiz",
                            course: course?.name ?? "Course",
                            topic: topic?.name ?? "Entire course",
                            score: quiz.percentage,
                            correct: quiz.correct_answers,
                            total: quiz.total_questions,
                            completedAt: quiz.finished_at,
                        };
                    }
                );

                setCourses(mappedCourses);
                setAttemptHistory(recentQuizzes);

                setSummary({
                    quizzesCompleted: dashboard.summary?.quizzes_completed ?? 0,
                    averageScore: dashboard.summary?.average_score ?? 0,
                    questionsAnswered: dashboard.summary?.questions_answered ?? 0,
                });

                setSelectedCourseId((current) => {
                    const stillExists = mappedCourses.some(
                        (course) => course.id === current
                    );

                    return stillExists
                        ? current
                        : mappedCourses[0]?.id ?? "";
                });
            } catch (error) {
                if (active) {
                    setPageError(getErrorMessage(error));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadQuizPage();

        return () => {
            active = false;
        };
    }, []);

    // -----------------------------------------
    // SEARCH
    // -----------------------------------------

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return courses;

        return courses.filter((course) =>
            course.name.toLowerCase().includes(query) ||
            course.code.toLowerCase().includes(query) ||
            course.topics.some((topic) =>
                topic.name.toLowerCase().includes(query)
            )
        );
    }, [courses, search]);

    // -----------------------------------------
    // COURSE SELECTION
    // -----------------------------------------

    function handleExpand(courseId) {
        setExpandedCourse((current) =>
            current === courseId ? null : courseId
        );
    }

    function scrollToBuilder() {
        document.getElementById("quiz-builder")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function handleSelectCourse(course) {
        setSelectedCourseId(course.id);
        setSelectedTopicId("");
        setScope("course");
        scrollToBuilder();
    }

    function handleSelectTopic(course, topic) {
        setSelectedCourseId(course.id);
        setSelectedTopicId(topic.id);
        setScope("topic");
        scrollToBuilder();
    }

    function handleCourseChange(courseId) {
        setSelectedCourseId(courseId);
        setSelectedTopicId("");
    }

    // -----------------------------------------
    // GENERATE QUIZ THROUGH BACKEND
    // -----------------------------------------

    async function handleGenerate(config) {
        try {
            setIsGenerating(true);
            setGenerateError("");

            const { data } = await api.post("/quizzes", {
                course_id: Number(config.courseId),
                topic_id: config.topicId
                    ? Number(config.topicId)
                    : null,
                question_count: config.questionCount,
                difficulty: config.difficulty,
            });

            const quizId = data.quiz?.id ?? data.quiz_id;

            if (!quizId) {
                throw new Error(
                    "The server created a response without returning a quiz ID."
                );
            }

            // The attempt page will fetch the actual questions
            // using GET /api/quizzes/:quizId.
            navigate(`/quizzes/${quizId}/attempt`);
        } catch (error) {
            setGenerateError(getErrorMessage(error));
        } finally {
            setIsGenerating(false);
        }
    }

    // -----------------------------------------
    // LOADING STATE
    // -----------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-app px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-panel border border-border bg-surface p-10 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                        <p className="mt-4 text-sm text-muted">
                            Loading your courses and quiz performance...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // -----------------------------------------
    // PAGE
    // -----------------------------------------

    return (
        <div className="min-h-screen bg-app px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header */}
                <header>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <FiBookOpen size={15} />
                        <span>Learning</span>
                        <FiChevronRight size={14} />
                        <span className="font-medium text-foreground">
                            Quizzes
                        </span>
                    </div>

                    <div className="mt-4">
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Quizzes & Mastery
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                            Understand your progress across courses, discover
                            areas to improve, and create personalized quizzes.
                        </p>
                    </div>
                </header>

                {/* API error */}
                {pageError && (
                    <div
                        role="alert"
                        className="flex items-start justify-between gap-3 rounded-xl border border-error/20 bg-error/10 p-4"
                    >
                        <p className="text-sm text-error">{pageError}</p>

                        <button
                            onClick={() => window.location.reload()}
                            className="shrink-0 text-sm font-semibold text-error underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Summary */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SummaryCard
                        icon={FiCheckCircle}
                        label="Quizzes completed"
                        value={summary.quizzesCompleted}
                        description="All time"
                        iconStyle="bg-success/10 text-success"
                    />

                    <SummaryCard
                        icon={FiTarget}
                        label="Average score"
                        value={`${summary.averageScore}%`}
                        description="Completed quizzes"
                        iconStyle="bg-brand-soft text-brand"
                    />

                    <SummaryCard
                        icon={FiTrendingUp}
                        label="Questions answered"
                        value={summary.questionsAnswered}
                        description="All time"
                        iconStyle="bg-info/10 text-info"
                    />
                </section>

                {/* Course mastery */}
                <section>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <h2 className="font-heading text-xl font-bold text-foreground">
                                Your course mastery
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                Explore your progress and see how well you understand each topic.
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <FiSearch
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                            />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search courses or topics..."
                                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-brand"
                            />
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {filteredCourses.map((course) => (
                            <CourseMasteryCard
                                key={course.id}
                                course={course}
                                expanded={expandedCourse === course.id}
                                onExpand={handleExpand}
                                onSelectCourse={handleSelectCourse}
                                onSelectTopic={handleSelectTopic}
                            />
                        ))}

                        {filteredCourses.length === 0 && (
                            <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center">
                                <FiSearch
                                    className="mx-auto text-muted"
                                    size={25}
                                />

                                <p className="mt-3 font-semibold text-foreground">
                                    {courses.length === 0
                                        ? "No enrolled courses"
                                        : "No courses found"}
                                </p>

                                <p className="mt-1 text-sm text-muted">
                                    {courses.length === 0
                                        ? "Enroll in a course to start practicing and tracking your mastery."
                                        : "Try another course or topic name."}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quiz builder */}
                <QuizBuilder
                    courses={courses}
                    selectedCourseId={selectedCourseId}
                    selectedTopicId={selectedTopicId}
                    scope={scope}
                    questionCount={questionCount}
                    difficulty={difficulty}
                    isGenerating={isGenerating}
                    onCourseChange={handleCourseChange}
                    onTopicChange={setSelectedTopicId}
                    onScopeChange={setScope}
                    onQuestionCountChange={setQuestionCount}
                    onDifficultyChange={setDifficulty}
                    onGenerate={handleGenerate}
                />

                {generateError && (
                    <div
                        role="alert"
                        className="flex items-start justify-between gap-3 rounded-xl border border-error/20 bg-error/10 p-4"
                    >
                        <p className="text-sm text-error">
                            {generateError}
                        </p>

                        <button
                            onClick={() => setGenerateError("")}
                            aria-label="Dismiss error"
                            className="shrink-0 text-error"
                        >
                            <FiX size={17} />
                        </button>
                    </div>
                )}

                {/* Previous attempts */}
                <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-heading text-xl font-bold text-foreground">
                                Previous attempts
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                Your five most recently completed quizzes.
                            </p>
                        </div>

                        <FiClock className="text-brand" size={21} />
                    </div>

                    {attemptHistory.length === 0 ? (
                        <div className="py-10 text-center">
                            <FiBookOpen
                                className="mx-auto text-muted"
                                size={28}
                            />

                            <p className="mt-3 font-semibold text-foreground">
                                No completed quizzes yet
                            </p>

                            <p className="mt-1 text-sm text-muted">
                                Your completed quizzes will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {attemptHistory.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                                >
                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {attempt.title}
                                        </h3>

                                        <p className="mt-1 text-xs text-muted">
                                            {attempt.course} · {attempt.topic}
                                        </p>

                                        <p className="mt-1 text-xs text-muted">
                                            {attempt.completedAt
                                                ? new Date(
                                                    attempt.completedAt
                                                ).toLocaleString()
                                                : "Completion date unavailable"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="text-right">
                                            <p className="font-heading text-xl font-bold text-brand">
                                                {attempt.score}%
                                            </p>

                                            <p className="text-xs text-muted">
                                                {attempt.correct}/{attempt.total} correct
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/quizzes/${attempt.quizId}/results`
                                                )
                                            }
                                            className="rounded-lg border border-brand/30 px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand-wash"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
