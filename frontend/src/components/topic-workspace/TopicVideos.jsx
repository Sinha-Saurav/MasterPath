
import { useEffect, useState } from "react";
import { FiPlay, FiClock, FiEye, FiRefreshCw } from "react-icons/fi";

function formatViews(value) {
  const views = Number(value || 0);

  return `${new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(views)} views`;
}

function formatDuration(duration) {
  if (!duration) return "Duration unavailable";

  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) return duration;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function LoadingState() {
  return (
    <section className="rounded-panel border border-border bg-surface p-10 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <p className="mt-4 text-sm text-muted">
        Finding the best videos for this topic...
      </p>
      <p className="mt-1 text-xs text-muted">
        This may take a few seconds.
      </p>
    </section>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <section className="rounded-panel border border-border bg-surface p-8 text-center">
      <h2 className="font-heading text-lg font-bold text-foreground">
        Couldn't load videos
      </h2>

      <p className="mt-2 text-sm text-muted">
        {error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching video recommendations."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
      >
        <FiRefreshCw size={15} />
        Try again
      </button>
    </section>
  );
}

export default function TopicVideos({
  videos = [],
  isLoading = false,
  error = null,
  onRetry,
}) {
  const [selectedId, setSelectedId] = useState(null);

  // Videos arrive asynchronously. Select the first one (highest views).
  useEffect(() => {
    if (videos.length > 0) {
      setSelectedId(videos[0].youtubeId);
    } else {
      setSelectedId(null);
    }
  }, [videos]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!videos.length) {
    return (
      <section className="rounded-panel border border-border bg-surface p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
          <FiPlay size={22} />
        </div>

        <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
          No videos found
        </h2>

        <p className="mt-2 text-sm text-muted">
          There aren't any video recommendations for this topic yet.
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 text-sm font-semibold text-brand hover:text-brand-hover"
          >
            Try again
          </button>
        )}
      </section>
    );
  }

  const selected =
    videos.find((video) => video.youtubeId === selectedId) || videos[0];

  const otherVideos = videos.filter(
    (video) => video.youtubeId !== selected.youtubeId
  );

  return (
    <section className="min-w-0 space-y-6">
      {/* Main video player */}
      <div className="overflow-hidden rounded-panel border border-border bg-surface">
        <div className="aspect-video bg-black">
          {selected?.youtubeId ? (
            <iframe
              key={selected.youtubeId}
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${selected.youtubeId}`}
              title={selected.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white">
              Video unavailable
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {selected.title}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {selected.channelTitle}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <FiEye size={14} />
              {formatViews(selected.viewCount)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <FiClock size={14} />
              {formatDuration(selected.duration)}
            </span>
          </div>

          {selected.description && (
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">
              {selected.description}
            </p>
          )}
        </div>
      </div>

      {/* Other recommended videos */}
      {otherVideos.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-bold text-foreground">
                Recommended videos
              </h3>
              <p className="mt-1 text-xs text-muted">
                Selected based on relevance and view count
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              {otherVideos.length} videos
            </span>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {otherVideos.map((video) => {
              const isSelected = video.youtubeId === selected.youtubeId;

              return (
                <button
                  key={video.youtubeId}
                  type="button"
                  onClick={() => setSelectedId(video.youtubeId)}
                  className={`group min-w-0 overflow-hidden rounded-xl border text-left transition ${
                    isSelected
                      ? "border-brand bg-brand-wash"
                      : "border-border bg-surface hover:border-brand hover:bg-brand-wash"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-app">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand">
                        <FiPlay size={28} />
                      </div>
                    )}

                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[11px] font-medium text-white">
                      {formatDuration(video.duration)}
                    </span>

                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                      <span className="grid size-10 scale-90 place-items-center rounded-full bg-white/90 text-brand opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
                        <FiPlay size={18} fill="currentColor" />
                      </span>
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                      {video.title}
                    </h4>

                    <p className="mt-1.5 truncate text-xs text-muted">
                      {video.channelTitle}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <FiEye size={12} />
                        {formatViews(video.viewCount)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
