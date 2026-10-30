
import { useMemo, useState, useEffect } from "react";
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

// ---------------------------------------------
// MOCK DATA
// Replace with backend responses during integration.
// ---------------------------------------------

const mockCourses = [
    {
        id: "dsa",
        name: "Data Structures & Algorithms",
        shortName: "DSA",
        category: "Computer Science",
        mastery: 72,
        totalTopics: 12,
        icon: "DS",
        color: "bg-brand-soft text-brand",
        topics: [
            { id: "arrays", name: "Arrays", mastery: 90 },
            { id: "linked-lists", name: "Linked Lists", mastery: 75 },
            { id: "stacks", name: "Stacks and Queues", mastery: 82 },
            { id: "trees", name: "Trees", mastery: 55 },
            { id: "graphs", name: "Graphs", mastery: 30 },
            { id: "dp", name: "Dynamic Programming", mastery: 45 },
        ],
    },
    {
        id: "dbms",
        name: "Database Management Systems",
        shortName: "DBMS",
        category: "Computer Science",
        mastery: 85,
        totalTopics: 10,
        icon: "DB",
        color: "bg-info/10 text-info",
        topics: [
            { id: "sql", name: "SQL Queries", mastery: 92 },
            { id: "normalization", name: "Normalization", mastery: 40 },
            { id: "transactions", name: "Transactions", mastery: 78 },
            { id: "indexing", name: "Indexing", mastery: 80 },
        ],
    },
    {
        id: "os",
        name: "Operating Systems",
        shortName: "OS",
        category: "Computer Science",
        mastery: 58,
        totalTopics: 10,
        icon: "OS",
        color: "bg-success/10 text-success",
        topics: [
            { id: "processes", name: "Process Management", mastery: 70 },
            { id: "scheduling", name: "CPU Scheduling", mastery: 45 },
            { id: "synchronization", name: "Process Synchronization", mastery: 35 },
            { id: "memory", name: "Memory Management", mastery: 65 },
        ],
    },
    {
        id: "cn",
        name: "Computer Networks",
        shortName: "CN",
        category: "Computer Science",
        mastery: 64,
        totalTopics: 8,
        icon: "CN",
        color: "bg-warning/10 text-warning",
        topics: [
            { id: "osi", name: "OSI Model", mastery: 85 },
            { id: "tcp", name: "TCP/IP", mastery: 72 },
            { id: "protocols", name: "Network Protocols", mastery: 50 },
            { id: "security", name: "Network Security", mastery: 48 },
        ],
    },
    {
        id: "se",
        name: "Software Engineering",
        shortName: "SE",
        category: "Computer Science",
        mastery: 78,
        totalTopics: 8,
        icon: "SE",
        color: "bg-brand-soft text-brand",
        topics: [
            { id: "sdlc", name: "SDLC", mastery: 85 },
            { id: "testing", name: "Software Testing", mastery: 75 },
            { id: "design", name: "Software Design", mastery: 68 },
        ],
    },
];

const mockSummary = {
    quizzesAttempted: 28,
    averageScore: 85,
    completedThisMonth: 12,
};

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
        value < 40
            ? "bg-error"
            : value < 60
                ? "bg-warning"
                : "bg-brand";

    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-soft">
            <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

