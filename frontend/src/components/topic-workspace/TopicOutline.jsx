
import { FiCheck, FiCircle, FiPlay, FiSearch } from "react-icons/fi";

export default function TopicOutline({
  topics,
  activeTopicId,
  onSelect,
}) {
  return (
    <section className="rounded-panel border border-border bg-surface p-4">
      <h2 className="font-heading text-base font-bold text-foreground">
        Course topics
      </h2>
      <p className="mt-1 text-xs text-muted">
        Select a topic to start learning.
      </p>

      <label className="relative mt-4 block">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          placeholder="Search topics..."
          aria-label="Search course topics"
          className="h-10 w-full rounded-lg border border-border bg-app pl-9 pr-3 text-sm outline-none focus:border-brand"
          onChange={(event) => {
            // Search is handled locally by this component.
            event.currentTarget.dataset.query = event.target.value;
          }}
        />
      </label>

      <TopicList
        topics={topics}
        activeTopicId={activeTopicId}
        onSelect={onSelect}
      />
    </section>
  );
}

function TopicList({ topics, activeTopicId, onSelect }) {
  return (
    <div className="mt-4 space-y-1">
      {topics.map((topic) => {
        const active = topic.id === activeTopicId;

        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelect(topic)}
            className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
              active
                ? "bg-brand-soft ring-1 ring-brand/20"
                : "hover:bg-app"
            }`}
          >
            <span
              className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                topic.status === "completed"
                  ? "bg-success/10 text-success"
                  : active
                    ? "bg-brand text-white"
                    : "bg-app text-muted"
              }`}
            >
              {topic.status === "completed" ? (
                <FiCheck size={15} />
              ) : active ? (
                <FiPlay size={13} />
              ) : (
                <FiCircle size={14} />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block text-sm font-medium ${
                  active ? "text-brand-hover" : "text-foreground"
                }`}
              >
                {topic.title}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {topic.duration} min
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
