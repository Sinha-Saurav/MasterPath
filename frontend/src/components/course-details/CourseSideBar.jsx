
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiCheckSquare,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiMonitor,
  FiMoreHorizontal,
  FiTrendingUp,
} from "react-icons/fi";

const defaultMastery = [
  { name: "Arrays", score: 90, color: "bg-brand" },
  { name: "Linked Lists", score: 70, color: "bg-info" },
  { name: "Stacks & Queues", score: 60, color: "bg-success" },
  { name: "Trees", score: 40, color: "bg-warning" },
  { name: "Graphs", score: 20, color: "bg-error" },
];

const defaultSteps = [
  {
    id: "continue-topic",
    title: "Continue Sliding Window",
    description: "Complete the current topic",
    icon: FiMonitor,
    style: "bg-success/10 text-success",
    action: "continue",
  },
  {
    id: "take-quiz",
    title: "Take Arrays - Quiz 3",
    description: "Test your understanding",
    icon: FiCheckSquare,
    style: "bg-error/10 text-error",
    action: "quiz",
  },
  {
    id: "read-notes",
    title: "Read Notes",
    description: "Review key concepts",
    icon: FiFileText,
    style: "bg-info/10 text-info",
    action: "notes",
  },
];

export function CourseInformation({
  course = {},
  onMenu,
}) {
  const items = [
    {
      label: "Total Topics",
      value: course.totalTopics ?? 28,
      icon: FiCalendar,
    },
    {
      label: "Total Quizzes",
      value: course.totalQuizzes ?? 12,
      icon: FiCheckSquare,
    },
    {
      label: "Difficulty Level",
      value: course.difficulty ?? "Beginner to Advanced",
      icon: FiBookOpen,
    },
    {
      label: "Estimated Time",
      value: course.estimatedTime ?? "6–8 Weeks",
      icon: FiClock,
    },
    {
      label: "Last Accessed",
      value: course.lastActivity ?? "2 days ago",
      icon: FiClock,
    },
    {
      label: "Completion Rate",
      value: `${course.progress ?? 85}%`,
      icon: FiTrendingUp,
    },
  ];

  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-bold text-foreground">
          Course Information
        </h2>

        <button
          type="button"
          onClick={onMenu}
          aria-label="Course information options"
          className="rounded-lg p-1 text-brand-hover hover:bg-brand-wash"
        >
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      <dl className="divide-y divide-border/70">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 py-2.5"
          >
            <Icon size={16} className="shrink-0 text-muted" />

            <dt className="min-w-0 flex-1 text-xs text-muted sm:text-sm">
              {label}
            </dt>

            <dd className="max-w-[58%] text-right text-xs font-semibold text-foreground sm:text-sm">
              {label === "Difficulty Level" ? (
                <span className="inline-block rounded-lg bg-brand-soft px-2 py-1 font-medium text-brand-hover">
                  {value}
                </span>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function CourseMastery({
  mastery = defaultMastery,
  onViewProgress,
}) {
  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-base font-bold text-foreground">
          Your Mastery
        </h2>

        <button
          type="button"
          onClick={onViewProgress}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-hover hover:text-brand"
        >
          View Detailed Progress
          <FiArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-3.5">
        {mastery.map((item) => (
          <div
            key={item.name}
            className="grid grid-cols-[minmax(90px,0.8fr)_minmax(0,1.3fr)_36px] items-center gap-2"
          >
            <span className="truncate text-xs text-foreground">
              {item.name}
            </span>

            <div
              className="h-2 overflow-hidden rounded-full bg-brand-soft/70"
              role="progressbar"
              aria-label={`${item.name} mastery`}
              aria-valuenow={item.score}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${item.color}`}
                style={{
                  width: `${Math.min(100, Math.max(0, item.score))}%`,
                }}
              />
            </div>

            <span className="text-right text-xs font-semibold text-foreground">
              {item.score}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecommendedNextSteps({
  steps = defaultSteps,
  onAction,
}) {
  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <h2 className="mb-4 font-heading text-base font-bold text-foreground">
        Recommended Next Steps
      </h2>

      <div className="space-y-2">
        {steps.map((step) => {
          const Icon = step.icon || FiBookOpen;

          return (
            <button
              type="button"
              key={step.id}
              onClick={() => onAction?.(step.action, step)}
              className="group flex w-full items-center gap-3 rounded-xl border border-border p-2.5 text-left transition hover:border-brand/40 hover:bg-brand-wash/50"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.style || "bg-brand-soft text-brand-hover"}`}
              >
                <Icon size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-muted">
                  {step.description}
                </p>
              </div>

              <FiChevronRight
                size={17}
                className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function CourseSidebar({
  course,
  mastery,
  steps,
  onContinue,
  onViewProgress,
  onStepAction,
  onCourseMenu,
}) {
  return (
    <aside className="space-y-4">
      <CourseInformation
        course={course}
        onMenu={onCourseMenu}
      />

      <CourseMastery
        mastery={mastery}
        onViewProgress={onViewProgress}
      />

      <RecommendedNextSteps
        steps={steps}
        onAction={onStepAction}
      />
    </aside>
  );
}
