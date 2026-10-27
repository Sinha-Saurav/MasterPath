
import {
  FiBookOpen,
  FiCloud,
  FiDatabase,
  FiGitBranch,
  FiMonitor,
  FiSettings,
  FiMoreHorizontal,
  FiPlay,
} from "react-icons/fi";

const iconMap = {
  dsa: FiBookOpen,
  dbms: FiDatabase,
  os: FiMonitor,
  networks: FiGitBranch,
  software: FiSettings,
  cloud: FiCloud,
};

export default function CourseCard({ course, onContinue, onMenu }) {
  const Icon = iconMap[course.icon] || FiBookOpen;

  return (
    <article className="group min-w-0 rounded-card border border-border bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${course.iconBg} ${course.iconColor}`}
        >
          <Icon size={32} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {course.category}
          </p>
          <h3 className="font-heading text-sm font-bold leading-5 text-foreground">
            {course.name}
          </h3>
        </div>

        <button
          type="button"
          aria-label={`More options for ${course.name}`}
          onClick={() => onMenu?.(course)}
          className="shrink-0 rounded-lg p-1 text-muted transition hover:bg-brand-wash hover:text-brand-hover"
        >
          <FiMoreHorizontal size={19} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {course.completedTopics}/{course.totalTopics} topics
        </span>
        <span className="text-xs font-bold text-foreground">
          {course.progress}%
        </span>
      </div>

      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-border/70"
        role="progressbar"
        aria-label={`${course.name} progress`}
        aria-valuenow={course.progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${course.progressColor}`}
          style={{ width: `${course.progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => onContinue(course)}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-focus"
      >
        <FiPlay size={15} />
        Continue Learning
      </button>
    </article>
  );
}
