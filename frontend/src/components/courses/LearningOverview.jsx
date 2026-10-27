
import { FiBookOpen, FiTarget, FiAward, FiArrowUpRight } from "react-icons/fi";

const stats = [
  {
    label: "Enrolled Courses",
    value: "5",
    change: "1 new",
    icon: FiBookOpen,
    iconStyle: "bg-brand-soft text-brand-hover",
  },
  {
    label: "Overall Progress",
    value: "72%",
    change: "8% this week",
    icon: FiTarget,
    iconStyle: "bg-info/10 text-info",
  },
  {
    label: "Quizzes Completed",
    value: "8",
    change: "3 this week",
    icon: FiAward,
    iconStyle: "bg-warning/10 text-warning",
  },
];

export default function LearningOverview() {
  return (
    <section className="rounded-panel border border-border bg-surface p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
          Learning Overview
        </h2>
        <span className="rounded-lg bg-brand-wash px-2 py-1 text-xs font-semibold text-brand-hover">
          Your stats
        </span>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-card border border-border p-3 sm:gap-4 sm:p-4"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.iconStyle}`}
              >
                <Icon size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-heading text-xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-muted">{stat.label}</p>
              </div>

              <span className="hidden items-center gap-1 whitespace-nowrap text-[11px] font-medium text-success sm:flex">
                <FiArrowUpRight size={14} />
                {stat.change}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
