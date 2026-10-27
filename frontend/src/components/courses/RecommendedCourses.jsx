
import { FiArrowRight, FiBarChart2, FiCloud, FiChevronRight } from "react-icons/fi";

const recommendations = [
  {
    id: "ml-fundamentals",
    title: "Machine Learning Fundamentals",
    description: "Learn core ML concepts and build real-world intuition.",
    topics: 18,
    level: "Beginner",
    icon: FiBarChart2,
    iconStyle: "bg-error/10 text-error",
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing Basics",
    description: "Understand cloud platforms, deployment and scalability.",
    topics: 12,
    level: "Beginner",
    icon: FiCloud,
    iconStyle: "bg-info/10 text-info",
  },
];

export default function RecommendedCourses({
  courses = recommendations,
  onSelect,
  onViewAll,
}) {
  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
          Recommended for you
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-hover transition hover:text-brand"
        >
          View all
          <FiArrowRight size={15} />
        </button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => {
          const Icon = course.icon || FiCloud;

          return (
            <button
              type="button"
              key={course.id}
              onClick={() => onSelect?.(course)}
              className="group flex w-full items-start gap-3 rounded-card border border-border p-3 text-left transition hover:border-brand/40 hover:bg-brand-wash/50"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${course.iconStyle || "bg-brand-soft text-brand-hover"}`}
              >
                <Icon size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold leading-5 text-foreground">
                  {course.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted">
                  {course.description}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-brand-soft px-2 py-1 text-[10px] font-medium text-brand-hover">
                    {course.topics} topics
                  </span>

                  <span className="rounded-lg bg-success/10 px-2 py-1 text-[10px] font-medium text-success">
                    {course.level}
                  </span>
                </div>
              </div>

              <FiChevronRight
                size={18}
                className="mt-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand"
              />
            </button>
          );
        })}

        {courses.length === 0 && (
          <div className="rounded-card bg-app px-4 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              No recommendations yet
            </p>
            <p className="mt-1 text-xs text-muted">
              Check back as your learning journey progresses.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
