
import { FiBookOpen, FiCompass } from "react-icons/fi";

export default function CoursesHero({ activeTab, onTabChange }) {
  return (
    <section className="overflow-hidden rounded-panel border border-brand-soft bg-gradient-to-r from-brand-wash via-brand-soft/60 to-surface">
      <div className="relative px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
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
            Continue learning, explore new courses, and track your progress.
          </p>
        </div>

        <div className="mt-6 flex gap-2 border-b border-brand/10">
          <button
            type="button"
            onClick={() => onTabChange("enrolled")}
            className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition sm:px-6 ${
              activeTab === "enrolled"
                ? "border-b-2 border-brand bg-surface/70 text-brand-hover"
                : "text-muted hover:bg-surface/50 hover:text-foreground"
            }`}
          >
            <FiBookOpen size={16} />
            Enrolled Courses
          </button>

          <button
            type="button"
            onClick={() => onTabChange("explore")}
            className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition sm:px-6 ${
              activeTab === "explore"
                ? "border-b-2 border-brand bg-surface/70 text-brand-hover"
                : "text-muted hover:bg-surface/50 hover:text-foreground"
            }`}
          >
            <FiCompass size={16} />
            Explore Courses
          </button>
        </div>
      </div>
    </section>
  );
}
