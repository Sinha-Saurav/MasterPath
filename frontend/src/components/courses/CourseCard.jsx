
import {
  FiBookOpen,
  FiCloud,
  FiDatabase,
  FiGitBranch,
  FiMonitor,
  FiSettings,
  FiPlay,
  FiLogOut,
  FiLoader,
} from "react-icons/fi";

const iconMap = {
  dsa: FiBookOpen,
  dbms: FiDatabase,
  os: FiMonitor,
  networks: FiGitBranch,
  software: FiSettings,
  cloud: FiCloud,
};

export default function CourseCard({
  course,
  onContinue,
  onDeEnroll,
  isDeEnrolling = false,
}) {
  const Icon = iconMap[course.icon] || FiBookOpen;

  return (
    <article className="group min-w-0 rounded-card border border-border bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
            course.iconBg || "bg-brand-soft"
          } ${course.iconColor || "text-brand-hover"}`}
        >
          <Icon size={32} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {course.code}
          </p>

          <h3 className="font-heading text-sm font-bold leading-5 text-foreground">
            {course.name}
          </h3>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {course.topic_count ?? 0} Topics
        </span>

        <span className="text-xs font-semibold text-brand-hover">
          Enrolled
        </span>
      </div>

      {/* Continue learning */}
      <button
        type="button"
        onClick={() => onContinue(course)}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-focus"
      >
        <FiPlay size={15} />
        Continue Learning
      </button>

      {/* De-enroll */}
      <button
        type="button"
        onClick={() => onDeEnroll(course)}
        disabled={isDeEnrolling}
        className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-3 text-xs font-medium text-muted transition hover:border-danger/40 hover:bg-danger/5 hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeEnrolling ? (
          <>
            <FiLoader className="animate-spin" size={14} />
            De-enrolling...
          </>
        ) : (
          <>
            <FiLogOut size={14} />
            De-enroll
          </>
        )}
      </button>
    </article>
  );
}
