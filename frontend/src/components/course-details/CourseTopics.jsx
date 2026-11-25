
import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiChevronRight,
  FiCircle,
  FiSearch,
} from "react-icons/fi";

const filters = [
  { value: "all", label: "All Topics" },
  { value: "assessed", label: "Assessed" },
  { value: "not-assessed", label: "Not Assessed" },
];

function TopicRow({ topic, onTopicAction }) {
  const assessed = topic.status === "assessed";
  const masteryScore = topic.masteryScore;
  const masteryValue =
    masteryScore === null || masteryScore === undefined
      ? 0
      : Math.min(100, Math.max(0, masteryScore));

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border/70 bg-surface p-4 transition hover:border-brand/40 hover:shadow-sm sm:flex-row sm:items-center">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
          assessed
            ? "bg-success/10 text-success"
            : "bg-app text-muted"
        }`}
      >
        {assessed ? (
          <span className="text-xs font-bold">✓</span>
        ) : (
          <FiCircle size={18} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {topic.title}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="rounded-md bg-brand-wash px-2 py-1 text-brand-hover">
            {topic.category}
          </span>
          <span>{assessed ? "Assessed" : "Not assessed"}</span>
          {assessed && (
            <span className="font-semibold text-brand-hover">
              {masteryScore}% mastery
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-muted">
              Topic mastery
            </span>
            <span className="text-[11px] font-semibold text-foreground">
              {assessed ? `${masteryScore}%` : "Not assessed"}
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-brand-soft/70"
            role="progressbar"
            aria-label={`${topic.title} mastery`}
            aria-valuenow={masteryValue}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${masteryValue}%` }}
            />
          </div>
        </div>
      </div>

      <div className="sm:shrink-0">
        <button
          type="button"
          onClick={() =>
            onTopicAction?.(assessed ? "review" : "continue", topic)
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-hover sm:w-auto"
        >
          {assessed ? "Review topic" : "Start learning"}
          <FiChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function CourseTopics({ topics = [], onTopicAction }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => ({
      total: topics.length,
      assessed: topics.filter((topic) => topic.status === "assessed").length,
      notAssessed: topics.filter(
        (topic) => topic.status === "not-assessed"
      ).length,
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
            Track your mastery and continue learning topic by topic.
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

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Total topics", value: counts.total },
          { label: "Assessed", value: counts.assessed },
          { label: "Not assessed", value: counts.notAssessed },
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
