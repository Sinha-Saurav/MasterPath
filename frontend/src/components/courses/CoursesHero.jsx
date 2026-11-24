
import { FiBookOpen } from "react-icons/fi";

export default function CoursesHero() {
  return (
    <section className="overflow-hidden rounded-panel border border-brand-soft bg-gradient-to-r from-brand-wash via-brand-soft/60 to-surface">
      <div className="relative px-5 py-6 sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full bg-brand/10" />
        <div className="pointer-events-none absolute right-20 top-16 h-24 w-24 rounded-full bg-brand/10 blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1 text-xs font-semibold text-brand-hover">
            <FiBookOpen size={14} />
            YOUR LEARNING LIBRARY
          </span>

          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Courses
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
            Continue learning and track your progress across your enrolled courses.
          </p>
        </div>
      </div>
    </section>
  );
}
