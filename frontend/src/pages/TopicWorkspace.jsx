
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiBookOpen, FiPlayCircle } from "react-icons/fi";

import api from "../services/api";
import TopicWorkspaceHeader from "../components/topic-workspace/TopicWorkspaceHeader";
import TopicOutline from "../components/topic-workspace/TopicOutline";
import TopicVideos from "../components/topic-workspace/TopicVideos";
import TopicLearningContent from "../components/topic-workspace/TopicLearningContent";
import TopicAITutor from "../components/topic-workspace/TopicAITutor";

const tabs = [
  { id: "learn", label: "Learn", icon: FiBookOpen },
  { id: "videos", label: "Videos", icon: FiPlayCircle },
];

function LoadingState() {
  return (
    <div className="rounded-panel border border-border bg-surface p-8 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <p className="mt-4 text-sm text-muted">
        Loading topic workspace...
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry, onBack }) {
  return (
    <section className="rounded-panel border border-border bg-surface p-8 text-center">
      <h1 className="font-heading text-xl font-bold text-foreground">
        Unable to load topic
      </h1>
      <p className="mt-2 text-sm text-muted">{message}</p>

      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Try again
        </button>

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-app"
        >
          Back to course
        </button>
      </div>
    </section>
  );
}

export default function TopicWorkspace() {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab === "videos" ? "videos" : "learn"
  );

  const numericCourseId = Number(courseId);
  const numericTopicId = Number(topicId);

  const validIds =
    Number.isSafeInteger(numericCourseId) &&
    numericCourseId > 0 &&
    Number.isSafeInteger(numericTopicId) &&
    numericTopicId > 0;

  const coursesQuery = useQuery({
    queryKey: ["myCourses"],
    queryFn: async () => {
      const { data } = await api.get("/me/courses");
      return data;
    },
    enabled: validIds,
  });

  const course = coursesQuery.data?.find(
    (item) => Number(item.id) === numericCourseId
  );

  const topicsQuery = useQuery({
    queryKey: ["courseTopics", numericCourseId],
    queryFn: async () => {
      const { data } = await api.get(
        `/courses/${numericCourseId}/topics`
      );
      return data;
    },
    enabled: Boolean(course),
  });

  const masteryQuery = useQuery({
    queryKey: ["courseTopicMastery", numericCourseId],
    queryFn: async () => {
      const { data } = await api.get(
        `/me/courses/${numericCourseId}/mastery`
      );
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

    return topicsQuery.data.map((item) => {
      const mastery = masteryByTopic.get(Number(item.id));

      return {
        id: item.id,
        title: item.name,
        category: item.unit || "Course topic",
        position: item.position,
        parentId: item.parent_id,
        assessed: Boolean(mastery?.assessed),
        masteryScore:
          mastery?.mastery_score == null
            ? null
            : Math.round(Number(mastery.mastery_score) * 100),
        attempts: mastery?.attempts_count ?? 0,
      };
    });
  }, [topicsQuery.data, masteryQuery.data]);

  const currentTopic = topics.find(
    (item) => Number(item.id) === numericTopicId
  );

  // Fetch recommendations only when the Videos tab is opened.
  const topicVideosQuery = useQuery({
    queryKey: ["topicVideos", numericCourseId, numericTopicId],
    queryFn: async () => {
      const { data } = await api.get(
        `/courses/${numericCourseId}/topics/${numericTopicId}/videos`,
        {
          params: {
            courseTitle: course.name,
            topicTitle: currentTopic.title,
          },
        }
      );

      // Backend already sorts by view count. Sort again defensively.
      return [...(data.videos ?? [])].sort(
        (a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0)
      );
    },
    enabled:
      Boolean(course) &&
      Boolean(currentTopic) &&
      activeTab === "videos",
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const isLoading =
    coursesQuery.isLoading ||
    (Boolean(course) &&
      (topicsQuery.isLoading || masteryQuery.isLoading));

  const error =
    coursesQuery.error || topicsQuery.error || masteryQuery.error;

  function goBack() {
    navigate(`/courses/${courseId}`);
  }

  function retry() {
    coursesQuery.refetch();

    if (course) {
      topicsQuery.refetch();
      masteryQuery.refetch();
    }
  }

  function selectTopic(nextTopic) {
    navigate(
      `/courses/${courseId}/topics/${nextTopic.id}/learn`,
      { state: { activeTab } }
    );
  }

  if (!validIds) {
    return (
      <ErrorState
        message="The course or topic ID is invalid."
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
          "Something went wrong while loading this topic."
        }
        onRetry={retry}
        onBack={goBack}
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

  if (!currentTopic) {
    return (
      <ErrorState
        message="This topic was not found in the selected course."
        onRetry={retry}
        onBack={goBack}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 pb-8">
      <TopicWorkspaceHeader
        courseId={courseId}
        topic={currentTopic}
        courseName={course.name}
      />

      <nav
        aria-label="Learning modes"
        className="flex gap-1 rounded-panel border border-border bg-surface p-1.5"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            aria-pressed={activeTab === id}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
              activeTab === id
                ? "bg-brand-soft text-brand-hover"
                : "text-muted hover:bg-app hover:text-foreground"
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <aside className="min-w-0">
          <TopicOutline
            topics={topics}
            activeTopicId={numericTopicId}
            onSelect={selectTopic}
          />
        </aside>

        <main className="min-w-0">
          <div className={activeTab === "learn" ? "block" : "hidden"}>
            <TopicLearningContent
              topic={currentTopic}
              onWatchVideos={() => setActiveTab("videos")}
            />
          </div>

          {/* Keep this component mounted so video selection survives tab changes. */}
          <div className={activeTab === "videos" ? "block" : "hidden"}>
            <TopicVideos
              key={numericTopicId}
              videos={topicVideosQuery.data ?? []}
              isLoading={topicVideosQuery.isLoading}
              error={topicVideosQuery.error}
              onRetry={() => topicVideosQuery.refetch()}
            />
          </div>
        </main>

        <aside className="min-w-0 space-y-5">
          <section className="rounded-panel border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
                <FiBookOpen size={19} />
              </span>
              <h2 className="font-heading font-bold text-foreground">
                Learning checklist
              </h2>
            </div>

            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>○ Explore the topic</p>
              <p>○ Watch a recommended video</p>
              <p>○ Test your understanding</p>
            </div>
          </section>

          <TopicAITutor topicTitle={currentTopic.title} />
        </aside>
      </div>
    </div>
  );
}
