
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClipboard,
  FiTrendingUp,
} from "react-icons/fi";

import api from "../services/api";
import CourseHeader from "../components/course-details/CourseHeader";
import CourseProgress from "../components/course-details/CourseProgress";
import CourseTabs from "../components/course-details/CourseTabs";
import CourseTopics from "../components/course-details/CourseTopics";
import CourseSidebar from "../components/course-details/CourseSideBar";

function OverviewStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-card border border-border p-4">
      <Icon size={19} className="text-brand" />
      <p className="mt-3 font-heading text-xl font-bold text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function OverviewPanel({ course, topics, assessedTopics, averageMastery, onGoToTopics }) {
  return (
    <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
          <FiBookOpen size={22} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Course Overview
          </h2>
          <p className="mt-1 text-xs text-muted">
            Your learning journey at a glance
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-muted">
        Explore the topics in {course.name}, track your assessed topic mastery,
        and continue learning at your own pace.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <OverviewStat
          icon={FiBookOpen}
          label="Total topics"
          value={topics.length}
        />
        <OverviewStat
          icon={FiCheckCircle}
          label="Topics assessed"
          value={assessedTopics}
        />
        <OverviewStat
          icon={FiTrendingUp}
          label="Average mastery"
          value={averageMastery === null ? "—" : `${averageMastery}%`}
        />
      </div>

      <button
        type="button"
        onClick={onGoToTopics}
        className="mt-6 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
      >
        Browse course topics
      </button>
    </section>
  );
}

function ProgressPanel({ topics, assessedTopics, averageMastery }) {
  const unassessed = topics.length - assessedTopics;

  return (
    <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
          <FiTrendingUp size={22} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Learning Progress
          </h2>
          <p className="mt-1 text-xs text-muted">
            Your assessed topic mastery
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted">Average mastery</span>
          <span className="text-sm font-bold text-brand-hover">
            {averageMastery === null ? "Not assessed" : `${averageMastery}%`}
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-brand-soft">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${averageMastery ?? 0}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <OverviewStat
          icon={FiCheckCircle}
          label="Assessed topics"
          value={assessedTopics}
        />
        <OverviewStat
          icon={FiBookOpen}
          label="Not assessed"
          value={unassessed}
        />
        <OverviewStat
          icon={FiTrendingUp}
          label="Total topics"
          value={topics.length}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">
        Mastery reflects your performance on assessed topics. It does not
        represent course completion.
      </p>
    </section>
  );
}



function LoadingState() {
  return (
    <div className="rounded-panel border border-border bg-surface p-8 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <p className="mt-4 text-sm text-muted">Loading course details...</p>
    </div>
  );
}

