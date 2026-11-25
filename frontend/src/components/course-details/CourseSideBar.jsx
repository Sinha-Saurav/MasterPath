
import { FiArrowRight, FiBookOpen, FiTrendingUp } from "react-icons/fi";

export function CourseInformation({ course }) {
  const items = [
    { label: "Course Code", value: course.code },
    { label: "Total Topics", value: course.totalTopics },
    { label: "Assessed Topics", value: course.assessedTopics },
    {
      label: "Average Mastery",
      value:
        course.averageMastery === null
          ? "Not assessed"
          : `${course.averageMastery}%`,
    },
  ];

  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <h2 className="mb-3 font-heading text-base font-bold text-foreground">
        Course Information
      </h2>

      <dl className="divide-y divide-border/70">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2.5">
            <dt className="min-w-0 flex-1 text-xs text-muted sm:text-sm">
              {label}
            </dt>
            <dd className="text-right text-xs font-semibold text-foreground sm:text-sm">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function CourseMastery({ mastery = [], onViewProgress }) {
  const visibleMastery = mastery.slice(0, 5);

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
          View Progress
          <FiArrowRight size={14} />
        </button>
      </div>

      {visibleMastery.length === 0 ? (
        <p className="text-sm leading-6 text-muted">
          No topic mastery data is available yet. Attempt quizzes to start
          building your mastery profile.
        </p>
      ) : (
        <div className="space-y-3.5">
          {visibleMastery.map((item) => (
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
                  className="h-full rounded-full bg-brand transition-[width] duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <span className="text-right text-xs font-semibold text-foreground">
                {item.score}%
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function CourseSidebar({
  course,
  mastery,
  onViewProgress,
}) {
  return (
    <aside className="space-y-4">
      <CourseInformation course={course} />
      <CourseMastery
        mastery={mastery}
        onViewProgress={onViewProgress}
      />
    </aside>
  );
}
