
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    FiClock,
    FiChevronLeft,
    FiChevronRight,
    FiFlag,
    FiCheckCircle,
    FiCircle,
    FiAlertCircle,
    FiX,
    FiBookOpen,
    FiTarget,
    FiRotateCcw,
} from "react-icons/fi";

// --------------------------------------------------
// DEMO QUIZ DATA
// Later this will come from your quiz API.
// --------------------------------------------------

const demoQuiz = {
    id: "dsa-basics",
    title: "Data Structures & Algorithms",
    course: "DSA",
    topic: "Arrays, Linked Lists and Complexity",
    difficulty: "Adaptive",
    duration: 25,
    questions: [
        {
            id: 1,
            question: "What is the time complexity of accessing an element at a given index in an array?",
            options: [
                "O(1)",
                "O(n)",
                "O(log n)",
                "O(n log n)",
            ],
            answer: 0,
            explanation:
                "Arrays provide direct index-based access because elements are stored in contiguous memory locations. Accessing an element by index takes constant time.",
        },
        {
            id: 2,
            question: "Which data structure follows the LIFO principle?",
            options: [
                "Queue",
                "Stack",
                "Linked List",
                "Binary Tree",
            ],
            answer: 1,
            explanation:
                "A stack follows Last In, First Out. The most recently inserted element is removed first.",
        },
        {
            id: 3,
            question: "What is the worst-case time complexity of searching for an element in an unsorted array?",
            options: [
                "O(1)",
                "O(log n)",
                "O(n)",
                "O(n log n)",
            ],
            answer: 2,
            explanation:
                "In the worst case, linear search may need to inspect every element, resulting in O(n) time complexity.",
        },
        {
            id: 4,
            question: "Which operation is generally more efficient in a singly linked list when the node reference is already known?",
            options: [
                "Accessing an element by index",
                "Inserting a node after the known node",
                "Binary searching",
                "Random access",
            ],
            answer: 1,
            explanation:
                "When the node reference is available, insertion after it requires updating a constant number of pointers, making it O(1).",
        },
        {
            id: 5,
            question: "Which data structure is commonly used to implement Breadth-First Search (BFS)?",
            options: [
                "Stack",
                "Priority Queue",
                "Queue",
                "Hash Set",
            ],
            answer: 2,
            explanation:
                "BFS uses a queue to process vertices in the order they are discovered, ensuring level-by-level traversal.",
        },
        {
            id: 6,
            question: "What is the time complexity of binary search on a sorted array?",
            options: [
                "O(n)",
                "O(log n)",
                "O(n²)",
                "O(1)",
            ],
            answer: 1,
            explanation:
                "Binary search halves the remaining search space at each step, resulting in logarithmic time complexity.",
        },
        {
            id: 7,
            question: "Which traversal of a Binary Search Tree produces values in sorted order?",
            options: [
                "Preorder",
                "Postorder",
                "Level order",
                "Inorder",
            ],
            answer: 3,
            explanation:
                "Inorder traversal visits the left subtree, root, and right subtree. For a Binary Search Tree, this produces sorted values.",
        },
        {
            id: 8,
            question: "Which data structure is best suited for implementing an undo operation?",
            options: [
                "Stack",
                "Queue",
                "Graph",
                "Heap",
            ],
            answer: 0,
            explanation:
                "Undo operations typically reverse the most recent action first, which naturally follows the LIFO behavior of a stack.",
        },
        {
            id: 9,
            question: "What is the worst-case time complexity of inserting an element at the beginning of an array of n elements?",
            options: [
                "O(1)",
                "O(log n)",
                "O(n)",
                "O(n²)",
            ],
            answer: 2,
            explanation:
                "Existing elements generally need to be shifted one position to make room at the beginning, requiring O(n) operations.",
        },
        {
            id: 10,
            question: "Which of the following data structures provides average-case O(1) lookup by key?",
            options: [
                "Binary Search Tree",
                "Hash Table",
                "Linked List",
                "Stack",
            ],
            answer: 1,
            explanation:
                "A hash table uses a hash function to map keys to positions, providing average-case constant-time lookup.",
        },
    ],
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function QuizAttempt() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const config = location.state?.config;

    const requestedCount = config?.questionCount ?? 10;

    // The current demo question bank contains 10 questions.
    const availableQuestions = demoQuiz.questions.slice(
        0,
        Math.min(requestedCount, demoQuiz.questions.length)
    );

    const quiz = {
        ...demoQuiz,
        title: config?.scope === "topic"
            ? "Topic Practice Quiz"
            : "Course Practice Quiz",
        course: config?.courseId ?? demoQuiz.course,
        topic: config?.topicId ?? demoQuiz.topic,
        difficulty: config?.difficulty ?? "adaptive",
        quizType: config?.quizType ?? "practice",
        questions: availableQuestions,
        duration: Math.max(5, availableQuestions.length * 2.5),
    };


    const storageKey = `masterpath-quiz-${quizId}`;

    const [timeLeft, setTimeLeft] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            return saved?.timeLeft ?? quiz.duration * 60;
        } catch {
            return quiz.duration * 60;
        }
    });

    
    const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [marked, setMarked] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    
    useEffect(() => {
        if (timeLeft <= 0 || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft((previous) => Math.max(0, previous - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]);
    // Restore unfinished demo attempt.
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);

            if (saved) {
                const parsed = JSON.parse(saved);

                setAnswers(parsed.answers || {});
                setMarked(parsed.marked || []);
                setCurrentIndex(
                    Math.min(
                        parsed.currentIndex || 0,
                        quiz.questions.length - 1
                    )
                );
            }
        } catch {
            localStorage.removeItem(storageKey);
        }
    }, [storageKey, quiz.questions.length]);

    // Save unfinished attempt.
    useEffect(() => {
        if (submitted) return;

        localStorage.setItem(
            storageKey,
            JSON.stringify({
                answers,
                marked,
                currentIndex,
            })
        );
    }, [answers, marked, currentIndex,timeLeft, submitted, storageKey]);

    const currentQuestion = quiz.questions[currentIndex];

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = quiz.questions.length - answeredCount;
    const markedCount = marked.length;

    const progress = (answeredCount / quiz.questions.length) * 100;

    const result = useMemo(() => {
        const correct = quiz.questions.filter(
            (question) => answers[question.id] === question.answer
        ).length;

        return {
            correct,
            incorrect: answeredCount - correct,
            unanswered: quiz.questions.length - answeredCount,
            score: Math.round((correct / quiz.questions.length) * 100),
        };
    }, [answers, answeredCount, quiz.questions]);

    function selectAnswer(optionIndex) {
        setAnswers((previous) => ({
            ...previous,
            [currentQuestion.id]: optionIndex,
        }));
    }

    function toggleMark() {
        setMarked((previous) =>
            previous.includes(currentQuestion.id)
                ? previous.filter((id) => id !== currentQuestion.id)
                : [...previous, currentQuestion.id]
        );
    }

    function submitQuiz() {
  const correct = quiz.questions.filter(
    (question) => answers[question.id] === question.answer
  ).length;

  const score = Math.round(
    (correct / quiz.questions.length) * 100
  );

  const result = {
    quiz,
    questions: quiz.questions,
    answers,
  };

  const history = JSON.parse(
    localStorage.getItem("masterpath-quiz-history") || "[]"
  );

  history.unshift({
    id: `${quizId}-${Date.now()}`,
    quizId,
    title: quiz.title,
    course: quiz.course,
    topic: quiz.topic,
    score,
    correct,
    total: quiz.questions.length,
    completedAt: new Date().toISOString(),
  });

  localStorage.setItem(
    "masterpath-quiz-history",
    JSON.stringify(history)
  );

  localStorage.removeItem(storageKey);

  setSubmitted(true);

  navigate(`/quizzes/${quizId}/results`, {
    state: { result },
  });
}

    function goToQuestion(index) {
        if (index >= 0 && index < quiz.questions.length) {
            setCurrentIndex(index);
        }
    }


    return (
        <div className="min-h-screen bg-app px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Quiz heading */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <button
                            onClick={() => navigate("/quizzes")}
                            className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-brand"
                        >
                            <FiChevronLeft />
                            Back to quizzes
                        </button>

                        <h1 className="font-heading text-2xl font-bold text-foreground">
                            {quiz.title}
                        </h1>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                            <span>{quiz.course}</span>
                            <span>·</span>
                            <span>{quiz.topic}</span>
                            <span>·</span>
                            <span>{quiz.difficulty}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                        <FiClock className="text-brand" size={19} />
                        <div>
                            <p className="text-xs text-muted">Estimated duration</p>
                            <p className="font-semibold text-foreground">
                                {quiz.duration} minutes
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 rounded-xl border p-3 ${timeLeft <= 60
                            ? "border-error/30 bg-error/5 text-error"
                            : "border-border bg-surface text-foreground"
                        }`}>
                        <FiClock size={19} />
                        <div>
                            <p className="text-xs text-muted">Time remaining</p>
                            <p className="font-heading text-lg font-bold tabular-nums">
                                {formattedTime}
                            </p>
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
                                {answeredCount} of {quiz.questions.length} questions answered
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

                {/* Main quiz layout */}
                <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">

                    {/* Question */}
                    <main className="rounded-panel border border-border bg-surface p-5 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-lg bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                                Question {currentIndex + 1} of {quiz.questions.length}
                            </span>

                            <button
                                onClick={toggleMark}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${marked.includes(currentQuestion.id)
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
                            {currentQuestion.question}
                        </h2>

                        <p className="mt-3 text-sm text-muted">
                            Select one correct answer.
                        </p>

                        <div className="mt-7 space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const selected =
                                    answers[currentQuestion.id] === index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectAnswer(index)}
                                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${selected
                                            ? "border-brand bg-brand-wash"
                                            : "border-border hover:border-brand/40 hover:bg-app"
                                            }`}
                                    >
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${selected
                                            ? "bg-brand text-white"
                                            : "bg-app text-muted"
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                        </span>

                                        <span className={`flex-1 text-sm ${selected
                                            ? "font-semibold text-foreground"
                                            : "text-foreground"
                                            }`}>
                                            {option}
                                        </span>

                                        {selected && (
                                            <FiCheckCircle className="shrink-0 text-brand" size={19} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row">
                            <button
                                onClick={() => goToQuestion(currentIndex - 1)}
                                disabled={currentIndex === 0}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted transition hover:bg-app disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft />
                                Previous
                            </button>

                            {currentIndex < quiz.questions.length - 1 ? (
                                <button
                                    onClick={() => goToQuestion(currentIndex + 1)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
                                >
                                    Next question
                                    <FiChevronRight />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
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
                            {quiz.questions.map((question, index) => {
                                const isAnswered = answers[question.id] !== undefined;
                                const isMarked = marked.includes(question.id);
                                const isCurrent = currentIndex === index;

                                return (
                                    <button
                                        key={question.id}
                                        onClick={() => goToQuestion(index)}
                                        aria-label={`Go to question ${index + 1}`}
                                        className={`relative flex h-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${isCurrent
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
                            className="mt-5 w-full rounded-xl border border-brand/30 py-3 text-sm font-semibold text-brand transition hover:bg-brand-wash"
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
                    onClick={() => setShowSubmitModal(false)}
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

                        <h2 id="submit-title" className="mt-4 font-heading text-xl font-bold text-foreground">
                            Submit your quiz?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            You have answered {answeredCount} out of {quiz.questions.length} questions.
                            {unansweredCount > 0 &&
                                ` ${unansweredCount} questions are still unanswered.`}
                        </p>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted hover:bg-app"
                            >
                                Continue quiz
                            </button>

                            <button
                                onClick={submitQuiz}
                                className="flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
                            >
                                Submit now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
