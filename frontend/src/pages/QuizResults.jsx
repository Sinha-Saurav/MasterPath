
import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiRotateCcw,
  FiTarget,
  FiTrendingUp,
  FiBookOpen,
  FiAward,
} from "react-icons/fi";

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
  const location = useLocation();
  const { quizId } = useParams();

  const result = location.state?.result;

  // Results are passed through navigation state for the demo.
  // Backend integration will replace this with fetched results.
  if (!result) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-app px-4">
        <div className="max-w-md rounded-panel border border-border bg-surface p-8 text-center">
          <FiAlertCircle className="mx-auto text-warning" size={32} />
          <h1 className="mt-4 font-heading text-xl font-bold text-foreground">
            Results unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            We couldn't find this quiz attempt. Complete a quiz first to view its results.
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

  const { quiz, questions, answers } = result;

  const correctCount = questions.filter(
    (question) => answers[question.id] === question.answer
  ).length;

  const answeredCount = Object.keys(answers).length;
  const incorrectCount = answeredCount - correctCount;
  const unansweredCount = questions.length - answeredCount;

  const score = Math.round((correctCount / questions.length) * 100);

  const performanceLabel = getPerformanceLabel(score);

  // Demo topic-level performance.
  // Replace with actual topic mastery data from backend later.
  const topicPerformance = [
    { name: "Arrays", correct: 3, total: 3 },
    { name: "Linked Lists", correct: 1, total: 2 },
    { name: "Stacks and Queues", correct: 1, total: 2 },
    { name: "Searching and Trees", correct: 0, total: 3 },
  ];

  const reviewQuestions = questions;

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
              {quiz.title} · {quiz.course}
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
                  <span className="mt-1 text-xs text-muted">Your score</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-brand">
                <FiAward size={22} />
                <span className="text-sm font-semibold">Assessment completed</span>
              </div>

              <h2 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {performanceLabel}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                You answered {correctCount} out of {questions.length} questions correctly.
                Review your answers below to understand where you can improve.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/quizzes/${quizId}/attempt`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
                >
                  <FiRotateCcw size={16} />
                  Retry quiz
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
            value={questions.length}
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

        {/* Topic performance */}
        <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <FiTarget size={19} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Topic performance
              </h2>
              <p className="mt-1 text-xs text-muted">
                A demo breakdown of your performance across topics.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {topicPerformance.map((topic) => {
              const percentage = Math.round(
                (topic.correct / topic.total) * 100
              );

              return (
                <div key={topic.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {topic.name}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {percentage}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-brand-soft">
                    <div
                      className={`h-full rounded-full ${
                        percentage < 50
                          ? "bg-error"
                          : percentage < 75
                            ? "bg-warning"
                            : "bg-brand"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    {topic.correct} of {topic.total} correct
                  </p>
                </div>
              );
            })}
          </div>
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
            {reviewQuestions.map((question, index) => {
              const selected = answers[question.id];
              const isCorrect = selected === question.answer;
              const isUnanswered = selected === undefined;

              return (
                <article
                  key={question.id}
                  className="rounded-xl border border-border p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="flex-1 text-sm font-semibold leading-6 text-foreground">
                      <span className="mr-2 text-muted">
                        Q{index + 1}.
                      </span>
                      {question.question}
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
                    {question.options.map((option, optionIndex) => {
                      const isAnswer = optionIndex === question.answer;
                      const isSelected = optionIndex === selected;

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
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className="flex-1">{option}</span>

                          {isAnswer && <FiCheckCircle size={17} />}
                          {!isAnswer && isSelected && <FiXCircle size={17} />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl bg-app p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Explanation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {question.explanation}
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
