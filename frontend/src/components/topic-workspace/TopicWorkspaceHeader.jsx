
import {
  FiArrowLeft,
  FiBarChart2,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function TopicWorkspaceHeader({ courseId, topic }) {
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
          {topic.courseName}
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
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {topic.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <FiClock /> {topic.duration} minutes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiBarChart2 /> {topic.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full rounded-xl bg-brand-wash p-4 sm:max-w-[220px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              Topic progress
            </span>
            <span className="font-heading text-lg font-bold text-brand">
              {topic.progress}%
            </span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-label="Topic progress"
            aria-valuenow={topic.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${topic.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {topic.status === "completed"
              ? "Topic completed"
              : "Keep learning to make progress"}
          </p>
        </div>
      </div>
    </section>
  );
}
