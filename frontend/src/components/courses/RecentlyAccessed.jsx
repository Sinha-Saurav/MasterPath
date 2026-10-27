
import {
  FiBookOpen,
  FiChevronRight,
  FiDatabase,
  FiMonitor,
} from "react-icons/fi";

const recentItems = [
  {
    id: "dsa-arrays",
    title: "Data Structures - Arrays",
    accessed: "Last accessed 2 hours ago",
    icon: FiBookOpen,
    iconStyle: "bg-brand-soft text-brand-hover",
  },
  {
    id: "dbms-sql",
    title: "DBMS - SQL Queries",
    accessed: "Last accessed 1 day ago",
    icon: FiDatabase,
    iconStyle: "bg-info/10 text-info",
  },
  {
    id: "os-scheduling",
    title: "OS - Process Scheduling",
    accessed: "Last accessed 2 days ago",
    icon: FiMonitor,
    iconStyle: "bg-success/10 text-success",
  },
];

export default function RecentlyAccessed({
  items = recentItems,
  onSelect,
  onViewAll,
}) {
  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-foreground">
          Recently Accessed
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-hover transition hover:text-brand"
        >
          View all
          <FiChevronRight size={15} />
        </button>
      </div>

      {items.length > 0 ? (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {items.map((item) => {
            const Icon = item.icon || FiBookOpen;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelect?.(item)}
                className="group flex min-w-[230px] flex-1 items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-brand/40 hover:bg-brand-wash/50 sm:min-w-0"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconStyle || "bg-brand-soft text-brand-hover"}`}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    {item.accessed}
                  </p>
                </div>

                <FiChevronRight
                  size={16}
                  className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-card bg-app px-4 py-8 text-center">
          <p className="text-sm font-semibold text-foreground">
            Nothing here yet
          </p>
          <p className="mt-1 text-xs text-muted">
            Open a course and your recent activity will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
