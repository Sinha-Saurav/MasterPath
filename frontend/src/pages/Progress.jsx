
import { useMemo, useState } from "react";
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
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const COLORS = {
  brand: "var(--color-brand)",
  success: "var(--color-success)",
  error: "var(--color-error)",
  muted: "var(--color-muted)",
  border: "var(--color-border)",
  surface: "var(--color-surface)",
};

function formatDate(dateString) {
  if (!dateString) return "Date unavailable";

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPercentage(value) {
  if (value === null || value === undefined) return "—";
  return `${Number(value).toFixed(1)}%`;
}

function getMasteryPercentage(score) {
  if (score === null || score === undefined) return null;
  return Math.min(100, Math.max(0, Number(score) * 100));
}

function getMasteryColor(value) {
  if (value >= 75) return "bg-success";
  if (value >= 40) return "bg-warning";
  return "bg-error";
}

function getMasteryTextColor(value) {
  if (value >= 75) return "text-success";
  if (value >= 40) return "text-warning";
  return "text-error";
}

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

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-2 font-heading text-2xl font-bold text-foreground">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">{detail}</p>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="min-w-0 rounded-card border border-border bg-surface p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function QuizPerformanceChart({ quizzes }) {
  const chartData = useMemo(() => {
    return [...quizzes]
      .reverse()
      .map((quiz, index) => ({
        label: `Quiz ${index + 1}`,
        date: formatDate(quiz.finished_at),
        score: Number(quiz.percentage ?? 0),
      }));
  }, [quizzes]);

  if (!chartData.length) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted">
        Complete a quiz to see your performance trend.
      </div>
    );
  }

  return (
    <div className="mt-5 h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 12, left: -15, bottom: 5 }}
        >
          <defs>
            <linearGradient id="progressLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={COLORS.brand} />
              <stop offset="100%" stopColor={COLORS.success} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke={COLORS.border}
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            dy={8}
          />

          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickFormatter={(value) => `${value}%`}
            width={42}
          />

          <Tooltip
            contentStyle={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "12px",
              fontSize: "12px",
            }}
            labelStyle={{ color: COLORS.muted }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, "Score"]}
            labelFormatter={(label, payload) =>
              payload?.[0]?.payload?.date
                ? `${label} · ${payload[0].payload.date}`
                : label
            }
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#progressLineGradient)"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: COLORS.brand,
              strokeWidth: 2,
              stroke: COLORS.surface,
            }}
            activeDot={{
              r: 7,
              fill: COLORS.brand,
              stroke: COLORS.surface,
              strokeWidth: 3,
            }}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnswerDistributionChart({ quizzes }) {
  const distribution = useMemo(() => {
    const totals = quizzes.reduce(
      (acc, quiz) => {
        acc.correct += Number(quiz.correct_answers ?? 0);
        acc.total += Number(quiz.total_questions ?? 0);
        return acc;
      },
      { correct: 0, total: 0 }
    );

    const incorrect = Math.max(0, totals.total - totals.correct);

    return {
      data: [
        { name: "Correct", value: totals.correct, color: COLORS.success },
        { name: "Incorrect", value: incorrect, color: COLORS.error },
      ],
      ...totals,
      incorrect,
    };
  }, [quizzes]);

  if (distribution.total === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted">
        Answer some quiz questions to see this chart.
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="relative h-[205px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={88}
              paddingAngle={4}
              stroke="none"
              animationDuration={900}
            >
              {distribution.data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-heading text-2xl font-bold text-foreground">
            {distribution.total}
          </p>
          <p className="text-xs text-muted">Questions</p>
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-6">
        {distribution.data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-xs text-muted">{item.name}</p>
              <p className="text-sm font-bold text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted">
        Based on your latest {quizzes.length} completed quizzes.
      </p>
    </div>
  );
}

function CourseMastery({ courses }) {
  const [expandedCourse, setExpandedCourse] = useState(null);

  const {
    data: masteryData,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["courseTopicMastery", expandedCourse],
    queryFn: async () => {
      const response = await api.get(
        `/me/courses/${expandedCourse}/mastery`
      );
      return response.data;
    },
    enabled: expandedCourse !== null,
  });

  const toggleCourse = (courseId) => {
    setExpandedCourse((current) =>
      current === courseId ? null : courseId
    );
  };

  if (!courses.length) {
    return (
      <section>
        <SectionHeading
          title="Course-wise mastery"
          description="Your topic mastery across enrolled courses."
        />
        <div className="rounded-card border border-border bg-surface p-6 text-center text-sm text-muted">
          Enroll in a course to start tracking mastery.
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading
        title="Course-wise mastery"
        description="Explore your understanding of individual topics."
      />

      <div className="space-y-3">
        {courses.map((course) => {
          const isExpanded = expandedCourse === course.course_id;
          const mastery = getMasteryPercentage(course.mastery_score);

          return (
            <div
              key={course.course_id}
              className="overflow-hidden rounded-card border border-border bg-surface"
            >
              <button
                type="button"
                onClick={() => toggleCourse(course.course_id)}
                aria-expanded={isExpanded}
                className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-brand-wash/40 sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xs font-bold text-brand-hover">
                  {course.course_code}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {course.course_name}
                    </h3>

                    <span className="text-sm font-bold text-brand-hover">
                      {mastery === null
                        ? "Not assessed"
                        : formatPercentage(mastery)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    {course.topics_assessed} of {course.total_topics} topics assessed
                  </p>

                  {mastery !== null && (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-wash">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  )}
                </div>

                {isExpanded ? (
                  <FiChevronDown className="shrink-0 text-muted" />
                ) : (
                  <FiChevronRight className="shrink-0 text-muted" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-border bg-app/50 p-4 sm:p-5">
                  {isPending ? (
                    <div className="py-6 text-center text-sm text-muted">
                      Loading topic mastery...
                    </div>
                  ) : isError ? (
                    <div className="py-5 text-center">
                      <p className="text-sm text-error">
                        Could not load topic mastery.
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-2 text-xs font-semibold text-brand-hover"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">
                          Topic mastery
                        </p>
                        <span className="text-[11px] text-muted">
                          {masteryData?.topics?.length ?? 0} topics
                        </span>
                      </div>

                      <div className="space-y-4">
                        {(masteryData?.topics ?? []).map((topic) => {
                          const topicScore = getMasteryPercentage(
                            topic.mastery_score
                          );

                          return (
                            <div key={topic.topic_id}>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-medium text-foreground">
                                    {topic.topic_name}
                                  </p>
                                  {topic.unit && (
                                    <p className="mt-0.5 text-[11px] text-muted">
                                      {topic.unit}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className={`shrink-0 text-xs font-semibold ${
                                    topicScore === null
                                      ? "text-muted"
                                      : getMasteryTextColor(topicScore)
                                  }`}
                                >
                                  {topicScore === null
                                    ? "Not assessed"
                                    : formatPercentage(topicScore)}
                                </span>
                              </div>

                              {topicScore !== null && (
                                <div className="h-1.5 overflow-hidden rounded-full bg-brand-wash">
                                  <div
                                    className={`h-full rounded-full ${getMasteryColor(topicScore)}`}
                                    style={{ width: `${topicScore}%` }}
                                  />
                                </div>
                              )}

                              <p className="mt-1 text-[10px] text-muted">
                                {topic.attempts_count} attempts · {topic.correct_count} correct
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LearningHistory({ quizzes, courses }) {
  const courseNames = useMemo(
    () =>
      new Map(
        courses.map((course) => [
          course.course_id,
          course.course_name,
        ])
      ),
    [courses]
  );

  if (!quizzes.length) {
    return (
      <section>
        <SectionHeading
          title="Learning history"
          description="Your recently completed quizzes."
        />
        <div className="rounded-card border border-border bg-surface p-6 text-center text-sm text-muted">
          Your completed quizzes will appear here.
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading
        title="Learning history"
        description="Your latest completed quizzes."
      />

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {quizzes.map((quiz, index) => {
          const score = Number(quiz.percentage ?? 0);
          const isLast = index === quizzes.length - 1;

          return (
            <div
              key={quiz.quiz_id}
              className={`flex items-center gap-3 p-4 ${
                !isLast ? "border-b border-border" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
                <FiCheckCircle size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {courseNames.get(quiz.course_id) ?? "Completed quiz"}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {formatDate(quiz.finished_at)} · {quiz.correct_answers}/{quiz.total_questions} correct
                </p>
              </div>

              <span
                className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                  score >= 75
                    ? "bg-success/10 text-success"
                    : score >= 40
                      ? "bg-warning/10 text-warning"
                      : "bg-error/10 text-error"
                }`}
              >
                {formatPercentage(score)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted">
        <FiRefreshCw className="animate-spin" />
        Loading your progress...
      </div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="rounded-card border border-border bg-surface p-8 text-center">
      <FiAlertCircle className="mx-auto text-error" size={28} />
      <h2 className="mt-3 text-base font-bold text-foreground">
        Couldn't load your progress
      </h2>
      <p className="mt-1 text-sm text-muted">
        Something went wrong while fetching your learning data.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}

export default function Progress() {
  const {
    data: dashboard,
    isPending: dashboardLoading,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get("/me/dashboard");
      return response.data;
    },
  });

  const summary = dashboard?.summary;
  const recentQuizzes = dashboard?.recent_quizzes ?? [];
  const courseMastery = dashboard?.course_mastery ?? [];

  if (dashboardLoading) return <LoadingState />;

  if (dashboardError) {
    return <ErrorState onRetry={() => refetchDashboard()} />;
  }

  const stats = [
    {
      label: "Quizzes completed",
      value: summary?.quizzes_completed ?? 0,
      detail: "Total completed quizzes",
      icon: FiCheckCircle,
    },
    {
      label: "Average score",
      value: formatPercentage(summary?.average_score),
      detail: "Average across completed quizzes",
      icon: FiTrendingUp,
    },
    {
      label: "Questions answered",
      value: summary?.questions_answered ?? 0,
      detail: "Questions attempted in quizzes",
      icon: FiBookOpen,
    },
    {
      label: "Overall accuracy",
      value: formatPercentage(summary?.overall_accuracy),
      detail: "Correct answers against assigned questions",
      icon: FiTarget,
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
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
              Track your quiz performance and understand your topic mastery.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-muted">
            <FiTrendingUp size={15} className="text-brand" />
            Learning analytics
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Quiz performance"
          description="Your scores across your latest completed quizzes."
        >
          <QuizPerformanceChart quizzes={recentQuizzes} />
        </ChartCard>

        <ChartCard
          title="Answer distribution"
          description="Correct and incorrect answers across your latest completed quizzes."
        >
          <AnswerDistributionChart quizzes={recentQuizzes} />
        </ChartCard>
      </section>

      <CourseMastery courses={courseMastery} />

      <LearningHistory
        quizzes={recentQuizzes}
        courses={courseMastery}
      />

      <div className="flex items-start gap-3 rounded-card border border-border bg-brand-wash/40 p-4">
        <FiAward className="mt-0.5 shrink-0 text-brand-hover" size={18} />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Keep building your momentum
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Regular practice helps you strengthen your understanding.
            Review topics with lower mastery and keep testing your knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}