function MasteryLabel({ value }) {
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
        <div className={`overflow-hidden rounded-card border bg-surface transition ${expanded ? "border-brand/40 shadow-sm" : "border-border"
            }`}>
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-heading font-bold ${course.color}`}>
                            {course.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="font-heading font-bold text-foreground">
                                {course.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                                {course.totalTopics} topics · {course.category}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:min-w-64">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-muted">Overall mastery</span>
                                <span className="font-heading text-lg font-bold text-foreground">
                                    {course.mastery}%
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
                            {course.topics.length} topics shown
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
                                            {topic.mastery}%
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
    quizType,
    onCourseChange,
    onTopicChange,
    onScopeChange,
    onQuestionCountChange,
    onDifficultyChange,
    onQuizTypeChange,
    onGenerate,
}) {
    const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
    );

    const [customCount, setCustomCount] = useState("25");
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
            questionCount === "custom" ? Number(customCount) : Number(questionCount);

        if (!Number.isInteger(count) || count < 1 || count > 50) {
            setError("Enter a question count between 1 and 50.");
            return;
        }

        setError("");
        onGenerate({
            courseId: selectedCourseId,
            topicId: scope === "topic" ? selectedTopicId : null,
            scope,
            questionCount: count,
            difficulty,
            quizType,
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
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${scope === "course"
                            ? "border-brand bg-brand-wash"
                            : "border-border hover:border-brand/40"
                            }`}
                    >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${scope === "course" ? "bg-brand-soft text-brand" : "bg-app text-muted"
                            }`}>
                            <FiBookOpen size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Entire course</p>
                            <p className="mt-0.5 text-xs text-muted">All course topics</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onScopeChange("topic")}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${scope === "topic"
                            ? "border-brand bg-brand-wash"
                            : "border-border hover:border-brand/40"
                            }`}
                    >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${scope === "topic" ? "bg-brand-soft text-brand" : "bg-app text-muted"
                            }`}>
                            <FiLayers size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Specific topic</p>
                            <p className="mt-0.5 text-xs text-muted">Focused practice</p>
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
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
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
                        disabled={scope !== "topic" || !selectedCourse}
                        onChange={(event) => onTopicChange(event.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:bg-app disabled:text-muted"
                    >
                        <option value="">
                            {scope === "topic" ? "Choose a topic" : "Select topic mode first"}
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
                            onClick={() => onQuestionCountChange(count)}
                            className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${questionCount === count
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
                        max="50"
                        value={customCount}
                        onChange={(event) => setCustomCount(event.target.value)}
                        placeholder="Enter number of questions (1–50)"
                        className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
                    />
                )}
            </div>

            {/* Difficulty and quiz type */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        Difficulty
                    </label>
                    <select
                        value={difficulty}
                        onChange={(event) => onDifficultyChange(event.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
                    >
                        <option value="adaptive">Adaptive</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    {difficulty === "adaptive" && (
                        <p className="mt-2 text-xs text-muted">
                            Difficulty adjusts according to the selected quiz's learning settings.
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        Quiz type
                    </label>
                    <select
                        value={quizType}
                        onChange={(event) => onQuizTypeChange(event.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
                    >
                        <option value="practice">Practice</option>
                        <option value="assessment">Assessment</option>
                    </select>
                </div>
            </div>

            {error && (
                <p role="alert" className="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
                    {error}
                </p>
            )}

            {/* Summary */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-app p-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                    <FiHelpCircle size={14} />
                    {questionCount === "custom" ? customCount || "Custom" : questionCount} questions
                </span>
                <span className="flex items-center gap-1.5">
                    <FiTarget size={14} />
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <span className="flex items-center gap-1.5">
                    <FiBookOpen size={14} />
                    {quizType === "practice" ? "Practice quiz" : "Assessment"}
                </span>
            </div>

            <button
                type="button"
                onClick={handleGenerate}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
                <FiPlay size={17} />
                Generate quiz
            </button>
        </section>
    );
}

// ---------------------------------------------
// MAIN PAGE
// ---------------------------------------------

export default function Quizzes() {
    const navigate = useNavigate();
    const [expandedCourse, setExpandedCourse] = useState(null);

    const [scope, setScope] = useState("course");
    const [selectedCourseId, setSelectedCourseId] = useState("dsa");
    const [selectedTopicId, setSelectedTopicId] = useState("");

    const [questionCount, setQuestionCount] = useState("10");
    const [difficulty, setDifficulty] = useState("adaptive");
    const [quizType, setQuizType] = useState("practice");

    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState("");

    const [attemptHistory, setAttemptHistory] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("masterpath-quiz-history") || "[]"
            );
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            setAttemptHistory(
                JSON.parse(
                    localStorage.getItem("masterpath-quiz-history") || "[]"
                )
            );
        } catch {
            setAttemptHistory([]);
        }
    }, []);

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return mockCourses;

        return mockCourses.filter((course) =>
            course.name.toLowerCase().includes(query) ||
            course.topics.some((topic) =>
                topic.name.toLowerCase().includes(query)
            )
        );
    }, [search]);

    function handleExpand(courseId) {
        setExpandedCourse((current) =>
            current === courseId ? null : courseId
        );
    }

    function handleSelectCourse(course) {
        setSelectedCourseId(course.id);
        setSelectedTopicId("");
        setScope("course");

        document.getElementById("quiz-builder")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function handleSelectTopic(course, topic) {
        setSelectedCourseId(course.id);
        setSelectedTopicId(topic.id);
        setScope("topic");

        document.getElementById("quiz-builder")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function handleCourseChange(courseId) {
        setSelectedCourseId(courseId);
        setSelectedTopicId("");
    }

    function handleGenerate(config) {
        navigate(`/quizzes/${config.courseId}/attempt`, {
            state: { config },
        });
    }

    return (
        <div className="min-h-screen bg-app px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header */}
                <header>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <FiBookOpen size={15} />
                        <span>Learning</span>
                        <FiChevronRight size={14} />
                        <span className="font-medium text-foreground">Quizzes</span>
                    </div>

                    <div className="mt-4">
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Quizzes & Mastery
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                            Understand your progress across courses, discover areas to improve,
                            and create personalized quizzes.
                        </p>
                    </div>
                </header>

                {/* Summary */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SummaryCard
                        icon={FiCheckCircle}
                        label="Quizzes attempted"
                        value={mockSummary.quizzesAttempted}
                        description="Total attempts"
                        iconStyle="bg-success/10 text-success"
                    />
                    <SummaryCard
                        icon={FiTarget}
                        label="Average score"
                        value={`${mockSummary.averageScore}%`}
                        description="Overall performance"
                        iconStyle="bg-brand-soft text-brand"
                    />
                    <SummaryCard
                        icon={FiTrendingUp}
                        label="Completed this month"
                        value={mockSummary.completedThisMonth}
                        description="This month"
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
                                <FiSearch className="mx-auto text-muted" size={25} />
                                <p className="mt-3 font-semibold text-foreground">
                                    No courses found
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                    Try another course or topic name.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quiz builder */}
                <QuizBuilder
                    courses={mockCourses}
                    selectedCourseId={selectedCourseId}
                    selectedTopicId={selectedTopicId}
                    scope={scope}
                    questionCount={questionCount}
                    difficulty={difficulty}
                    quizType={quizType}
                    onCourseChange={handleCourseChange}
                    onTopicChange={setSelectedTopicId}
                    onScopeChange={setScope}
                    onQuestionCountChange={setQuestionCount}
                    onDifficultyChange={setDifficulty}
                    onQuizTypeChange={setQuizType}
                    onGenerate={handleGenerate}
                />

                <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-heading text-xl font-bold text-foreground">
                                Previous attempts
                            </h2>
                            <p className="mt-1 text-sm text-muted">
                                Review your recently completed quizzes.
                            </p>
                        </div>
                        <FiClock className="text-brand" size={21} />
                    </div>

                    {attemptHistory.length === 0 ? (
                        <div className="py-10 text-center">
                            <FiBookOpen className="mx-auto text-muted" size={28} />
                            <p className="mt-3 font-semibold text-foreground">
                                No attempts yet
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
                                            {new Date(attempt.completedAt).toLocaleString()}
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Mock confirmation */}
                {notice && (
                    <div
                        role="status"
                        className="flex items-start justify-between gap-3 rounded-xl border border-brand/20 bg-brand-wash p-4"
                    >
                        <div className="flex items-start gap-2">
                            <FiCheckCircle className="mt-0.5 shrink-0 text-brand" />
                            <p className="text-sm text-foreground">{notice}</p>
                        </div>
                        <button
                            onClick={() => setNotice("")}
                            aria-label="Dismiss notification"
                            className="shrink-0 text-muted hover:text-foreground"
                        >
                            <FiX size={17} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
