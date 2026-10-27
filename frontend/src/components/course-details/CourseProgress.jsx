
import {
  FiArrowRight,
  FiCheckCircle,
  FiCircle,
  FiClock,
} from "react-icons/fi";

export default function CourseProgress({
  progress = 85,
  completedTopics = 24,
  inProgressTopics = 4,
  notStartedTopics = 0,
  onContinue,
}) {
  const value = Math.min(100, Math.max(0, progress));

  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <h2 className="font-heading text-base font-bold text-foreground">
        Your Progress
      </h2>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-5 sm:justify-start">
        <div
          role="progressbar"
          aria-label="Course completion"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-brand) ${value}%, var(--color-brand-soft) ${value}% 100%)`,
          }}
        >
          <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-surface">
            <span className="font-heading text-2xl font-bold text-foreground">
              {value}%
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <ProgressLegend
            icon={FiCheckCircle}
            value={completedTopics}
            label="Completed"
            color="text-brand"
          />
          <ProgressLegend
            icon={FiClock}
            value={inProgressTopics}
            label="In Progress"
            color="text-brand/70"
          />
          <ProgressLegend
            icon={FiCircle}
            value={notStartedTopics}
            label="Not Started"
            color="text-muted"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover"
      >
        Continue Learning
        <FiArrowRight size={17} />
      </button>
    </section>
  );
}

function ProgressLegend({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted">
      <Icon size={15} className={`shrink-0 ${color}`} />
      <span>
        <strong className="font-semibold text-foreground">{value}</strong>{" "}
        {label}
      </span>
    </div>
  );
}
