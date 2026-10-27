
import { useState } from "react";
import { FiPlay, FiClock, FiEye } from "react-icons/fi";

export default function TopicVideos({ videos }) {
  const [selectedId, setSelectedId] = useState(videos[0]?.id);

  const selected = videos.find((video) => video.id === selectedId);

  if (!videos.length) {
    return (
      <section className="rounded-panel border border-border bg-surface p-8 text-center">
        <h2 className="font-heading text-lg font-bold text-foreground">
          No videos found
        </h2>
        <p className="mt-2 text-sm text-muted">
          There aren't any video recommendations for this topic yet.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
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
              <div className="flex h-full items-center justify-center text-white">
                Video unavailable
              </div>
            )}
          </div>

          <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
            {selected?.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {selected?.channel}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <FiClock /> {selected?.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiEye /> {selected?.views}
            </span>
          </div>
        </div>

        <aside className="space-y-2">
          <h3 className="font-heading text-sm font-bold text-foreground">
            Up next
          </h3>

          <div className="flex gap-3 overflow-x-auto pb-2 lg:max-h-[430px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
            {videos
              .filter((video) => video.id !== selectedId)
              .map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedId(video.id)}
                  className="flex w-[250px] shrink-0 gap-3 rounded-xl border border-border p-2 text-left transition hover:border-brand hover:bg-brand-wash lg:w-full"
                >
                  <div className="relative flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft text-brand">
                    <FiPlay size={20} fill="currentColor" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
                      {video.duration}
                    </span>
                  </div>

                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-xs font-semibold text-foreground">
                      {video.title}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted">
                      {video.channel}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
