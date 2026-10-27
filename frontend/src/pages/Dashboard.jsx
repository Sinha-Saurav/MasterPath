
import {
  FiActivity,
  FiArrowUpRight,
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiPlay,
  FiPlus,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const courses = [
  {
    name: "Data Structures & Algorithms",
    progress: 85,
    topics: "24 of 28 topics",
    initials: "DS",
    color: "text-brand-hover",
    background: "bg-brand-soft",
  },
  {
    name: "Database Management Systems",
    progress: 70,
    topics: "16 of 23 topics",
    initials: "DB",
    color: "text-info",
    background: "bg-info/10",
  },
  {
    name: "Operating Systems",
    progress: 60,
    topics: "15 of 25 topics",
    initials: "OS",
    color: "text-success",
    background: "bg-success/10",
  },
];

const tasks = [
  {
    title: "Revise Binary Search",
    detail: "DSA · Practice",
    time: "20 min",
  },
  {
    title: "Complete SQL Joins quiz",
    detail: "DBMS · Quiz",
    time: "15 min",
  },
  {
    title: "Review Process Scheduling",
    detail: "Operating Systems",
    time: "25 min",
  },
];

function SectionHeading({ title, action, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
        {title}
      </h2>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-hover hover:text-brand"
        >
          {action}
          <FiChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, tint, iconColor }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint} ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">{detail}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-panel bg-gradient-to-br from-brand to-brand-hover p-6 text-white sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-1/4 h-56 w-56 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white/90">
            <FiZap size={13} />
            YOUR PERSONAL LEARNING SPACE
          </span>

          <h1 className="mt-5 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            Keep going, you're making progress!
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
            Every topic you master brings you closer to your goals.
            Let's make today count.
          </p>

          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-surface px-4 text-sm font-semibold text-brand-hover shadow-sm transition hover:bg-brand-wash"
          >
            Continue learning
            <FiArrowUpRight size={17} />
          </button>
        </div>
      </section>

      {/* Page heading */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">
            YOUR LEARNING SPACE
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Your learning overview
          </h2>
          <p className="mt-1 text-sm text-muted">
            Here's a snapshot of your learning journey.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/courses/explore")}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground transition hover:border-brand"
        >
          <FiPlus size={16} />
          Explore courses
        </button>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FiBookOpen}
          label="Enrolled courses"
          value="5"
          detail="Keep building your knowledge"
          tint="bg-brand-soft"
          iconColor="text-brand-hover"
        />
        <StatCard
          icon={FiTarget}
          label="Overall progress"
          value="72%"
          detail="Across your learning journey"
          tint="bg-info/10"
          iconColor="text-info"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Quizzes completed"
          value="18"
          detail="Practice makes progress"
          tint="bg-success/10"
          iconColor="text-success"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Study streak"
          value="7 days"
          detail="Consistency is your superpower"
          tint="bg-warning/10"
          iconColor="text-warning"
        />
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
        <div className="min-w-0 space-y-7">
          {/* Courses */}
          <section>
            <SectionHeading
              title="Continue learning"
              action="All courses"
              onAction={() => navigate("/courses")}
            />

            <div className="space-y-3">
              {courses.map((course) => (
                <button
                  type="button"
                  key={course.name}
                  onClick={() => navigate("/courses")}
                  className="group flex w-full items-center gap-4 rounded-card border border-border bg-surface p-4 text-left transition hover:border-brand/50 hover:shadow-sm sm:p-5"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${course.background} ${course.color}`}>
                    {course.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-foreground">
                          {course.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted">
                          {course.topics}
                        </p>
                      </div>

                      <span className={`text-sm font-bold ${course.color}`}>
                        {course.progress}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-wash">
                      <div
                        className={`h-full rounded-full ${
                          course.initials === "DS"
                            ? "bg-brand"
                            : course.initials === "DB"
                              ? "bg-info"
                              : "bg-success"
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <FiChevronRight
                    size={19}
                    className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-hover"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Tasks */}
          <section>
            <SectionHeading
              title="Your next steps"
              action="View planner"
              onAction={() => navigate("/planner")}
            />

            <div className="overflow-hidden rounded-card border border-border bg-surface">
              {tasks.map((task, index) => (
                <div
                  key={task.title}
                  className={`flex items-center gap-3 p-4 sm:px-5 ${
                    index !== tasks.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-wash text-brand">
                    <FiCheckCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">{task.detail}</p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                    <FiClock size={13} />
                    {task.time}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI tutor */}
          <section className="overflow-hidden rounded-panel border border-border bg-surface">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
                  <FiZap size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    AI Study Companion
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Get help when you need it
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted">
                Stuck on a concept? Ask questions, explore examples, and
                strengthen your understanding.
              </p>

              <button
                type="button"
                onClick={() => navigate("/ai-tutor")}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                <FiPlay size={15} />
                Open AI Tutor
              </button>
            </div>

            <div className="p-5">
              <p className="mb-3 text-xs font-semibold text-foreground">
                Try asking
              </p>

              {[
                "Explain normalization simply",
                "Help me understand binary search",
                "Quiz me on operating systems",
              ].map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => navigate("/ai-tutor")}
                  className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-left text-xs text-muted transition hover:border-brand hover:bg-brand-wash"
                >
                  <span>{prompt}</span>
                  <FiArrowUpRight size={15} className="shrink-0" />
                </button>
              ))}
            </div>
          </section>

          {/* Weekly goal */}
          <section className="rounded-panel border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Weekly study goal
              </h3>
              <FiTarget size={19} className="text-brand" />
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  4.5
                  <span className="text-base font-medium text-muted">
                    /7 hrs
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  You're making good progress!
                </p>
              </div>

              <span className="rounded-lg bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                64%
              </span>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-brand-wash">
              <div className="h-full w-[64%] rounded-full bg-brand" />
            </div>

            <div className="mt-4 flex justify-between text-[10px] font-medium text-muted">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      index < 4
                        ? "bg-brand-soft text-brand-hover"
                        : "bg-brand-wash text-muted"
                    }`}
                  >
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Motivation */}
          <section className="rounded-panel border border-border bg-gradient-to-br from-surface to-brand-wash p-5">
            <p className="text-xs font-semibold text-brand-hover">
              A LITTLE REMINDER
            </p>

            <p className="mt-3 font-heading text-base font-semibold leading-6 text-foreground">
              Progress isn't about knowing everything. It's about learning
              something new every day.
            </p>

            <p className="mt-3 text-xs text-muted">
              Keep showing up for yourself.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
