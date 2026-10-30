
import { useState } from "react";
import {
  FiActivity,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiZap,
  FiAlertCircle,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

import {
  mockProgressStats,
  weeklyActivity,
  monthlyActivity,
  weeklyQuizPerformance,
  monthlyQuizPerformance,
  mockCourseMastery,
  mockLearningHistory,
  mockLearningInsights,
} from "../data/mockProgress";

const iconMap = {
  quiz: FiCheckCircle,
  clock: FiClock,
  target: FiTarget,
  activity: FiActivity,
};

function SectionHeading({ title, description, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs text-muted sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function StatCard({ item }) {
  const Icon = iconMap[item.icon];

  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">{item.label}</p>
          <p className="mt-2 font-heading text-2xl font-bold text-foreground">
            {item.value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">{item.detail}</p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  data,
  dataKey,
  color,
  type = "bar",
  filter,
  onFilterChange,
  suffix = "",
}) {
  const Chart = type === "line" ? LineChart : BarChart;

  return (
    <section className="min-w-0 rounded-card border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>

        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-foreground outline-none focus:border-brand"
        >
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      <div className="mt-6 h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              width={35}
              tickFormatter={(value) => `${value}${suffix}`}
            />
            <Tooltip
              cursor={{ fill: "var(--color-brand-wash)" }}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value) => [
                `${value}${suffix}`,
                type === "line" ? "Score" : "Study hours",
              ]}
            />

            {type === "line" ? (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: color,
                  strokeWidth: 2,
                  stroke: "var(--color-surface)",
                }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function CourseMastery() {
  const [expandedCourse, setExpandedCourse] = useState("dsa");

  const toggleCourse = (courseId) => {
    setExpandedCourse((current) =>
      current === courseId ? null : courseId
    );
  };

  return (
    <section>
      <SectionHeading
        title="Course-wise mastery"
        description="Explore your understanding of individual topics."
      />

      <div className="space-y-3">
        {mockCourseMastery.map((course) => {
          const isExpanded = expandedCourse === course.id;

          return (
            <div
              key={course.id}
              className="overflow-hidden rounded-card border border-border bg-surface"
            >
              <button
                type="button"
                onClick={() => toggleCourse(course.id)}
                aria-expanded={isExpanded}
                className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-brand-wash/40 sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xs font-bold text-brand-hover">
                  {course.shortName}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {course.name}
                    </h3>
                    <span className="text-sm font-bold text-brand-hover">
                      {course.mastery}%
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    {course.masteredTopics} of {course.totalTopics} topics mastered
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-wash">
                    <div
                      className={`h-full rounded-full ${course.color}`}
                      style={{ width: `${course.mastery}%` }}
                    />
                  </div>
                </div>

                {isExpanded ? (
                  <FiChevronDown className="shrink-0 text-muted" />
                ) : (
                  <FiChevronRight className="shrink-0 text-muted" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-border bg-app/50 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">
                      Topic mastery
                    </p>
                    <span className="text-[11px] text-muted">
                      {course.topics.length} topics shown
                    </span>
                  </div>

                  <div className="space-y-4">
                    {course.topics.map((topic) => (
                      <div key={topic.name}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-foreground">
                            {topic.name}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              topic.mastery >= 75
                                ? "text-success"
                                : topic.mastery >= 50
                                  ? "text-warning"
                                  : "text-error"
                            }`}
                          >
                            {topic.mastery}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-brand-wash">
                          <div
                            className={`h-full rounded-full ${
                              topic.mastery >= 75
                                ? "bg-success"
                                : topic.mastery >= 50
                                  ? "bg-warning"
                                  : "bg-error"
                            }`}
                            style={{ width: `${topic.mastery}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LearningInsights() {
  return (
    <section>
      <SectionHeading
        title="Learning insights"
        description="Identify what's going well and where to focus next."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mockLearningInsights.map((insight) => {
          const isStrong = insight.type === "strong";

          return (
            <div
              key={insight.title}
              className="rounded-card border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                {isStrong ? (
                  <FiAward className="text-success" size={18} />
                ) : (
                  <FiAlertCircle className="text-warning" size={18} />
                )}
                <p className="text-xs font-semibold text-muted">
                  {insight.title}
                </p>
              </div>

              <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                {insight.topic}
              </h3>
              <p className="mt-1 text-xs text-muted">{insight.course}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">Mastery level</span>
                <span className="text-sm font-bold text-foreground">
                  {insight.mastery}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-wash">
                <div
                  className={`h-full rounded-full ${
                    isStrong ? "bg-success" : "bg-warning"
                  }`}
                  style={{ width: `${insight.mastery}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LearningHistory() {
  const [showAll, setShowAll] = useState(false);

  const visibleHistory = showAll
    ? mockLearningHistory
    : mockLearningHistory.slice(0, 4);

  return (
    <section>
      <SectionHeading
        title="Learning history"
        description="A record of your recent learning activities."
        action={
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-brand-hover hover:text-brand"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        }
      />

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {visibleHistory.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-4 ${
              index !== visibleHistory.length - 1
                ? "border-b border-border"
                : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
              {item.type === "Quiz" ? (
                <FiCheckCircle size={17} />
              ) : (
                <FiBookOpen size={17} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-1 truncate text-xs text-muted">
                {item.course} · {item.date}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                item.result === "Mastered"
                  ? "bg-success/10 text-success"
                  : "bg-brand-soft text-brand-hover"
              }`}
            >
              {item.result}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Progress() {
  const [activityFilter, setActivityFilter] = useState("week");
  const [quizFilter, setQuizFilter] = useState("week");

  const activityData =
    activityFilter === "week" ? weeklyActivity : monthlyActivity;

  const quizData =
    quizFilter === "week"
      ? weeklyQuizPerformance
      : monthlyQuizPerformance;

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      {/* Page heading */}
      <section>
        <p className="text-xs font-medium text-muted">
          YOUR LEARNING JOURNEY
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your Progress
            </h1>
            <p className="mt-2 text-sm text-muted">
              Understand your performance, track your growth, and identify
              areas to improve.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-muted">
            <FiTrendingUp size={15} className="text-brand" />
            Learning analytics
          </div>
        </div>
      </section>

      {/* Overview stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockProgressStats.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Learning activity"
          description="Time spent learning over the selected period."
          data={activityData}
          dataKey="hours"
          color="var(--color-brand)"
          filter={activityFilter}
          onFilterChange={setActivityFilter}
        />

        <ChartCard
          title="Quiz performance"
          description="Your average quiz scores over time."
          data={quizData}
          dataKey="score"
          color="var(--color-success)"
          type="line"
          filter={quizFilter}
          onFilterChange={setQuizFilter}
          suffix="%"
        />
      </section>

      {/* Course mastery */}
      <CourseMastery />

      {/* Insights */}
      <LearningInsights />

      {/* History */}
      <LearningHistory />

      {/* Footer note */}
      <div className="flex items-start gap-3 rounded-card border border-border bg-brand-wash/40 p-4">
        <FiZap className="mt-0.5 shrink-0 text-brand-hover" size={18} />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Keep building your momentum
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Consistent learning and regular practice are the keys to
            long-term mastery. Focus on improving one topic at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
