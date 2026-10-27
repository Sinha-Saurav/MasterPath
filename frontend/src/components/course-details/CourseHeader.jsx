
import { Link } from "react-router-dom";
import { FiBookOpen, FiChevronRight, FiLayers } from "react-icons/fi";

export default function CourseHeader({ course }) {
  const completed = course.completedTopics ?? 24;
  const total = course.totalTopics ?? 28;

  const tags = course.tags ?? [
    "DSA",
    "Problem Solving",
    "Programming",
    "Beginner to Advanced",
  ];

  return (
    <section className="relative overflow-hidden rounded-panel border border-brand-soft bg-gradient-to-br from-brand-wash via-brand-soft/60 to-surface">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 text-xs text-muted sm:px-7">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 hover:text-brand-hover"
        >
          <FiBookOpen size={14} />
          My Courses
        </Link>
        <FiChevronRight size={14} />
        <span className="truncate font-medium text-foreground">
          {course.name}
        </span>
      </div>

      <div className="relative p-5 pt-4 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-8 h-48 w-48 rounded-full bg-brand/10" />
        <div className="pointer-events-none absolute right-24 top-12 h-24 w-24 rounded-full bg-brand/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-panel bg-brand-soft text-brand-hover sm:h-24 sm:w-24">
            <FiLayers size={46} strokeWidth={1.5} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {course.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted sm:text-sm">
              <span className="rounded-lg bg-success/10 px-2.5 py-1 font-semibold text-success">
                Enrolled
              </span>
              <span>{completed}/{total} topics</span>
              <span className="hidden text-border sm:inline">•</span>
              <span>Last activity {course.lastActivity ?? "2 days ago"}</span>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
              {course.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-brand-soft bg-surface/70 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