function ErrorState({ message, onRetry, onBack }) {
  return (
    <div className="mx-auto max-w-2xl rounded-panel border border-border bg-surface p-8 text-center">
      <h1 className="font-heading text-xl font-bold text-foreground">
        Unable to load course
      </h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-app"
        >
          My Courses
        </button>
      </div>
    </div>
  );
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  const numericCourseId = Number(courseId);
  const validCourseId =
    Number.isSafeInteger(numericCourseId) && numericCourseId > 0;

  const coursesQuery = useQuery({
    queryKey: ["myCourses"],
    queryFn: async () => {
      const { data } = await api.get("/me/courses");
      return data;
    },
  });

  const course = coursesQuery.data?.find(
    (item) => Number(item.id) === numericCourseId
  );

  const topicsQuery = useQuery({
    queryKey: ["courseTopics", numericCourseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${numericCourseId}/topics`);
      return data;
    },
    enabled: Boolean(course),
  });

  const masteryQuery = useQuery({
    queryKey: ["courseTopicMastery", numericCourseId],
    queryFn: async () => {
      const { data } = await api.get(`/me/courses/${numericCourseId}/mastery`);
      return data;
    },
    enabled: Boolean(course),
  });

  const topics = useMemo(() => {
    if (!topicsQuery.data) return [];

    const masteryByTopic = new Map(
      (masteryQuery.data?.topics ?? []).map((item) => [
        Number(item.topic_id),
        item,
      ])
    );

    return topicsQuery.data.map((topic) => {
      const mastery = masteryByTopic.get(Number(topic.id));
      const score =
        mastery?.mastery_score == null
          ? null
          : Math.round(Number(mastery.mastery_score) * 100);

      return {
        id: topic.id,
        title: topic.name,
        category: topic.unit || "Course topic",
        position: topic.position,
        status: mastery?.assessed ? "assessed" : "not-assessed",
        masteryScore: score,
        attempts: mastery?.attempts_count ?? 0,
      };
    });
  }, [topicsQuery.data, masteryQuery.data]);

  const assessedTopics = topics.filter(
    (topic) => topic.status === "assessed"
  ).length;

  const averageMastery = assessedTopics
    ? Math.round(
        topics
          .filter((topic) => topic.masteryScore !== null)
          .reduce((sum, topic) => sum + topic.masteryScore, 0) /
          topics.filter((topic) => topic.masteryScore !== null).length
      )
    : null;

  const isLoading =
    coursesQuery.isLoading ||
    (Boolean(course) && (topicsQuery.isLoading || masteryQuery.isLoading));

  const error =
    coursesQuery.error || topicsQuery.error || masteryQuery.error;

  if (!validCourseId) {
    return (
      <ErrorState
        message="The course ID is invalid."
        onRetry={() => navigate(0)}
        onBack={() => navigate("/courses")}
      />
    );
  }

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <ErrorState
        message={
          error.response?.data?.error?.message ||
          error.message ||
          "Something went wrong while loading this course."
        }
        onRetry={() => {
          coursesQuery.refetch();
          topicsQuery.refetch();
          masteryQuery.refetch();
        }}
        onBack={() => navigate("/courses")}
      />
    );
  }

  if (!course) {
    return (
      <ErrorState
        message="This course was not found in your enrolled courses."
        onRetry={() => coursesQuery.refetch()}
        onBack={() => navigate("/courses")}
      />
    );
  }

  function handleTopicAction(action, topic) {
    const activeTopicTab =
      action === "video"
        ? "videos"
        : action === "notes"
          ? "notes"
          : "learn";

    navigate(`/courses/${courseId}/topics/${topic.id}/learn`, {
      state: { activeTab: activeTopicTab },
    });
  }

  function handleContinue() {
    setActiveTab("topics");
  }

  const courseForUI = {
    ...course,
    totalTopics: topics.length,
    assessedTopics,
    averageMastery,
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <CourseHeader course={courseForUI} />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <CourseProgress
            averageMastery={averageMastery}
            assessedTopics={assessedTopics}
            totalTopics={topics.length}
            onContinue={handleContinue}
          />

          <section className="rounded-panel border border-border bg-surface px-3 sm:px-5">
            <CourseTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="py-5">
              {activeTab === "overview" && (
                <OverviewPanel
                  course={course}
                  topics={topics}
                  assessedTopics={assessedTopics}
                  averageMastery={averageMastery}
                  onGoToTopics={() => setActiveTab("topics")}
                />
              )}

              {activeTab === "topics" && (
                <CourseTopics
                  topics={topics}
                  onTopicAction={handleTopicAction}
                />
              )}

              {activeTab === "quizzes" && (
                <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <FiClipboard size={22} className="text-brand" />
                    <h2 className="font-heading text-lg font-bold text-foreground">
                      Course Quizzes
                    </h2>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">
                    Open the Quizzes page to configure and attempt a quiz for
                    this course.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/quizzes")}
                    className="mt-5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
                  >
                    Go to Quizzes
                  </button>
                </section>
              )}

              {activeTab === "progress" && (
                <ProgressPanel
                  topics={topics}
                  assessedTopics={assessedTopics}
                  averageMastery={averageMastery}
                />
              )}
            </div>
          </section>
        </div>

        <CourseSidebar
          course={courseForUI}
          mastery={topics
            .filter((topic) => topic.masteryScore !== null)
            .map((topic) => ({
              name: topic.title,
              score: topic.masteryScore,
            }))}
          onViewProgress={() => setActiveTab("progress")}
        />
      </div>
    </div>
  );
}
