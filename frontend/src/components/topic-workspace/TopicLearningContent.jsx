
import {
  FiBookOpen,
  FiCheckCircle,
  FiCode,
  FiTarget,
  FiZap,
} from "react-icons/fi";

export default function TopicLearningContent({
  topic,
  lesson,
  onWatchVideos,
  onPractice,
}) {
  const objectives = lesson?.objectives ?? [
    "Understand the core concept and its purpose.",
    "Recognize when to apply this technique.",
    "Analyze an example and explain its complexity.",
  ];

  const sections = lesson?.sections ?? [
    {
      heading: "Understanding the concept",
      content:
        "Start by understanding the problem this technique solves. Focus on the underlying idea before memorizing an implementation.",
    },
    {
      heading: "How it works",
      content:
        "Identify the relevant inputs, decide how to process them, and define the conditions that determine your next step. Work through a small example before attempting a more complex problem.",
    },
  ];

  const code = lesson?.code ?? `function example(arr) {
  // Identify the problem's key condition.
  // Process the input systematically.
  return arr;
}`;

  return (
    <article className="space-y-5">
      <section className="rounded-panel border border-border bg-surface p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <FiBookOpen size={22} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Learning module
            </p>
            <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              {topic?.title ?? "Topic introduction"}
            </h2>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-muted sm:text-base">
          {lesson?.introduction ??
            "Build your understanding step by step. Start with the core idea, study the examples, and then test what you have learned."}
        </p>
      </section>

      <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <FiTarget className="text-brand" size={20} />
          <h3 className="font-heading text-lg font-bold text-foreground">
            Learning objectives
          </h3>
        </div>

        <p className="mt-1 text-sm text-muted">
          By the end of this topic, you should be able to:
        </p>

        <ul className="mt-4 space-y-3">
          {objectives.map((objective, index) => (
            <li key={objective} className="flex items-start gap-3">
              <FiCheckCircle
                size={18}
                className="mt-0.5 shrink-0 text-success"
              />
              <span className="text-sm leading-6 text-foreground">
                {objective}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-panel border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <FiZap className="text-brand" size={20} />
          <h3 className="font-heading text-lg font-bold text-foreground">
            Core concepts
          </h3>
        </div>

        <div className="mt-5 space-y-6">
          {sections.map((section, index) => (
            <section key={section.heading}>
              <h4 className="font-heading font-semibold text-foreground">
                {index + 1}. {section.heading}
              </h4>
              <p className="mt-2 text-sm leading-7 text-muted">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-panel border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <FiCode size={20} className="text-brand" />
          <h3 className="font-heading font-bold text-foreground">
            Code example
          </h3>
          <span className="ml-auto rounded-md bg-brand-wash px-2 py-1 text-xs text-brand-hover">
            JavaScript
          </span>
        </div>

        <pre className="overflow-x-auto bg-[#211B2D] p-5 text-sm leading-6 text-white">
          <code>{code}</code>
        </pre>
      </section>

      <section className="rounded-panel border border-brand/20 bg-brand-wash p-5">
        <h3 className="font-heading font-bold text-foreground">
          Ready to continue?
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted">
          Reinforce your understanding with a video lesson or try a practice
          question.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onWatchVideos}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            Watch videos
          </button>

          <button
            type="button"
            onClick={onPractice}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            Start practice
          </button>
        </div>
      </section>
    </article>
  );
}
