
import {
  FiArrowLeft,
  FiBarChart2,
  FiChevronRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function TopicWorkspaceHeader({
  courseId,
  courseName,
  topic,
}) {
  return (
    <section className="space-y-4">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        <Link to="/courses" className="hover:text-brand">
          My Courses
        </Link>

        <FiChevronRight />

        <Link
          to={`/courses/${courseId}`}
          className="hover:text-brand"
        >
          {courseName}
        </Link>

        <FiChevronRight />

        <span className="text-foreground">{topic.title}</span>
      </nav>

      <div className="flex flex-col gap-4 rounded-panel border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to={`/courses/${courseId}`}
            aria-label="Back to course"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-brand-wash"
          >
            <FiArrowLeft />
          </Link>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {topic.category}
            </p>

            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {topic.title}
            </h1>

            <p className="mt-2 text-sm text-muted">
              Learn this topic through curated learning resources.
            </p>
          </div>
        </div>

        <div className="w-full rounded-xl bg-brand-wash p-4 sm:max-w-[220px]">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FiBarChart2 className="text-brand" />
              Topic mastery
            </span>

            <span className="font-heading text-lg font-bold text-brand">
              {topic.masteryScore === null
                ? "—"
                : `${topic.masteryScore}%`}
            </span>
          </div>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-label="Topic mastery"
            aria-valuenow={topic.masteryScore ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{
                width: `${topic.masteryScore ?? 0}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-muted">
            {topic.masteryScore === null
              ? "Not assessed yet"
              : `${topic.attempts} assessment attempts`}
          </p>
        </div>
      </div>
    </section>
  );
}
