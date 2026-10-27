
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiBookOpen,
  FiPlayCircle,
  FiFileText,
  FiCode,
} from "react-icons/fi";

import TopicWorkspaceHeader from "../components/topic-workspace/TopicWorkspaceHeader";
import TopicOutline from "../components/topic-workspace/TopicOutline";
import TopicVideos from "../components/topic-workspace/TopicVideos";
import TopicLearningContent from "../components/topic-workspace/TopicLearningContent";
import TopicAITutor from "../components/topic-workspace/TopicAITutor";

import {
  mockWorkspaceTopics,
  mockVideos,
  mockTopicNotes,
} from "../data/mockTopicWorkspace";

const tabs = [
  { id: "learn", label: "Learn", icon: FiBookOpen },
  { id: "videos", label: "Videos", icon: FiPlayCircle },
  { id: "notes", label: "Notes", icon: FiFileText },
  { id: "practice", label: "Practice", icon: FiCode },
];

export default function TopicWorkspace() {
  const { courseId = "dsa", topicId = "two-pointer" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab ?? "learn"
  );

  const topics = useMemo(() => mockWorkspaceTopics, []);
  const currentTopic = topics.find((topic) => topic.id === topicId);

  if (!currentTopic) {
    return (
      <section className="rounded-panel border border-border bg-surface p-8 text-center">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Topic not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          This topic isn't included in the current mock data.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Back to course
        </button>
      </section>
    );
  }

  const topic = {
    ...currentTopic,
    courseName: "Data Structures and Algorithms",
    description:
      "Understand the concept, learn when to apply it, and practice solving common interview problems.",
    difficulty: "Intermediate",
    progress:
      currentTopic.status === "completed"
        ? 100
        : currentTopic.status === "in-progress"
          ? 35
          : 0,
  };

  function selectTopic(nextTopic) {
    navigate(`/courses/${courseId}/topics/${nextTopic.id}/learn`, {
      state: { activeTab },
    });
  }

  function openTab(tab) {
    setActiveTab(tab);
  }

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 pb-8">
      <TopicWorkspaceHeader courseId={courseId} topic={topic} />

      <nav
        aria-label="Learning modes"
        className="flex gap-1 overflow-x-auto rounded-panel border border-border bg-surface p-1.5"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => openTab(id)}
            aria-pressed={activeTab === id}
            className={`flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
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
            activeTopicId={topicId}
            onSelect={selectTopic}
          />
        </aside>

        <main className="min-w-0">
          {activeTab === "learn" && (
            <TopicLearningContent
              topic={topic}
              onWatchVideos={() => openTab("videos")}
              onPractice={() => openTab("practice")}
            />
          )}

          {activeTab === "videos" && (
            <TopicVideos videos={mockVideos} />
          )}

          {activeTab === "notes" && (
            <section className="rounded-panel border border-border bg-surface p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Study notes
              </p>

              <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
                {mockTopicNotes.title}
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted">
                {mockTopicNotes.introduction}
              </p>

              {mockTopicNotes.sections.map((section) => (
                <section key={section.heading} className="mt-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {section.heading}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {section.body}
                  </p>
                </section>
              ))}

              <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
                Example implementation
              </h3>

              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#211B2D] p-4 text-sm leading-6 text-white">
                <code>{mockTopicNotes.code}</code>
              </pre>
            </section>
          )}

          {activeTab === "practice" && (
            <section className="rounded-panel border border-border bg-surface p-8 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
                <FiCode size={23} />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
                Practice {topic.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Topic-specific questions and interactive exercises will be
                added here next.
              </p>
            </section>
          )}
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
              <p>✓ Understand the concept</p>
              <p>○ Review an example</p>
              <p>○ Test your understanding</p>
            </div>
          </section>

          <TopicAITutor topicTitle={topic.title} />

          <section className="rounded-panel border border-border bg-surface p-5">
            <h2 className="font-heading font-bold text-foreground">
              Continue learning
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Review the lesson, watch a video, or test your understanding.
            </p>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => openTab("videos")}
                className="rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-brand-hover transition hover:bg-brand-wash"
              >
                Watch videos
              </button>
              <button
                type="button"
                onClick={() => openTab("notes")}
                className="rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-brand-hover transition hover:bg-brand-wash"
              >
                Read notes
              </button>
              <button
                type="button"
                onClick={() => openTab("practice")}
                className="rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                Start practice
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
