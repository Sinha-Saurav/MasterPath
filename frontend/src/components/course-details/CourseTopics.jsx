
import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiCircle,
  FiClock,
  FiPlay,
  FiSearch,
  FiVideo,
  FiFileText,
} from "react-icons/fi";

const defaultTopics = [
  { id: "ds-intro", title: "What are Data Structures?", category: "Introduction to DSA", duration: 12, status: "completed" },
  { id: "ds-types", title: "Types of Data Structures", category: "Introduction to DSA", duration: 15, status: "completed" },
  { id: "ds-complexity", title: "Time and Space Complexity", category: "Introduction to DSA", duration: 18, status: "completed" },
  { id: "array-intro", title: "Introduction to Arrays", category: "Arrays", duration: 14, status: "completed" },
  { id: "array-ops", title: "Array Operations", category: "Arrays", duration: 16, status: "completed" },
  { id: "two-pointer", title: "Two Pointer Technique", category: "Arrays", duration: 20, status: "completed" },
  { id: "sliding-window", title: "Sliding Window", category: "Arrays", duration: 25, status: "in-progress" },
  { id: "array-problems", title: "Common Array Problems", category: "Arrays", duration: 30, status: "not-started" },
  { id: "ll-intro", title: "Introduction to Linked Lists", category: "Linked Lists", duration: 15, status: "completed" },
  { id: "ll-operations", title: "Insertion and Deletion", category: "Linked Lists", duration: 20, status: "completed" },
  { id: "ll-reversal", title: "Reversing a Linked List", category: "Linked Lists", duration: 25, status: "in-progress" },
  { id: "ll-problems", title: "Linked List Problems", category: "Linked Lists", duration: 30, status: "not-started" },
  { id: "stack-intro", title: "Introduction to Stacks", category: "Stacks and Queues", duration: 15, status: "not-started" },
  { id: "queue-intro", title: "Introduction to Queues", category: "Stacks and Queues", duration: 15, status: "not-started" },
  { id: "tree-intro", title: "Introduction to Trees", category: "Trees", duration: 20, status: "not-started" },
  { id: "graph-intro", title: "Introduction to Graphs", category: "Graphs", duration: 20, status: "not-started" },
];

const filters = [
  { value: "all", label: "All Topics" },
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In Progress" },
  { value: "not-started", label: "Not Started" },
];

function TopicStatus({ status }) {
  if (status === "completed") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <FiCheck size={18} strokeWidth={3} />
      </span>
    );
  }

  if (status === "in-progress") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <FiPlay size={15} fill="currentColor" />
      </span>
    );
  }

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-app text-muted">
      <FiCircle size={18} />
    </span>
  );
}

function TopicRow({ topic, onTopicAction }) {
  const actionLabel =
    topic.status === "completed"
      ? "Review topic"
      : topic.status === "in-progress"
        ? "Continue learning"
        : "Start learning";

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-surface p-4 transition hover:border-brand/40 hover:shadow-sm sm:flex-row sm:items-center">
      <TopicStatus status={topic.status} />

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {topic.title}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="rounded-md bg-brand-wash px-2 py-1 text-brand-hover">
            {topic.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <FiClock size={13} />
            {topic.duration} min
          </span>
          <span>
            {topic.status === "completed"
              ? "Completed"
              : topic.status === "in-progress"
                ? "In progress"
                : "Not started"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={() => onTopicAction?.("video", topic)}
          aria-label={`Open videos for ${topic.title}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-brand hover:bg-brand-wash hover:text-brand-hover"
        >
          <FiVideo size={14} />
          Videos
        </button>

        <button
          type="button"
          onClick={() => onTopicAction?.("notes", topic)}
          aria-label={`Open notes for ${topic.title}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-brand hover:bg-brand-wash hover:text-brand-hover"
        >
          <FiFileText size={14} />
          Notes
        </button>

        <button
          type="button"
          onClick={() =>
            onTopicAction?.(
              topic.status === "completed" ? "review" : "continue",
              topic
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          {actionLabel}
          <FiChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function CourseTopics({
  topics = defaultTopics,
  onTopicAction,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => ({
      total: topics.length,
      completed: topics.filter((topic) => topic.status === "completed").length,
      inProgress: topics.filter((topic) => topic.status === "in-progress").length,
      notStarted: topics.filter((topic) => topic.status === "not-started").length,
    }),
    [topics]
  );

  const visibleTopics = useMemo(() => {
    const query = search.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesSearch =
        !query ||
        topic.title.toLowerCase().includes(query) ||
        topic.category.toLowerCase().includes(query);

      const matchesFilter = filter === "all" || topic.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [topics, search, filter]);

  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Course Topics
          </h2>
          <p className="mt-1 text-sm text-muted">
            Choose a topic to study, review notes, or watch lessons.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 sm:w-64">
            <FiSearch
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search topics..."
              aria-label="Search topics"
              className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-focus/50"
            />
          </label>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter topics by status"
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-focus/50"
          >
            {filters.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total topics", value: counts.total },
          { label: "Completed", value: counts.completed },
          { label: "In progress", value: counts.inProgress },
          { label: "Not started", value: counts.notStarted },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-app p-3"
          >
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {visibleTopics.map((topic) => (
          <TopicRow
            key={topic.id}
            topic={topic}
            onTopicAction={onTopicAction}
          />
        ))}

        {visibleTopics.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
            <FiBookOpen size={28} className="mx-auto text-muted" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No matching topics
            </h3>
            <p className="mt-1 text-xs text-muted">
              Try another search term or status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-hover transition hover:bg-brand/15"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
