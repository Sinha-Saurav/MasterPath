
import { FiBookOpen, FiPlayCircle } from "react-icons/fi";

export default function TopicLearningContent({
  topic,
  onWatchVideos,
}) {
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
              {topic.title}
            </h2>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-muted">
          Start learning about {topic.title} through curated video
          resources. Watch the recommended explanations and examples
          to build your understanding of this topic.
        </p>
      </section>

      <section className="rounded-panel border border-border bg-surface p-6 sm:p-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
            <FiPlayCircle size={28} />
          </span>

          <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
            Ready to learn?
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted">
            Explore recommended videos for {topic.title} and learn
            at your own pace.
          </p>

          <button
            type="button"
            onClick={onWatchVideos}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            <FiPlayCircle size={17} />
            Explore videos
          </button>
        </div>
      </section>
    </article>
  );
}
