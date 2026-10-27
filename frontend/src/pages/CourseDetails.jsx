
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClipboard,
  FiFileText,
  FiTrendingUp,
} from "react-icons/fi";

import CourseHeader from "../components/course-details/CourseHeader";
import CourseProgress from "../components/course-details/CourseProgress";
import CourseTabs from "../components/course-details/CourseTabs";
import CourseTopics from "../components/course-details/CourseTopics";
import CourseSidebar from "../components/course-details/CourseSideBar";

import {
  mockCourses,
  mockMastery,
  mockNextSteps,
} from "../data/mockCourse";

function OverviewPanel({ course, onGoToTopics }) {
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
        {course.description}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <OverviewStat
          icon={FiCheckCircle}
          label="Topics completed"
          value={`${course.completedTopics}/${course.totalTopics}`}
        />
        <OverviewStat
          icon={FiClipboard}
          label="Available quizzes"
          value={course.totalQuizzes}
        />
        <OverviewStat
          icon={FiTrendingUp}
          label="Course progress"
          value={`${course.progress}%`}
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

function QuizPanel({ course }) {
  return (
    <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
          <FiClipboard size={22} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Course Quizzes
          </h2>
          <p className="mt-1 text-xs text-muted">
            Test your understanding of the material
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">
        There are {course.totalQuizzes} quizzes associated with this course.
        The quiz discovery and attempt experience will be implemented in the
        dedicated Quizzes page.
      </p>

      <div className="mt-5 rounded-card bg-brand-wash p-4">
        <p className="text-sm font-semibold text-foreground">
          Quiz interface coming next
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          We'll add quiz selection, attempts, question navigation, and result
          review once the dedicated quiz UI is ready.
        </p>
      </div>
    </section>
  );
}

function ProgressPanel({ course }) {
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
            Your progress through this course
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted">Overall completion</span>
          <span className="text-sm font-bold text-brand-hover">
            {course.progress}%
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-brand-soft">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <OverviewStat
          icon={FiCheckCircle}
          label="Completed"
          value={course.completedTopics}
        />
        <OverviewStat
          icon={FiTrendingUp}
          label="In progress"
          value={course.inProgressTopics}
        />
        <OverviewStat
          icon={FiBookOpen}
          label="Not started"
          value={course.notStartedTopics}
        />
      </div>
    </section>
  );
}

function ResourcesPanel() {
  return (
    <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
          <FiFileText size={22} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Course Resources
          </h2>
          <p className="mt-1 text-xs text-muted">
            Learning materials and references
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">
        Video lessons, study notes, and other resources will be available
        from each topic's dedicated study workspace.
      </p>

      <div className="mt-5 rounded-card bg-brand-wash p-4">
        <p className="text-sm font-semibold text-foreground">
          Resources are organized by topic
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Open a topic from the Topics tab to access its learning materials.
        </p>
      </div>
    </section>
  );
}

function ActionNotice({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-xl border border-brand-soft bg-brand-wash p-4"
    >
      <div>
        <p className="text-sm font-semibold text-foreground">
          {notice.title}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          {notice.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand-hover hover:bg-brand-soft"
      >
        Dismiss
      </button>
    </div>
  );
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [notice, setNotice] = useState(null);

  const course = mockCourses[courseId];

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl rounded-panel border border-border bg-surface p-8 text-center">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Course not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          This course doesn't exist in the current demo data.
        </p>
        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="mt-5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  function showNotice(title, message) {
    setNotice({ title, message });
  }

  function handleTopicAction(action, topic) {
  const activeTab =
    action === "video"
      ? "videos"
      : action === "notes"
        ? "notes"
        : "learn";

  navigate(`/courses/${courseId}/topics/${topic.id}/learn`, {
    state: { activeTab },
  });
}

  function handleNextStep(action, step) {
    if (action === "quiz") {
      navigate("/quizzes");
      return;
    }

    showNotice(
      step.title,
      "The Topic Study Workspace is the next learning page we'll build."
    );
  }

  function handleContinue() {
    setActiveTab("topics");
    showNotice(
      "Continue learning",
      "Choose a topic below to continue. The dedicated study workspace will be connected next."
    );
  }

  function handleCourseMenu() {
    showNotice(
      "Course options",
      "Additional course actions will be added during the UI polish pass."
    );
  }

  const sidebarCourse = {
    ...course,
    progress: course.progress,
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <CourseHeader course={course} />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <CourseProgress
            progress={course.progress}
            completedTopics={course.completedTopics}
            inProgressTopics={course.inProgressTopics}
            notStartedTopics={course.notStartedTopics}
            onContinue={handleContinue}
          />

          <section className="rounded-panel border border-border bg-surface px-3 sm:px-5">
            <CourseTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setNotice(null);
              }}
            />

            <div className="py-5">
              <ActionNotice
                notice={notice}
                onClose={() => setNotice(null)}
              />

              {activeTab === "overview" && (
                <OverviewPanel
                  course={course}
                  onGoToTopics={() => setActiveTab("topics")}
                />
              )}

              {activeTab === "topics" && (
                <CourseTopics onTopicAction={handleTopicAction} />
              )}

              {activeTab === "quizzes" && (
                <QuizPanel course={course} />
              )}

              {activeTab === "progress" && (
                <ProgressPanel course={course} />
              )}

              {activeTab === "resources" && <ResourcesPanel />}
            </div>
          </section>
        </div>

        <CourseSidebar
          course={sidebarCourse}
          mastery={mockMastery}
          steps={mockNextSteps}
          onContinue={handleContinue}
          onViewProgress={() => setActiveTab("progress")}
          onStepAction={handleNextStep}
          onCourseMenu={handleCourseMenu}
        />
      </div>
    </div>
  );
}
