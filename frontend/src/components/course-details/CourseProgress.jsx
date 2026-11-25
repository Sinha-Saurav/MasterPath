
import { FiArrowRight, FiCheckCircle, FiBookOpen } from "react-icons/fi";

export default function CourseProgress({
  averageMastery,
  assessedTopics = 0,
  totalTopics = 0,
  onContinue,
}) {
  const value = Math.min(100, Math.max(0, averageMastery ?? 0));
  const unassessedTopics = Math.max(0, totalTopics - assessedTopics);

  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <h2 className="font-heading text-base font-bold text-foreground">
        Your Course Mastery
      </h2>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-5 sm:justify-start">
        <div
          role="progressbar"
          aria-label="Average topic mastery"
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
              {averageMastery === null ? "—" : `${value}%`}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-muted">
            <FiCheckCircle size={15} className="shrink-0 text-brand" />
            <span>
              <strong className="font-semibold text-foreground">
                {assessedTopics}
              </strong>{" "}
              Assessed
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-muted">
            <FiBookOpen size={15} className="shrink-0 text-muted" />
            <span>
              <strong className="font-semibold text-foreground">
                {unassessedTopics}
              </strong>{" "}
              Not assessed
            </span>
          </div>

          <p className="text-xs leading-5 text-muted">
            Average mastery across topics with assessment data.
          </p>
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
